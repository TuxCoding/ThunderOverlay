/** War thunder API host */
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

export interface SquadAvatar {
    readonly username: string;
    readonly avatar: string;
}

export enum EventSource {
    Me,
    Squad,
    Team,
    Enemy,
}

export interface SoundSetting {
    readonly file: string;
    readonly volume: number;
}

export interface EventTrigger {
    readonly event: string;
    readonly src: EventSource;

    readonly layout?: string;
    readonly sound?: SoundSetting[];
}

export interface Settings {
    readonly lang: string;

    readonly squad: SquadAvatar[];
    readonly events: EventTrigger[];
}

/**
 * Load current settings file
 * @returns current settings
 */
export async function loadSettingsFile(): Promise<Settings> {
    const resp = await fetch("./settings.json", {
        method: GET_METHOD,
        headers: {
            Accept: JSON_TYPE,
        },
    });

    return (await resp.json()) as Settings;
}

export interface AssetMap {
    readonly air: Record<string, string>;
    readonly ground: Record<string, string>;
    readonly ships: Record<string, string>;
}

/**
 *
 */
export async function loadLang(lang: string) {
    const resp = await fetch(`./mappings/${lang}.json`, {
            method: GET_METHOD,
            headers: {
                Accept: JSON_TYPE,
            },
    });

    return (await resp.json()) as AssetMap;
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
    // connect
    const resp = await query(
        `hudmsg?lastEvt=${seenEvent}&lastDmg=${seenDamange}`,
    );

    // fetch data
    return (await resp.json()) as HudEvents;
}
