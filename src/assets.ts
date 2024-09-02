// Local storage path
export const VEHICLE_FILE_PATH = "./assets/img/vehicles";
export const AVATAR_FILE_PATH = "./assets/img/avatars";

// File extension
export const FILE_EXT = "avif";

// mappings will be loaded into Javascript bundle by using resolveJSON from Typescript
import groundMapping from './mappings/ground.json';
import airMapping from './mappings/air.json';
import heliMapping from './mappings/heli.json';

// mapping that is different from the wiki definition
// so we don't need to modify the original files
// content is sorted by values
import specialMapping from './mappings/specials.json';

/**
 * Types for mapping vehicle name to file name
 * For example: 2C (from battle log) translates to fr_char_2c (that includes nation and is file system friendly)
 */
export type Mapping = Record<string, string>;

/**
 * Vehicle name from battle log
 */
export type Vehicle = keyof Mapping;

/**
 * Get file path or null
 * @param vehicle battle log vehicle name
 * @returns file name with extension and path or null if not existing
 */
export function findVehicleFile(vehicle: Vehicle): string | null {
    // some vehicles are translated to the local language
    const cleanVehicleName = vehicle.trim()
        .replace("Typ", "Type")
        .replace("Objekt", "Object")
        .replace("Vickers Mk. ", "Vickers Mk.")
        // Somehow War Thunder uses NO-BREAK SPACE in localhost and wiki
        // Although it appears to be consistent across both
        // However the ususage is inconsistent across different vehicles like 'A6M2 mod. 11' has a normal space while 'A6M3 mod. 22' had not
        // see: 'Bf 109 F' and only used in aircraft
        .replaceAll('\u00A0', " ")
        // RIGHT SINGLE QUOTATION MARK Ra’am Sagol -> Ra'am Sagol
        .replaceAll('\u2019', "'")
        // Replace common Cyrillic / Slavonic / Slavic chars for example for ussr_t_10m
        // only used for russian vehicles and once for sw_strv_103c
        .replaceAll('\u0410', "A").replaceAll('\u0421', "C").replaceAll('\u0415', "E").replaceAll('\u041C', "M").replaceAll('\u0422', "T");
    const fileName = findMapping(cleanVehicleName);
    if (fileName) {
        // add path data if existing
        return `${VEHICLE_FILE_PATH}/${fileName}.${FILE_EXT}`;
    }

    return null;
}

/**
 * Get file from log name
 * @param vehicle battle log name
 * @returns folder name and file name if existing
 */
function findMapping(vehicle: Vehicle): string | null {
    // search ground vehicles first, because it is mostly played
    const vehicleTypes = [
        ["ground", groundMapping],
        // Then lookup heli, because of the smaller size
        ["air", heliMapping],
        ["air", airMapping],
        ["", specialMapping]
    ];

    for (const vehicleType of vehicleTypes) {
        const [path, map] = vehicleType;

        const name = (map as Mapping)[vehicle];
        if (name) {
            return path ? `${path}/${name}` : name;
        }
    }

    return null;
}
