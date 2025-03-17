import { findVehicleFile } from "./assets";
import { getSquadAvatar } from "./team";

const HOST = "http://localhost:8111/"

export interface HudEvents {
    events: [],
    damage: Damage[]
};

export interface Damage {
    // increasing id
    id: number,
    // battle log message
    msg: string,
    // always empty atm
    sender: string,
    // always false atm
    enemy: boolean,
    // represents squad, team, all, etc, but is always empty atm
    mode: string,
    // battle time in seconds
    time: number
};

async function query(url: string): Promise<any> {
    const response = await fetch(HOST + url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Unexpected response code: ${response.status}`);
    }

    return await response.json();
}

async function fetchHUD(seenEvent: number, seenDamange: number): Promise<HudEvents> {
    const events = await query(`hudmsg?lastEvt=${seenEvent}&lastDmg=${seenDamange}`);
    return events as HudEvents;
}

async function updateHUD(seenEvent: number, seenDamange: number) {
    try {
        const result = await fetchHUD(seenEvent, seenDamange);
        const entries = result.damage;

        let lastId = seenDamange;
        if (entries.length > 0) {
            lastId = entries[entries.length - 1].id;
            console.log("Updating last id to " + lastId);
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
                console.error(`Uknown error: ${err.name}: ${err.message}`)
            }
        } else {
            console.error(`Uknown error: ${error}`)
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
    const not: Notification = {
        killer: "xyz",
        killerAvatar: "./assets/img/avatars/cardicon_fem_06.png",
        killerTankIcon: "./assets/img/vehicles/ussr_t_55a.png",
        destroyedTank: "./assets/img/vehicles/ussr_t_44_122.png",
        killed: "abc"
    }

    showNotification(not);
    start();
}

async function start() {
    // ignore first result in case we fetch the data after one match was already completed
    const events = await fetchHUD(0, 0);

    let lastId = 0;
    const entries = events.damage;
    if (entries.length > 0) {
        lastId = entries[entries.length - 1].id;
    }

    updateHUD(0, lastId);
}

export function parseMessage(msg: string): DestroyMessage | null {
    if (!msg.includes("zerstört")) {
        // ignore non-destroy messages
        return null;
    }

    //(.* [\w]+) \(([\w ]+)\) zerstört (.* [\w]+) \(([\w ]+)\)
    const regexp = /(.* [\w]+) \(([\w\- ]+)\) zerstört (.* [\w]+) \(([\w\- ]+)\)/g;
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

function handleEvents(events: Damage[]) {
    const notifications = [];
    for (const event of events) {
        const msg = parseMessage(event.msg);
        if (!msg) {
            continue;
        }

        const killerAvatar = getSquadAvatar(msg.killer);

        const destroyerTank = findVehicleFile(msg.destroyerTank);
        const destroyedTank = findVehicleFile(msg.destroyedTank);
        if (!killerAvatar || !destroyerTank || !destroyedTank) {
            continue;
        }

        const notification: Notification = {
            killer: msg.killer,
            killerAvatar: "./assets/img/avatar/" + killerAvatar + ".png",
            killerTankIcon: destroyerTank,
            destroyedTank: destroyedTank,
            killed: msg.killed,
        };
        notifications.push(notification);
    }
}

const notificationQueueRunning = false;

function notificationLoop() {

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

    popup(container, 3, 2);
}

function popup(container: HTMLElement, showSec: number, hideSec: number) {
    // add the animation in pause state to not start it automatically before setting our display
    container.style.animationPlayState = "paused";

    container.style.animation = `slide-in ${showSec}s 1`;

    container.style.animationPlayState = "start";
    container.style.animationFillMode = "forwards";

    // activate show animation and make it visible
    setTimeout(() => hide(container, hideSec), showSec * 1000 + 500);
}

function hide(container: HTMLElement, hideSec: number) {
    // add the hide animation and make it invisible after it
    container.style.animation = `fade-out ${hideSec}s 1`;
    container.style.animationFillMode = "forwards";
}

/* Run update only on the site */
if (typeof document !== 'undefined') {
    main();
}
