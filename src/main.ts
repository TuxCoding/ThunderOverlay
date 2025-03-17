import { AVATAR_FILE_PATH, FILE_EXT, findVehicleFile } from "@App/assets";
import { DESTROY_TYPE } from "@App/lang";
import { type Damage, fetchHUD, loadLocale, Settings } from "@App/network";
import { getSquadAvatar, isSquadRelevant } from "@App/team";
import {
    addErrorHandlerImg,
    type Notification,
    showNotification,
} from "@App/ui";

import defaultSettings from "@App/settings.json";

// time in ms
const UPDATE_TIME = 1_000;
const FAIL_UPDATE_TIME = 60 * 1_000;

/**
 * Trigger next update iteration
 * @param seenEvent last seen event id
 * @param seenDamange last seen damage id
 */
async function updateHUD(seenEvent: number, seenDamange: number) {
    try {
        const result = await fetchHUD(seenEvent, seenDamange);
        const entries = result.damage;

        let lastId = seenDamange;
        if (entries.length !== 0) {
            lastId = entries[entries.length - 1].id;
            console.debug(`Updating last id to ${lastId}`);
        }

        // schedule next update
        setTimeout(() => {
            updateHUD(seenEvent, lastId).catch(console.error);
        }, UPDATE_TIME);

        // handle incoming data
        handleEvents(entries);
    } catch (error) {
        if (error instanceof Error) {
            const err: Error = error;
            if (err.name === "TypeError") {
                // happens if application is not running, only minimal client or a web extension blocked it
                console.warn(
                    "Unknown error: some browser extension might blocked this request or War Thunder is not running",
                );
                console.warn(
                    `Updating after ${FAIL_UPDATE_TIME / 60 / 1_000} minute(s)`,
                );

                // delay update process if not running
                setTimeout(() => {
                    updateHUD(seenEvent, seenDamange).catch(console.error);
                }, FAIL_UPDATE_TIME);
            } else {
                console.error(`Unknown error: ${err.name}: ${err.message}`);
            }
        } else {
            console.error("Unknown error: ", error);
        }
    }
}

/** Parsed destroy message */
export interface DestroyMessage {
    /** Killer name including clan */
    readonly killer: string;

    /** battle log destroyer vehicle */
    readonly destroyerVehicle: string;
    /** battle log destroyed vehicle */
    readonly destroyedVehicle: string;

    /** Killed player name including clan */
    readonly killed: string;
}

/**
 * Initialize project / main entry-
 */
function init() {
    addErrorHandlerImg();

    // test formatting with max number of clan and player characters
    // and demonstrate initialization
    const not: Notification = {
        killer: "^GFF7^ TuxCode",
        killerAvatar: "./assets/img/avatars/cardicon_fem_06.avif",

        killerTankIcon: "./assets/img/vehicles/ground/il_merkava_mk_3b.avif",
        destroyedTank: "./assets/img/vehicles/ground/ussr_t_90a.avif",

        killed: "^GFF7^ Somebody",
    };

    // delay it slightly to relax demand on initialization
    setTimeout(() => showNotification(not), 1_000);

    loadSettings().catch(console.error);

    startUpdating().catch((err) => {
        console.error("Failed to start updating", err);
    });
}

/**
 * Load project settings
 * @returns settings file
 */
async function loadSettings(): Promise<Settings> {
    const currentProtocol = document.location.protocol;
    if (currentProtocol === "file:") {
        console.warn("Loading default settings, because of file protocol");

        // load only the embedded default settings if loaded with the browser
        return defaultSettings as Settings;
    }

    // CORS in OBS is disabled by using a different protocol
    return await loadLocale();
}

/**
 * Start Updating loop
 */
async function startUpdating() {
    // ignore first result in case we fetch the data after one match was already completed
    const events = await fetchHUD(0, 0);

    let lastId = 0;
    const entries = events.damage;
    if (entries.length !== 0) {
        lastId = entries[entries.length - 1].id;
        console.log(`Setting first id to ${lastId}`);
    }

    updateHUD(0, lastId).catch(console.error);
}

/**
 * Regex matching destroyed vehicles from battle log with the following groups
 *
 * 1 complete match
 * 2 killer name with clan
 * 3 vehicle
 * 4 player name with clan
 * 5 vehicle
 */
