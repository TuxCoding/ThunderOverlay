import { AVATAR_FILE_PATH, FILE_EXT, findVehicleFile } from "./assets";
import { fetchHUD, type Damage } from "./network";
import { getSquadAvatar, isSquadRelevant } from "./team";

/**
 * Trigger next update iteration
 *
 * @param seenEvent last seen event id
 * @param seenDamange last seen damage id
 */
async function updateHUD(seenEvent: number, seenDamange: number) {
    try {
        const result = await fetchHUD(seenEvent, seenDamange);
        const entries = result.damage;

        let lastId = seenDamange;
        if (entries.length > 0) {
            lastId = entries[entries.length - 1].id;
            console.log(`Updating last id to ${lastId}`);
        }

        // schedule next update
        setTimeout(() => updateHUD(seenEvent, lastId), 1000);

        // handle incoming data
        handleEvents(entries);
    } catch (error) {
        if (error instanceof Error) {
            const err = error as Error;
            if (err.name == "TypeError") {
                // happens if application is not running, only minimal client or a web extension blocked it
                console.error("Unknown error: some browser extension might blocked this request or War Thunder is not running");
                console.error("Updating after 1min");

                // delay update process if not running
                setTimeout(() => updateHUD(seenEvent, seenDamange), 60 * 1000);
            } else {
                console.error(`Unknown error: ${err.name}: ${err.message}`)
            }
        } else {
            console.error(`Unknown error: ${error}`)
        }
    }
}

/** Parsed destroy message */
export interface DestroyMessage {
    /** Killer name including clan */
    killer: string,

    /** battle log destroyer vehicle */
    destroyerTank: string,
    /** battle log destroyed vehicle */
    destroyedTank: string

    /** Killed player name including clan */
    killed: string
}

export function init() {
    addErrorHandlerImg();

    // test formatting with max number of clan and player characters
    // and demonstrate initialization
    const not: Notification = {
        killer: "^12345^ 1234567890123456",
        killerAvatar: "./assets/img/avatars/cardicon_fem_06.png",

        killerTankIcon: "./assets/img/vehicles/ground/ussr_t_44_122.png",
        destroyedTank: "./assets/img/vehicles/ground/il_aml_90.png",

        killed: "by CasualTuxCode / games647"
    }

    showNotification(not);

    startUpdating();
}

function addErrorHandlerImg() {
    // restore visibility
    function restore(this: HTMLElement) {
        this.style.opacity = "1";
    }

    // Disable images if they are not found without showing browser default missing icon
    function hideImg(this: HTMLImageElement) {
        console.error(`Failed to load image for: ${this.src}`)
        this.style.opacity = "0";
    }

    // document id of flaky images
    const imgIcons = [
        "killer-tank",
        "destroyed-tank",
        "killer-avatar"
    ];

    for (const id of imgIcons) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('load', restore);
            el.onerror = hideImg;
        } else {
            console.error(`Couldn't find img element "${id}" for error handling`);
        }
    }
}

async function startUpdating() {
    // ignore first result in case we fetch the data after one match was already completed
    const events = await fetchHUD(0, 0);

    let lastId = 0;
    const entries = events.damage;
    if (entries.length > 0) {
        lastId = entries[entries.length - 1].id;
        console.log(`Setting first id to ${lastId}`);
    }

    updateHUD(0, lastId);
}

//(.* [\w]+) \(([\w ]+)\) zerstört (.* [\w]+) \(([\w ]+)\)
//const regexp = /(.[^(]+) \((.+)\) (?:zerstört|abgeschossen|bomb)? ([^(]+) \((.+)\)/g;
//const regexp = /(.* [\w]+) \((.+)\) (?:zerstört|abgeschossen|bomb)? (.+) \(([\w\- ]+)\)/g;
/** Regex matching destroyed vehicles from battle log with the following groups
 * 1 complete match
 * 2 killer name with clan
 * 3 vehicle
 * 4 player name with clan
 * 5 vehicle
 */
