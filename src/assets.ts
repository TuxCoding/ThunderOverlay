// Local storage path
export const VEHICLE_FILE_PATH = "./assets/img/vehicles";
export const AVATAR_FILE_PATH = "./assets/img/avatars";

// File extension
export const FILE_EXT = "png";

// mappings will be loaded into Javascript bundle by using resolveJSON from Typescript
import groundMapping from './mappings/mappings_ground.json';
import airMapping from './mappings/mappings_air.json';
import heliMapping from './mappings/mappings_heli.json';

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
    const fileName = findMapping(vehicle);
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
    const groundName = (groundMapping as Mapping)[vehicle];
    if (groundName) {
        return `ground/${groundName}`;
    }

    // Then lookup heli, because of the smaller size
    const heliName = (heliMapping as Mapping)[vehicle];
    if (heliName) {
        return `heli/${heliName}`;
    }

    const airName = (airMapping as Mapping)[vehicle];
    if (airName) {
        return `air/${airName}`;
    }

    return null;
}
