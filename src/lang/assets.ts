// Local storage path
export const VEHICLE_FILE_PATH = "./assets/img/vehicles";
export const AVATAR_FILE_PATH = "./assets/img/avatars";

// File extension
export const LOCAL_EXT = "avif";

import { type AssetMap } from "@App/network";
// mappings will be loaded into Javascript bundle by using resolveJSON from Typescript

/**
 * Types for mapping vehicle name to file name
 * For example: 2C (from battle log) translates to fr_char_2c (that includes nation and is file system friendly)
 */
export type Mapping = Record<string, string>;

/**
 * Vehicle name from battle log like "Panzerbefehlswagen VI (P)"
 */
type LocalizedVehicle = keyof Mapping;

/** vehicle types with their respective folders */
export enum VehicleType {
    Ground = "ground",
    Air = "air",
    Ship = "ships",
}

// mapping that is different from the wiki definition
// so we don't need to modify the original files
// content is sorted by
interface SpecialLocation {
    type: VehicleType,
    file: string
}

export type SpecialMap = Record<string, SpecialLocation>
import specialMapping from "@Mapping/specials.json";



/**
 * Get file path or null
 * @param vehicle localized battle log vehicle name
 * @returns file name with extension and path or null if not existing
 */
export function findVehicleFile(assetMap: AssetMap, vehicle: LocalizedVehicle): string | null {
    // vehicles are translated to local languages
    // some vehicles (i.e. russian) use cyrillic characters.
    // however they should not be cleaned, because then we would have duplicates see for example T-34-85
    // RIGHT SINGLE QUOTATION MARK Ra’am Sagol -> Ra'am Sagol
    // Somehow the game uses NO-BREAK SPACE in localhost and wiki
    // Although it appears to be consistent across both
    // However the usuage is inconsistent across different vehicles like 'A6M2 mod. 11' has a normal space while 'A6M3 mod. 22' had not
    // see: 'Bf 109 F' and only used in aircraft
    const cleanVehicleName = vehicle
        // clean up crlf that somehow got into game files and are therefore used
        .replace("\r", "");

    const fileName = findLocalMapping(assetMap, cleanVehicleName);
    if (fileName) {
        // add path data if existing
        return `${VEHICLE_FILE_PATH}/${fileName}`;
    }

    return null;
}

/**
 * Get file from log name
 * @param vehicle localized vehicle name
 * @returns folder name and file name if existing
 */
function findLocalMapping(assetMap: AssetMap, vehicle: LocalizedVehicle): string | null {
    const mapping = findMapping(assetMap, vehicle);
    if (mapping) {
        const [typeFolder, normalizedFileName] = mapping;

        const fullFileName = normalizedFileName + "." + LOCAL_EXT;
        return typeFolder ? `${typeFolder}/${fullFileName}` : fullFileName;
    }

    return null;
}

const REMOTE_HOST = "https://static.encyclopedia.warthunder.com";
const REMOTE_PATH = "images";
const REMOTE_EXT = "png";

/**
 * Find address to vehicle image for a given localized vehicle name
 * @param vehicle localized vehicle name
 * @returns full path to vehicle file
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findRemoteMapping(assetMap: AssetMap, vehicle: LocalizedVehicle): string | null {
    const mapping = findMapping(assetMap, vehicle);
    if (mapping) {
        // images are organized here in a flatten folder structure
        const [, normalizedFileName] = mapping;
        return `${REMOTE_HOST}/${REMOTE_PATH}/${normalizedFileName}.${REMOTE_EXT}`;
    }

    return null;
}

/**
 * Find type and normalized vehicle identifier for a given localized vehicle name
 * @param searchVehicle localized vehicle name
 * @returns vehicle type and vehicle identifier in an array
 */
function findMapping(assetMap: AssetMap, searchVehicle: LocalizedVehicle) {
    // search ground vehicles first, because it is mostly played
    const vehicleTypes: [string, Mapping][] = [
        [VehicleType.Ground, assetMap.vehicles.ground],
        [VehicleType.Air, assetMap.vehicles.air],
        [VehicleType.Ship, assetMap.vehicles.ships],
    ];

    for (const vehicleType of vehicleTypes) {
        const [pathType, map] = vehicleType;

        const name = map[searchVehicle];
        if (name) {
            // UNIX file systems are case-sensitive
            const normalizedFileName = name.toLowerCase();
            return [pathType, normalizedFileName];
        }
    }

    const specialMap = specialMapping as SpecialMap;
    for (const specialVehicleName in specialMap) {
        if (specialVehicleName === searchVehicle) {
            const vehicleType = specialMap[specialVehicleName].type;
            const vehicleFileName = specialMap[specialVehicleName].file.toLowerCase();

            return [vehicleType, vehicleFileName];
        }
    }

    return null;
}
