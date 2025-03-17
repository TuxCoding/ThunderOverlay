import { findVehicleFile } from "./assets";
import { fetchHUD, type Damage } from "./network";
import { getSquadAvatar, isSquadRelevant } from "./team";

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
        setTimeout(() => updateHUD(seenEvent, lastId), 2000);

        handleEvents(entries);
    } catch (error) {
        if (error instanceof Error) {
            const err = error as Error;
            if (err.name == "TypeError") {
                // delay update process if not running
                console.error("Unknown error: some browser extension might blocked this request or War Thunder is not running");
                console.error("Updating after 1min");
                setTimeout(() => updateHUD(seenEvent, seenDamange), 60 * 1000);
            } else {
                console.error(`Unknown error: ${err.name}: ${err.message}`)
            }
        } else {
            console.error(`Unknown error: ${error}`)
        }
    }
}

export interface DestroyMessage {
    killer: string,

    destroyerTank: string,
    destroyedTank: string

    killed: string
}

export function main() {
    addErrorHandlerImg();

    const not: Notification = {
        killer: "^12345^ 1234567890123456",
        killerAvatar: "./assets/img/avatars/cardicon_fem_06.png",
        killerTankIcon: "./assets/img/vehicles/ground/ussr_t_55a.png",
        destroyedTank: "./assets/img/vehicles/ground/ussr_t_44_122.png",
        killed: "^12345^ 1234567890123456"
    }

    showNotification(not);

    start();
}

function addErrorHandlerImg() {
    /* Disable images if they are not found */
    function restore(this: HTMLElement) {
        this.style.opacity = "1";
    }

    function hideImg(this: HTMLImageElement) {
        this.style.opacity = "0";
    }

    const killerImg = document.getElementById("killer-tank");
    if (killerImg) {
        killerImg.addEventListener('load', restore);
        killerImg.onerror = hideImg;
    }

    const destroyed = document.getElementById("destroyed-tank");
    if (destroyed) {
        destroyed.addEventListener('load', restore);
        destroyed.onerror = hideImg;
    }
}

async function start() {
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
const regexp = /(.[^(]+) \((.+)\) (?:zerstört|abgeschossen|bomb)? ([^(]+) \((.+)\)/g;

export function parseMessage(msg: string): DestroyMessage | null {
    const matches = [...msg.matchAll(regexp)];
    if (matches.length < 1) {
        return null;
    }

    const match = matches[0];
    if (match.length < 5) {
        return null;
    }

    return {
        // match 0 is the complete string
        killer: match[1],
        destroyerTank: match[2],

        killed: match[3],
        destroyedTank: match[4],
    }
}

const notifications: Notification[] = [];

function handleEvents(events: Damage[]) {
    for (const event of events) {
        const msg = parseMessage(event.msg);
        if (!msg) {
            const rawMsg = event.msg;
            if (rawMsg.includes("zerstört") || rawMsg.includes("bomb") || rawMsg.includes("abgeschossen")) {
                if (isSquadRelevant(rawMsg)) {
                    console.error(`Ignored msg: ${rawMsg}`);
                }
            }

            continue;
        }

        const killerAvatar = getSquadAvatar(msg.killer);

        const destroyerTank = findVehicleFile(msg.destroyerTank);
        const destroyedTank = findVehicleFile(msg.destroyedTank);
        if (!killerAvatar || !destroyerTank || !destroyedTank) {
            console.error(`Killer: ${msg.killer} (${killerAvatar}) with ${msg.destroyerTank}->${destroyerTank} to ${msg.destroyedTank}->${destroyedTank}`);
            continue;
        }

        const notification: Notification = {
            killer: msg.killer,
            killerAvatar: `./assets/img/avatars/${killerAvatar}.png`,
            killerTankIcon: destroyerTank,
            destroyedTank: destroyedTank,
            killed: msg.killed,
        };

        console.log(`New notification: ${notification}`);
        notifications.push(notification);
    }

    if (notifications.length > 0) {
        startNotificationLoop();
    }
}

let notificationQueueRunning = false;

function startNotificationLoop() {
    if (notificationQueueRunning) {
        // already running
        return;
    }

    console.log("Starting notification loop");
    notificationQueueRunning = true;
    notificationLoop();
}

function notificationLoop() {
    const lastNot = notifications.pop();
    if (!lastNot) {
        // do not schedule another iteration
        notificationQueueRunning = false;
        return;
    }

    console.log(`Showing notification: ${lastNot}`);
    showNotification(lastNot);
    setTimeout(() => notificationLoop(), 8 * 1000);
}

interface Notification {
    killer: string,
    killerAvatar: string,
    killerTankIcon: string,

    killed: string,
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

    killerEl.textContent = notification.killer;
    killedEl.textContent = notification.killed;

    // images
    killerAvatar.src = notification.killerAvatar;
    killerTank.src = notification.killerTankIcon;
    destroyedTank.src = notification.destroyedTank;

    // delay the pop by one ms to load the image first
    setTimeout(() => popup(container, 2, 4, 2), 1);
}

function popup(container: HTMLElement, startSec: number, showSec: number, endSec: number) {
    // activate show animation and make it visible
    container.style.animation = `slide-in ${startSec}s 1`;
    container.style.animationFillMode = "forwards";

    setTimeout(() => hide(container, endSec), showSec * 1000);
}

function hide(container: HTMLElement, hideSec: number) {
    // add the hide animation and make it invisible after it
    container.style.animation = `fade-out ${hideSec}s 1`;
    container.style.animationTimingFunction = "ease-in";
    container.style.animationFillMode = "forwards";
}

/* Run update only on the site */
if (typeof document !== 'undefined') {
    main();
}
