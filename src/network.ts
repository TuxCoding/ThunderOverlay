const HOST = "http://localhost:8111"

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

async function query(url: string): Promise<Response> {
    const response = await fetch(`${HOST}/${url}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Unexpected response code: ${response.status}`);
    }

    return response;
}

export async function fetchHUD(seenEvent: number, seenDamange: number): Promise<HudEvents> {
    const resp = await query(`hudmsg?lastEvt=${seenEvent}&lastDmg=${seenDamange}`);
    const events = await resp.json();
    return events as HudEvents;
}
