/** War Thunder API host */
const HOST = "http://localhost:8111";

/**
 * battle log events
 */
export interface HudEvents {
    /** unknown always empty */
    readonly events: [];
    /** battle log */
    readonly damage: Damage[];
}

export interface Damage {
    /** increasing id */
    readonly id: number;
    /** battle log message */
    readonly msg: string;
    /** always empty */
    readonly sender: string;
    /** always false */
    readonly enemy: boolean;
    /** represents squad, team, all, etc, but is always empty atm */
    readonly mode: string;
    /** battle log timer in seconds */
    readonly time: number;
}

const GET_METHOD = "GET";
const JSON_TYPE = "application/json";

/**
 * Query new json response
 * @param url URL location behind host name
 * @returns json or error
 */
async function query(url: string): Promise<Response> {
    // web server seems to have no support for other cache control like if-not-modified
    const response = await fetch(`${HOST}/${url}`, {
        method: GET_METHOD,
        headers: {
            Accept: JSON_TYPE,
        },
    });

    if (!response.ok) {
        throw new Error(
            `Unexpected response code: ${response.status.toLocaleString()}`,
        );
    }

    return response;
}

export interface VehicleMap {
    readonly air: Record<string, string>;
    readonly ground: Record<string, string>;
    readonly ships: Record<string, string>;
}

export interface AssetMap {
    readonly lang: string,

    readonly vehicles: VehicleMap;

    readonly groundDestroyed: string;
    readonly flightDestroyed: string;
}

/**
 * Fetch new hud event message
 * @param seenEvent last event id
 * @param seenDamange last damage id
 * @returns json response or error
 */
export async function fetchHUD(
    seenEvent: number,
    seenDamange: number,
): Promise<HudEvents> {
    const resp = await query(
        `hudmsg?lastEvt=${seenEvent}&lastDmg=${seenDamange}`,
    );

    return (await resp.json()) as HudEvents;
}

// warning: this allows file traversal
export async function loadLocalFile<T>(name: string): Promise<T> {
    const resp = await fetch(`./${name}.json`, {
        method: GET_METHOD,
        headers: {
            Accept: JSON_TYPE,
        },
    });

    return (await resp.json()) as T;
}
