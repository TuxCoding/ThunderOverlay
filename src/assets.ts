// Local storage path
export const VEHICLE_FILE_PATH = "./assets/img/vehicles";
export const AVATAR_FILE_PATH = "./assets/img/avatars";

// File extension
export const FILE_EXT = "png";

// mappings will be loaded into Javascript bundle by using resolveJSON from Typescript
import groundMapping from './mappings/ground.json';
import airMapping from './mappings/air.json';
import heliMapping from './mappings/heli.json';

// mapping that is different from the wiki definition
// so we don't need to modify the original files
import specialMapping from './mappings/specials.json';

/**
 * Types for mapping vehicle name to file name
 * For example: 2C (from battle log) translates to fr_char_2c (that includes nation and is file system friendly)
 */
type Mapping = Record<string, string>;

/**
 * Vehicle name from battle log
 */
type Vehicle = keyof Mapping;

/**
 * Get file path or null
 * @param vehicle battle log vehicle name
 * @returns file name with extension and path or null if not existing
 */
export function findVehicleFile(vehicle: Vehicle): string | null {
    const fileName = findMapping(vehicle.trim());
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
        ["heli", heliMapping],
        ["ground", airMapping],
        ["", specialMapping]
    ];

    for (const vehicleType of vehicleTypes) {
        const [path, map] = vehicleType;

        const name = (map as Mapping)[vehicle];
        if (name) {
            return `${path}/${name}`;
        }
    }

    return null;
}