const regexp = /(.[^(]+) \((.+)\) (?:zerstört|abgeschossen|bomb)? ([^(]+) \((.+)\)/g;

export function parseMessage(msg: string): DestroyMessage | null {
    // convert from iterable to array
    const matches = [...msg.matchAll(regexp)];
    if (matches.length < 1) {
        // are there any matches
        return null;
    }

    const groups = matches[0];
    if (groups.length < 5) {
        // are there enough groups
        return null;
    }

    return {
        // match 0 is the complete string
        killer: groups[1],
        destroyerTank: groups[2],

        killed: groups[3],
        destroyedTank: groups[4],
    }
}

/** Queue of not delivered notifications */
const notificationQueue: Notification[] = [];

function handleEvents(events: Damage[]) {
    for (const event of events) {
        const msg = parseMessage(event.msg);
        if (!msg) {
            // not a destroy message likely an award?
            const rawMsg = event.msg;
            if (rawMsg.includes("zerstört") || rawMsg.includes("bomb") || rawMsg.includes("abgeschossen")) {
                // proof check that the regex was valid
                console.error(`Ignored msg by regex: ${rawMsg}`);
            }

            continue;
        }

        const killerAvatar = getSquadAvatar(msg.killer);

        const destroyerTank = findVehicleFile(msg.destroyerTank);
        const destroyedTank = findVehicleFile(msg.destroyedTank);
        if (!killerAvatar) {
            if (isSquadRelevant(event.msg)) {
                // Squad avatar linking failed maybe the regex included accidentally a space
                console.error(`Cannot find squad avatar (except if member got killed): ${msg.killer}`);
            }

            // not squad member - ignore
            continue;
        }

        if (!destroyerTank || !destroyedTank) {
            // missing mapping like special cases for Abrams which couldn't be extracted easily from wiki
            console.error(`Killer: ${msg.killer} with ${msg.destroyerTank}->${destroyerTank} to ${msg.destroyedTank}->${destroyedTank}`);
            continue;
        }

        const notification: Notification = {
            killer: msg.killer,
            killerAvatar: `${AVATAR_FILE_PATH}/${killerAvatar}.${FILE_EXT}`,
            killerTankIcon: destroyerTank,

            destroyedTank: destroyedTank,
            killed: msg.killed,
        };

        console.log(`New notification: ${notification}`);
        notificationQueue.push(notification);
    }

    if (notificationQueue.length > 0) {
        // trigger the notification runtime if not running yet
        startNotificationLoop();
    }
}

let notificationQueueRunning = false;

function startNotificationLoop() {
    // loop entry start loop if not running
    if (notificationQueueRunning) {
        // already running
        return;
    }

    notificationQueueRunning = true;
    console.log("Starting notification loop");
    notificationLoop();
}

function notificationLoop() {
    const lastNot = notificationQueue.pop();
    if (!lastNot) {
        // do not schedule another iteration if there are no new entries
        notificationQueueRunning = false;
        return;
    }

    console.log(`Showing notification: ${lastNot}`);
    showNotification(lastNot);
    setTimeout(() => notificationLoop(), 8 * 1000);
}

/**
 * Notification displaying from destroy msg
 */
interface Notification {
    /** killer name with clan */
    killer: string,
    /** avatar location */
    killerAvatar: string,

    /** killer vehicle location */
    killerTankIcon: string,

    /** killed player name with clan */
    killed: string,
    /** destroyed vehicle location */
    destroyedTank: string
}

function showNotification(notification: Notification) {
    const container = document.getElementById('notification');

    const killerEl = document.getElementById('killer-name');
    const killedEl = document.getElementById('killed-name');

    const killerAvatar = document.getElementById('killer-avatar') as HTMLImageElement;
    const killerTank = document.getElementById('killer-tank') as HTMLImageElement;

    const destroyedTank = document.getElementById('destroyed-tank') as HTMLImageElement;
    if (!container || !killerEl || !killedEl || !killerAvatar || !killerTank || !destroyedTank) {
        console.error("HTML elements not found");
        return;
    }

    // update document
    killerEl.textContent = notification.killer;
    killedEl.textContent = notification.killed;

    // images
    killerAvatar.src = notification.killerAvatar;

    killerTank.src = notification.killerTankIcon;
    destroyedTank.src = notification.destroyedTank;

    // delay the pop by one ms to load the image first
    setTimeout(() => popup(container, 1, 4, 2), 1);
}

/**
 * Start popup animation for the container
 *
 * @param container
 * @param startSec animation showing seconds
 * @param showSec showing seconds without any animation
 * @param endSec disappear animation
 */
function popup(container: HTMLElement, startSec: number, showSec: number, endSec: number) {
    // activate show animation and make it visible
    container.style.animation = `slide-in ${startSec}s 1`;
    // keep animation ending
    container.style.animationFillMode = "forwards";

    // start hide animation after showed it for showSec
    setTimeout(() => hide(container, endSec), showSec * 1000);
}

function hide(container: HTMLElement, hideSec: number) {
    // add the hide animation and make it invisible after it
    container.style.animation = `fade-out ${hideSec}s 1`;
    // slow start
    container.style.animationTimingFunction = "ease-in";
    // keep animation ending
    container.style.animationFillMode = "forwards";
}

/* Run update only on the site not for tests */
if (typeof document !== 'undefined') {
    init();
}
