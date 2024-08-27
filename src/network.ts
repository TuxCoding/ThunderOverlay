/** War thunder API host */
const HOST = "http://localhost:8111";

/**
 * battle log events
 */
export interface HudEvents {
    /** unknown always empty */
    events: [],
    /** battle log */
    damage: Damage[]
};

export interface Damage {
    /** increasing id */
    id: number,
    /** battle log message */
    msg: string,
    /** always empty */
    sender: string,
    /** always false */
    enemy: boolean,
    /** represents squad, team, all, etc, but is always empty atm */
    mode: string,
    /** battle log timer in seconds */
    time: number
};

/**
 * Query new json response
 *
 * @param url URL location behind host name
 * @returns json or error
 */
async function query(url: string): Promise<Response> {
    // web server seems to have no support for other cache control like if-not-modified
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

/**
 * Fetch new hud event message
 *
 * @param seenEvent last event id
 * @param seenDamange last damage id
 * @returns json response or error
 */
export async function fetchHUD(seenEvent: number, seenDamange: number): Promise<HudEvents> {
    // connect
    const resp = await query(`hudmsg?lastEvt=${seenEvent}&lastDmg=${seenDamange}`);

    // fetch data
    const events = await resp.json();
    return events as HudEvents;
}
