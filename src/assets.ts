const FILE_PATH = "./assets/img/vehicles"
const EXT = "png";

import groundMapping from './mappings/mappings_ground.json';
import airMapping from './mappings/mappings_air.json';
import heliMapping from './mappings/mappings_heli.json';

type Mapping = Record<string, string>;
type Vehicle = keyof Mapping;

export function findVehicleFile(vehicle: Vehicle): string | null {
    const fileName = findMapping(vehicle);
    if (fileName) {
        return `${FILE_PATH}/${fileName}.${EXT}`;
    }

    return null;
}

function findMapping(vehicle: Vehicle): string | null {
    // search ground vehicles first
    const groundName = getMapping(groundMapping, vehicle);
    if (groundName) {
        return `ground/${groundName}`;
    }

    const airName = getMapping(airMapping, vehicle);
    if (airName) {
        return `air/${airName}`;
    }

    const heliName = getMapping(heliMapping, vehicle);
    if (heliName) {
        return `heli/${heliName}`;
    }

    return null;
}

function getMapping(json: Mapping, vehicle: Vehicle): string | undefined {
    return json[vehicle];
}