const DESTROY_MSG_REGEX =
    /(.[^(]+) \((.+)\) (?:zerstört|abgeschossen) ([^(]+) \((.+)\)/g;

/**
 * Parse battle log message if it's a destroy event
 * @param msg battle log message
 * @returns parsed destroy event or null
 */
export function parseMessage(msg: string): DestroyMessage | null {
    // convert from iterable to array
    const matches = [...msg.matchAll(DESTROY_MSG_REGEX)];
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
    const [, killer, destroyerVehicle, killed, destroyedVehicle] = groups;
    return {
        killer,
        destroyerVehicle,
        killed,
        destroyedVehicle,
    };
}

/** Queue of not delivered notifications */
const notificationQueue: Notification[] = [];

/**
 * Handle events for users
 * @param events parsed battle log events
 */
function handleEvents(events: Damage[]) {
    for (const event of events) {
        const msg = parseMessage(event.msg);
        if (!msg) {
            // not a destroy message likely an award?
            checkRegexDetection(event.msg);
            continue;
        }

        const killerAvatar = getSquadAvatar(msg.killer);

        const destroyerTank = findVehicleFile(msg.destroyerVehicle);
        const destroyedTank = findVehicleFile(msg.destroyedVehicle);
        logFailedMappings(
            destroyerTank,
            destroyedTank,
            killerAvatar,
            msg,
            event.msg,
        );

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

        console.log("New notification:", notification);
        notificationQueue.push(notification);
    }

    if (notificationQueue.length !== 0) {
        // trigger the notification runtime if not running yet
        startNotificationLoop();
    }
}

/**
 * Check if data extraction failed or any files were not available
 * @param destroyerTank killer vehicle
 * @param destroyedTank destroyed vehicle
 * @param killerAvatar avatar
 * @param msg parsed message
 * @param rawMsg unparsed battle log message
 */
function logFailedMappings(
    destroyerTank: string | null,
    destroyedTank: string | null,
    killerAvatar: string | null,
    msg: DestroyMessage,
    rawMsg: string,
) {
    if (!destroyerTank || !destroyedTank) {
        // missing mapping like special cases for Abrams which couldn't be extracted easily from wiki
        console.error(
            `Killer: ${msg.killer} with '${msg.destroyerVehicle}'->${destroyerTank} to ${msg.killed} '${msg.destroyedVehicle}'->${destroyedTank}`,
        );
    }

    // Squad avatar linking failed maybe the regex included accidentally a space
    if (
        !killerAvatar &&
        isSquadRelevant(rawMsg) &&
        !getSquadAvatar(msg.killed)
    ) {
        // if the squad member got killed it should not be logged by now
        console.error(`Cannot find squad avatar: ${msg.killer}`);
    }
}

const SUICIDE_MSG = "wurde zerstört";
const AI_DRONE_MSG = "[ai] Recon Micro";

/**
 * Print warning messages for missing events
 * @param rawMsg battle log message
 */
function checkRegexDetection(rawMsg: string) {
    // trigger words for destroy messages but with spaces to exclude player names
    if (
        rawMsg.includes(` ${DESTROY_TYPE.GROUND_DESTROYED} `) ||
        rawMsg.includes(` ${DESTROY_TYPE.BOMB_DESTROYED} `) ||
        rawMsg.includes(` ${DESTROY_TYPE.PLANE_DESTROYED} `)
    ) {
        // proof check that the regex was valid
        if (!rawMsg.includes(SUICIDE_MSG) && !rawMsg.includes(AI_DRONE_MSG)) {
            // if the message wasn't suicide or against the AI drone
            console.warn(`Ignored msg by regex: ${rawMsg}`);
        }
    }
}

let notificationQueueRunning = false;

/**
 * Trigger the notification loop if not running
 */
function startNotificationLoop() {
    // loop entry start loop if not running
    if (notificationQueueRunning) {
        // already running
        return;
    }

    notificationQueueRunning = true;
    console.debug("Starting notification loop");
    notificationLoop();
}

const NOTIFICATION_SHOW_INTERVAL = 10 * 1_000;

/**
 * Runtime loop for showing the next notification
 */
function notificationLoop() {
    console.debug("Notification loop iteration");

    const lastNot = notificationQueue.pop();
    if (!lastNot) {
        // do not schedule another iteration if there are no new entries
        notificationQueueRunning = false;
        return;
    }

    console.debug("Showing notification: ", lastNot);
    showNotification(lastNot);
    setTimeout(notificationLoop, NOTIFICATION_SHOW_INTERVAL);
}

/* Run update only on the site not for tests */
if (typeof document !== "undefined") {
    void init();
}
