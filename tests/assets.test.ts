import { FILE_EXT, findVehicleFile, Mapping, VEHICLE_FILE_PATH } from "../src/assets";
import * as fs from 'fs';

import groundMapping from '../src/mappings/ground.json';
import airMapping from '../src/mappings/air.json';
import heliMapping from '../src/mappings/heli.json';

import specialMapping from '../src/mappings/specials.json';

describe('find vehicle', () => {
    test('Not existing vehicle', () => {
        expect(findVehicleFile('Unknown')).toBeNull();
    });

    test('Simple name', () => {
        expect(findVehicleFile('2S38')).toBe("./assets/img/vehicles/ground/ussr_2s38.avif");
    });

    test('Name with space', () => {
        expect(findVehicleFile('Magach 6M')).toBe("./assets/img/vehicles/ground/il_magach_6m.avif");
    });

    test('Name with dash', () => {
        expect(findVehicleFile('T-80B')).toBe("./assets/img/vehicles/ground/ussr_t_80b.avif");
    });

    test("Name with quote symbol", () => {
        expect(findVehicleFile("Ra'am Sagol")).toBe("./assets/img/vehicles/ground/il_merkava_mk_3_raam_segol.avif");
    });

    test("Name with parenthis", () => {
        expect(findVehicleFile("T-72AV (TURMS-T)")).toBe("./assets/img/vehicles/ground/ussr_t_72av_turms.avif");
    });

    test("Name with divisor", () => {
        expect(findVehicleFile("VCC-80/30")).toBe("./assets/img/vehicles/ground/it_vcc_80_hitfist_30.avif");
    });

    test("Name with dot", () => {
        expect(findVehicleFile("Merkava Mk.1B")).toBe("./assets/img/vehicles/ground/il_merkava_mk_1b.avif");
    });

    test("Aircraft", () => {
        expect(findVehicleFile("Hampden TB Mk I")).toBe("./assets/img/vehicles/air/hp52_hampden_tbmk1.avif");
    });

    test("Heli", () => {
        expect(findVehicleFile("UH-1B")).toBe("./assets/img/vehicles/air/uh_1b.avif");
    });

    test('Special chacter before vehicle', () => {
        // japan
        expect(findVehicleFile("▅UH-1B")).toBe("./assets/img/vehicles/air/uh_1b_japan.avif");
    });

    test('Special chacter before vehicle', () => {
        // italy
        expect(findVehicleFile("◔Mi-24D")).toBe("./assets/img/vehicles/air/mi_24d_hungary.avif");
    });

    test('Weird spacing after name', () => {
        expect(findVehicleFile("ELC bis ")).toBe("./assets/img/vehicles/ground/fr_amx_elc_bis.avif");
    });

    test('Different name mapping from wiki', () => {
        expect(findVehicleFile("Abrams")).toBe("./assets/img/vehicles/ground/us_m1_abrams.avif");
    });

    test('Different name mapping from wiki', () => {
        expect(findVehicleFile("T-62")).toBe("./assets/img/vehicles/ground/ussr_t_62.avif");
    });

    test('if vehicle found with non-break spaces', () => {
        expect(findVehicleFile("Fw 190 D")).toBe("./assets/img/vehicles/air/fw-190d-13.avif");
    });
});

// not really a best practice, because it's implementation specific, but it's a automated way to verify this
describe('Special handling unnecessary', () => {
    const specialVehicleNames = Object.keys(specialMapping);

    function isFoundInDefaultMap(vehicle: string): boolean {
        const vehicleTypes = [
            groundMapping,
            heliMapping,
            airMapping,
        ];

        for (const map of vehicleTypes) {
            const name = (map as Mapping)[vehicle];
            if (name) {
                return true;
            }
        }

        return false;
    }

    test.each(specialVehicleNames)('if special case handling is now uncessary (%s)', (specialVehicleName) => {
        expect(isFoundInDefaultMap(specialVehicleName)).toBeFalsy();
    });
});

describe('Vehicle image available', () => {
    // merge into single array with only the paths
    const vehicleTypes = [
        ["ground", groundMapping],
        // Then lookup heli, because of the smaller size
        ["air", heliMapping],
        ["air", airMapping],
        ["", specialMapping]
    ];

    const length = Object.keys(groundMapping).length
        + Object.keys(heliMapping).length
        + Object.keys(airMapping).length
        + Object.keys(specialMapping).length;

    // pre allocate array to prevent memory allocation spam
    const mergedMap = new Array(length);

    let position = 0;
    for (const type of vehicleTypes) {
        const [prefix, map] = type;

        for (const vehicle of Object.keys(map)) {
            const file = (map as Mapping)[vehicle];

            let path = `./src/${VEHICLE_FILE_PATH}`;
            if (prefix) {
                // folder path prefix
                path += `/${prefix}/`;
            }

            path += `/${file}.${FILE_EXT}`;
            mergedMap[position++] = path;
        }
    }

    test.each(mergedMap)('Vehicle image not downloaded (%s)', async (filePath) => {
        const exists = await fs.promises.stat(filePath);
        expect(exists.isFile()).toBeTruthy();
        return;
    });
});

