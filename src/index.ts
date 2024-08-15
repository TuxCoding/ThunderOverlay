import { xyz } from "./assets";

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
    const response = await fetch(HOST + query, {
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

function main() {
    update();
}

function update() {
    try {
        //updateHUD(0, 0);
    } catch (error) {
        console.error(error);
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
]

export function isSquadRelevant(msg: DestroyMessage): boolean {
    for (const member of KNOWN_SQUAD_MEMBERS) {
        if (msg.killer.includes(member) || msg.killed.includes(member)) {
            return true;
        }
    }

    return false;
}


main();
