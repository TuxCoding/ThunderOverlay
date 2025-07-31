
import {
    type AssetMap,
    type Damage,
    fetchHUD
} from "@App/network";
import { getSquadAvatar, setSquadList } from "@App/setting/team";
import {
    addNotification,
    type Notification,
} from "@App/ui";
import type { Settings } from "@App/setting/settings";
import { LanguageService, logFailedMappings } from "@App/lang/locale";
import { AVATAR_FILE_PATH, LOCAL_EXT } from "@App/lang/assets";

let langService: LanguageService;

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

export async function startUpdatingLoop(setting: Settings, assetMap: AssetMap) {
    langService = new LanguageService(assetMap);
    setSquadList(setting.squad);

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
 * Handle events for users
 * @param events parsed battle log events
 */
function handleEvents(events: Damage[]) {
    for (const event of events) {
        const destroyEvent = langService.parseEventFromRaw(event.msg);
        if (!destroyEvent) {
            // not a destroy message likely an award?
            return;
        }

        const killerAvatar = getSquadAvatar(destroyEvent.killer);
        const destroyerTank = destroyEvent.destroyerVehicle.localizedName;
        const destroyedTank = destroyEvent.destroyedVehicle.localizedName;

        logFailedMappings(destroyerTank, destroyedTank, killerAvatar, destroyEvent, event.msg);

        if (!killerAvatar || !destroyerTank || !destroyedTank) {
            // not squad member - ignore or couldn't find image
            return;
        }

        const notification: Notification = {
            killer: destroyEvent.killer,
            killerAvatar: `${AVATAR_FILE_PATH}/${killerAvatar}.${LOCAL_EXT}`,
            killerTankIcon: destroyerTank,

            destroyedTank: destroyedTank,
            killed: destroyEvent.killed,
        };

        console.log("New notification:", notification);
        addNotification(notification);
    }
}

