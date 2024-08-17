const FILE_PATH = "./assets/img/vehicles/"
const EXT = ".png";

import groundMapping from './mappings/mappings_ground.json';
import airMapping from './mappings/mappings_air.json';
import heliMapping from './mappings/mappings_heli.json';

export function findVehicleFile(vehicle: string): string | null {
    const fileName = findMapping(vehicle);
    if (fileName) {
        return FILE_PATH + fileName + EXT;
    }

    return null;
}

function findMapping(vehicle: string): string | null {
    // search ground vehicles first
    const groundName = convertToMap(groundMapping).get(vehicle);
    if (groundName) {
        return "ground/" + groundName;
    }

    const airName = convertToMap(airMapping).get(vehicle);
    if (airName) {
        return "air/" + airName;
    }

    const heliName = convertToMap(heliMapping).get(vehicle);
    if (heliName) {
        return "heli/" + heliName;
    }

    return null;
}

function convertToMap(json: Record<string, string>): Map<string, string> {
    const map = new Map<string, string>(Object.entries(json));
    return map;
}
