import { findVehicleFile } from "../src/assets";

import groundMapping from '../src/mappings/ground.json';
import airMapping from '../src/mappings/air.json';
import heliMapping from '../src/mappings/heli.json';

import specialMapping from '../src/mappings/specials.json';

describe('find vehicle', () => {
    test('Not existing vehicle', () => {
        expect(findVehicleFile('Unknown')).toBeNull();
    });

    test('Simple name', () => {
        expect(findVehicleFile('2S38')).toBe("./assets/img/vehicles/ground/ussr_2s38.png");
    });

    test('Name with space', () => {
        expect(findVehicleFile('Magach 6M')).toBe("./assets/img/vehicles/ground/il_magach_6m.png");
    });

    test('Name with dash', () => {
        expect(findVehicleFile('T-80B')).toBe("./assets/img/vehicles/ground/ussr_t_80b.png");
    });

    test("Name with quote symbol", () => {
        expect(findVehicleFile("Ra'am Sagol")).toBe("./assets/img/vehicles/ground/il_merkava_mk_3_raam_segol.png");
    });

    test("Name with parenthis", () => {
        expect(findVehicleFile("T-72AV (TURMS-T)")).toBe("./assets/img/vehicles/ground/ussr_t_72av_turms.png");
    });

    test("Name with divisor", () => {
        expect(findVehicleFile("VCC-80/30")).toBe("./assets/img/vehicles/ground/it_vcc_80_hitfist_30.png");
    });

    test("Name with dot", () => {
        expect(findVehicleFile("Merkava Mk.1B")).toBe("./assets/img/vehicles/ground/il_merkava_mk_1b.png");
    });

    test("Aircraft", () => {
        expect(findVehicleFile("Hampden TB Mk I")).toBe("./assets/img/vehicles/air/hp52_hampden_tbmk1.png");
    });

    test("Heli", () => {
        expect(findVehicleFile("UH-1B")).toBe("./assets/img/vehicles/heli/uh_1b.png");
    });

    test('Special chacter before vehicle', () => {
        // japan
        expect(findVehicleFile("▅UH-1B")).toBe("./assets/img/vehicles/heli/uh_1b_japan.png");
    });

    test('Special chacter before vehicle', () => {
        // italy
        expect(findVehicleFile("◔Mi-24D")).toBe("./assets/img/vehicles/heli/mi_24d_hungary.png");
    });

    test('Weird spacing after name', () => {
        expect(findVehicleFile("ELC bis ")).toBe("./assets/img/vehicles/ground/fr_amx_elc_bis.png");
    });

    test('Different name mapping from wiki', () => {
        expect(findVehicleFile("Abrams")).toBe("./assets/img/vehicles/ground/us_m1_abrams.png");
    });

    test('Different name mapping from wiki', () => {
        expect(findVehicleFile("Т-62")).toBe("./assets/img/vehicles/ground/cn_t_62.png");
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
            const name = (map as Record<string, string>)[vehicle];
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
