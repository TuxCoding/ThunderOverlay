const HOST = "http://localhost:8111/"

export type HudEvents = {
    events: Events[],
    damage: Damage[]
};

export type Events = {
    // unknown
};

export type Damage = {
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

        showNotification(entries);
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

export type DestroyMessage = {
    killer: string,

    destroyerTank: string,
    destroyedTank: string

    killed: string
}

export function main() {
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
    return {
        killer: "",
        destroyerTank: "",
        destroyedTank: "",
        killed: ""
    }
}

function showNotification(events: Damage[]) {

}
