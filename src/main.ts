import { AVATAR_FILE_PATH, FILE_EXT, findVehicleFile } from "./assets";
import { fetchHUD, type Damage } from "./network";
import { getSquadAvatar, isSquadRelevant } from "./team";
import { addErrorHandlerImg, showNotification, type Notification } from "./ui";

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
        setTimeout(() => updateHUD(seenEvent, lastId), 1_000);

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
                setTimeout(() => updateHUD(seenEvent, seenDamange), 60 * 1_000);
            } else {
                console.error(`Unknown error: ${err.name}: ${err.message}`);
            }
        } else {
            console.error(`Unknown error: ${error}`);
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
        killerAvatar: "./assets/img/avatars/cardicon_fem_06.avif",

        killerTankIcon: "./assets/img/vehicles/ground/ussr_t_44_122.avif",
        destroyedTank: "./assets/img/vehicles/ground/il_aml_90.avif",

        killed: "by CasualTuxCode / games647"
    };

    showNotification(not);

    startUpdating();
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
    // clean up tabs and line breaks
    msg = msg.replace("\r", "").replace("\n", "");

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

    // groups 0 is the complete string
    const [, killer, destroyerTank, killed, destroyedTank] = groups;
    return {
        killer, destroyerTank, killed, destroyedTank
    };
}

/** Queue of not delivered notifications */
const notificationQueue: Notification[] = [];

function handleEvents(events: Damage[]) {
    for (const event of events) {
        const msg = parseMessage(event.msg);
        if (!msg) {
            // not a destroy message likely an award?
            checkRegexDetection(event.msg);
            continue;
        }

        const killerAvatar = getSquadAvatar(msg.killer);

        const destroyerTank = findVehicleFile(msg.destroyerTank);
        const destroyedTank = findVehicleFile(msg.destroyedTank);
        logFailedMappings(destroyerTank, destroyedTank, msg, killerAvatar, event.msg);

        if (!killerAvatar || !destroyerTank || !destroyedTank) {
            // not squad member - ignore or couldn't find image
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

function logFailedMappings(destroyerTank: string | null, destroyedTank: string | null, msg: DestroyMessage, killerAvatar: string | null, rawMsg: string) {
    if (!destroyerTank || !destroyedTank) {
        // missing mapping like special cases for Abrams which couldn't be extracted easily from wiki
        console.error(`Killer: ${msg.killer} with ${msg.destroyerTank}->${destroyerTank} to ${msg.killed} ${msg.destroyedTank}->${destroyedTank}`);
    }

    // Squad avatar linking failed maybe the regex included accidentally a space
    if (!killerAvatar && isSquadRelevant(rawMsg) && !getSquadAvatar(msg.killed)) {
        // if the squad member got killed it should not be logged by now
        console.error(`Cannot find squad avatar (except if member got killed): ${msg.killer}`);
    }
}

function checkRegexDetection(rawMsg: string) {
    // trigger words for destroy messages
    if (rawMsg.includes("zerstört") || rawMsg.includes("bomb") || rawMsg.includes("abgeschossen")) {
        // proof check that the regex was valid
        if (!rawMsg.includes("wurde zerstört") && !rawMsg.includes("[ai] Recon Micro")) {
            // if the message wasn't suicide or against the AI drone
            console.error(`Ignored msg by regex: ${rawMsg}`);
        }
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
    console.log("Notification loop iteration");

    const lastNot = notificationQueue.pop();
    if (!lastNot) {
        // do not schedule another iteration if there are no new entries
        notificationQueueRunning = false;
        return;
    }

    console.log(`Showing notification: ${lastNot}`);
    showNotification(lastNot);
    setTimeout(() => notificationLoop(), 10 * 1_000);
}

/* Run update only on the site not for tests */
if (typeof document !== 'undefined') {
    init();
}
