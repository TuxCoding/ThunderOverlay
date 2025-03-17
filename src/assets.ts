// Local storage path
export const VEHICLE_FILE_PATH = "./assets/img/vehicles";
export const AVATAR_FILE_PATH = "./assets/img/avatars";

// File extension
export const FILE_EXT = "avif";

// mappings will be loaded into Javascript bundle by using resolveJSON from Typescript
import airMapping from "@Mapping/air.json";
import groundMapping from "@Mapping/ground.json";
import shipMapping from "@Mapping/ships.json";
// mapping that is different from the wiki definition
// so we don't need to modify the original files
// content is sorted by values
import specialMapping from "@Mapping/specials.json";

/**
 * Types for mapping vehicle name to file name
 * For example: 2C (from battle log) translates to fr_char_2c (that includes nation and is file system friendly)
 */
export type Mapping = Record<string, string>;

/**
 * Vehicle name from battle log
 */
type LocalizedVehicle = keyof Mapping;

/** vehicle types with their respective folders */
export enum VehicleType {
    Ground = "ground",
    Air = "air",
    Ship = "ships",
}

/**
 * Get file path or null
 * @param vehicle battle log vehicle name
 * @returns file name with extension and path or null if not existing
 */
export function findVehicleFile(vehicle: LocalizedVehicle): string | null {
    // vehicles are translated to local languages
    // some vehicles (i.e. russian) use cyrillic characters however they should not be cleaned, because then we would have duplicates
    // see T-34-85
    // RIGHT SINGLE QUOTATION MARK Ra’am Sagol -> Ra'am Sagol
    // Somehow the game uses NO-BREAK SPACE in localhost and wiki
    // Although it appears to be consistent across both
    // However the ususage is inconsistent across different vehicles like 'A6M2 mod. 11' has a normal space while 'A6M3 mod. 22' had not
    // see: 'Bf 109 F' and only used in aircraft
    const cleanVehicleName = vehicle
        // clean up crlf that somehow got into game files and are therefore used
        .replace("\r", "");

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
function findMapping(vehicle: LocalizedVehicle): string | null {
    // search ground vehicles first, because it is mostly played
    const vehicleTypes: [string, Mapping][] = [
        [VehicleType.Ground, groundMapping],
        [VehicleType.Air, airMapping],
        [VehicleType.Ship, shipMapping],
        ["", specialMapping],
    ];

    for (const vehicleType of vehicleTypes) {
        const [path, map] = vehicleType;

        const name = map[vehicle];
        if (name) {
            // UNIX file systems are case-sensitive
            const normalizedFile = name.toLowerCase();
            return path ? `${path}/${normalizedFile}` : normalizedFile;
        }
    }

    return null;
}
