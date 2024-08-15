const HOST = "http://localhost:8111/"

export type HudEvents = {
    events: Events[],
    damage: Damage[]
};

export type Events = {
    // unknown
};

export type Damage = {
    id: number,
    msg: string,
    sender: string,
    enemy: boolean,
    mode: string,
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

async function updateHUD(seenEvent: number, seenDamange: number): Promise<HudEvents> {
    const json = await query(`hudmsg?lastEvt=${seenEvent}&lastDmg=${seenDamange}`);

    const result = json as HudEvents;
    return result;
}

export type DestroyMessage = {
    killer: string,

    destroyerTank: string,
    destroyedTank: string

    killed: string
}

export function main() {
    update(0, 0);
}

async function update(seenEvent: number, seenDamange: number) {
    try {
        const events = await updateHUD(0, seenDamange);
        const entries = events.damage;

        let lastId = seenDamange;
        if (entries.length > 0) {
            lastId = entries[entries.length - 1].id;
            console.log("Updating last id to " + lastId);
        }

        // schedule next update
        setTimeout(() => update(seenEvent, lastId), 5000);
    } catch (error) {
        if (error instanceof Error) {
            const err = error as Error;
            if (err.name == "TypeError") {
                // delay update process if not running
                console.error("Unknown error: some browser extension might blocked this request or War Thunder is not running");
                console.error("Updating after 1min");
                setTimeout(() => update(seenEvent, seenDamange), 60 * 1000);
            }
        }
    }
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

const KNOWN_SQUAD_MEMBERS = [
    "CassualTux",
    "Lukasxox",
    "nudel28",
    "SGTCross96",
    "Icefruit",
    "l-IlIllIIlIIllI",
    "Frevbucksmaster"
]

export function isSquadRelevant(msg: DestroyMessage): boolean {
    for (const member of KNOWN_SQUAD_MEMBERS) {
        if (msg.killer.includes(member) || msg.killed.includes(member)) {
            return true;
        }
    }

    return false;
}
