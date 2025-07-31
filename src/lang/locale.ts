import type { AssetMap } from "@App/network";
import type { DestroyedEvent, Vehicle } from "./types";
import { findVehicleFile } from "./assets";
import { getSquadAvatar, isSquadRelevant } from "@App/setting/team";

/**
 * Regex matching destroyed vehicles from battle log with the following groups
 *
 * 1 complete match
 * 2 killer name with clan
 * 3 vehicle
 * 4 player name with clan
 * 5 vehicle
 */
const DESTROY_REGEX = "(.[^(]+) \\((.+)\\) (?:<groundDestroyed>|<planeDestroyed>) ([^(]+) \\((.+)\\)";

// NET_PLAYER_GM_HAS_DESTROYED
const SUICIDE_MSG = "has been wrecked";
const AI_DRONE_MSG = "[ai] Recon Micro";

export class LanguageService {

    readonly assetMap: AssetMap;
    readonly destroyedRegex: RegExp;

    constructor(assetMap: AssetMap) {
        this.assetMap = assetMap;

        this.destroyedRegex = this.loadTriggerWords();
    }

    /**
     * Parse battle log message if it's a destroy event
     * @param msg battle log message
     * @returns parsed destroy event or null
     */
    parseEventFromRaw(msg: string): DestroyedEvent | null {
        // convert from iterable to array
        const matches = [...msg.matchAll(this.destroyedRegex)];
        if (matches.length < 1) {
            // are there any matches
            this.checkRegexDetection(msg);
            return null;
        }

        const groups = matches[0];
        if (groups.length < 5) {
            // are there enough groups
            this.checkRegexDetection(msg);
            return null;
        }

        // groups 0 is the complete string
        const [, killer, destroyerVehicleName, killed, destroyedVehicleName] = groups;
        const destroyerVehicle = this.findVehicle(destroyerVehicleName);
        const destroyedVehicle = this.findVehicle(destroyedVehicleName);
        return {
            killer,
            destroyerVehicle,
            killed,
            destroyedVehicle,
        };
    }

    private findVehicle(localizedName: string): Vehicle {
        const assetPath = findVehicleFile(this.assetMap, localizedName);
        return {
            assetPath,
            localizedName
        };
    }

    private loadTriggerWords(): RegExp {
        const groundTrigger = this.assetMap.groundDestroyed;
        const planeTrigger = this.assetMap.flightDestroyed;

        return new RegExp(DESTROY_REGEX
            .replace("<groundDestroyed>", groundTrigger)
            .replace("<planeDestroyed>", planeTrigger), "g"
        );
    }

    /**
     * Print warning messages for missing events
     * @param rawMsg battle log message
     */
    private checkRegexDetection(rawMsg: string) {
        // trigger words for destroy messages but with spaces to exclude player names
        if (
            rawMsg.includes(` ${this.assetMap.groundDestroyed} `) ||
            rawMsg.includes(` ${this.assetMap.flightDestroyed} `)
        ) {
            // proof check that the regex was valid
            if (!rawMsg.includes(SUICIDE_MSG) && !rawMsg.includes(AI_DRONE_MSG)) {
                // if the message wasn't suicide or against the AI drone
                console.warn(`Likely falsely ignored msg by regex: ${rawMsg}`);
            }
        }
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
export function logFailedMappings(
    destroyerTank: string | null,
    destroyedTank: string | null,
    killerAvatar: string | null,
    msg: DestroyedEvent,
    rawMsg: string,
) {
    if (!destroyerTank || !destroyedTank) {
        // missing mapping like special cases for Abrams which couldn't be extracted easily from wiki
        console.error(
            `Killer: ${msg.killer}
            with '${msg.destroyerVehicle.localizedName}'->${destroyerTank}
            to ${msg.killed} '${msg.destroyedVehicle.localizedName}'->${destroyedTank}`,
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
