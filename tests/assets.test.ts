import {
    LOCAL_EXT,
    findVehicleFile,
    VEHICLE_FILE_PATH,
    VehicleType,
} from "@App/lang/assets";

import specialMapping from "@Mapping/specials.json";

import * as fs from "fs";
import type { AssetMap } from "./network";

const VEHICLE_SRC_PATH = `./src/${VEHICLE_FILE_PATH}`;

const resp = fs.readFileSync(
    // use german mappings, because this is an example file that uses Cyrillic identifiers for vehicle we test against
    "./src/lang/mappings/german.json",
    "utf8",
);

const germanMapping = JSON.parse(resp) as AssetMap;

describe("find vehicle", () => {
    test("Not existing vehicle", () => {
        expect(findVehicleFile(germanMapping, "Unknown")).toBeNull();
    });

    test("Simple name", () => {
        expect(findVehicleFile(germanMapping, "2S38")).toBe(
            "./assets/img/vehicles/ground/ussr_2s38.avif",
        );
    });

    test("Name with space", () => {
        expect(findVehicleFile(germanMapping, "Magach 6M")).toBe(
            "./assets/img/vehicles/ground/il_magach_6m.avif",
        );
    });

    test("Name with dash", () => {
        expect(findVehicleFile(germanMapping, "T-80B")).toBe(
            "./assets/img/vehicles/ground/ussr_t_80b.avif",
        );
    });

    test("Name with parenthis", () => {
        expect(findVehicleFile(germanMapping, "T-72AV (TURMS-T)")).toBe(
            "./assets/img/vehicles/ground/ussr_t_72av_turms.avif",
        );
    });

    test("Name with divisor", () => {
        expect(findVehicleFile(germanMapping, "VCC-80/30 ")).toBe(
            "./assets/img/vehicles/ground/it_vcc_80_hitfist_30.avif",
        );
    });

    test("Name with dot", () => {
        expect(findVehicleFile(germanMapping, "Merkava Mk.1B")).toBe(
            "./assets/img/vehicles/ground/il_merkava_mk_1b.avif",
        );
    });

    test("Aircraft", () => {
        expect(findVehicleFile(germanMapping, "Hampden TB Mk I")).toBe(
            "./assets/img/vehicles/air/hp52_hampden_tbmk1.avif",
        );
    });

    test("Heli", () => {
        expect(findVehicleFile(germanMapping, "UH-1B")).toBe(
            "./assets/img/vehicles/air/uh_1b.avif",
        );
    });

    test("Ships", () => {
        expect(findVehicleFile(germanMapping, "Fairmile D (601)")).toBe(
            "./assets/img/vehicles/ships/uk_fairmile_d_601_616.avif",
        );
    });

    test("Special chacter before vehicle", () => {
        // japan
        expect(findVehicleFile(germanMapping, "▅UH-1B")).toBe(
            "./assets/img/vehicles/air/uh_1b_japan.avif",
        );
    });

    test("Special chacter before vehicle", () => {
        // italy
        expect(findVehicleFile(germanMapping, "◔Mi-24D")).toBe(
            "./assets/img/vehicles/air/mi_24d_hungary.avif",
        );
    });

    test("Weird spacing after name", () => {
        expect(findVehicleFile(germanMapping, "ELC bis ")).toBe(
            "./assets/img/vehicles/ground/fr_amx_elc_bis.avif",
        );
        expect(findVehicleFile(germanMapping, "C2A1 ")).toBe(
            "./assets/img/vehicles/ground/germ_leopard_c2_mexas.avif",
        );
        expect(findVehicleFile(germanMapping, "VCC-80/30 ")).toBe(
            "./assets/img/vehicles/ground/it_vcc_80_hitfist_30.avif",
        );
        expect(findVehicleFile(germanMapping, "B3C ")).toBe(
            "./assets/img/vehicles/air/saab_b3c.avif",
        );
    });

    test("Different name mapping from wiki", () => {
        expect(findVehicleFile(germanMapping, "Abrams")).toBe(
            "./assets/img/vehicles/ground/us_m1_abrams.avif",
        );
    });
});

describe("find vehicles with special names", () => {
    test("if vehicle found with non-break spaces", () => {
        expect(findVehicleFile(germanMapping, "Fw 190 D")).toBe(
            "./assets/img/vehicles/air/fw-190d-13.avif",
        );
    });

    test("if localized name is found", () => {
        expect(findVehicleFile(germanMapping, "Typ 90")).toBe(
            "./assets/img/vehicles/ground/jp_type_90.avif",
        );
        expect(findVehicleFile(germanMapping, "Objekt 292")).toBe(
            "./assets/img/vehicles/ground/ussr_object_292.avif",
        );
    });

    test("if spaces trimmed", () => {
        expect(findVehicleFile(germanMapping, "Vickers Mk. 3")).toBe(
            "./assets/img/vehicles/ground/uk_vickers_mbt_mk_3.avif",
        );
    });

    test("if quote is normalized", () => {
        expect(findVehicleFile(germanMapping, "Ra’am Sagol")).toBe(
            "./assets/img/vehicles/ground/il_merkava_mk_3_raam_segol.avif",
        );
    });

    test("if cyrillic vehicle are found", () => {
        // Warning the Cyrillic identifiers are language specific
        // they are not found in english, but in german locales for some reason
        expect(findVehicleFile(germanMapping, "Т-10М")).toBe(
            "./assets/img/vehicles/ground/ussr_t_10m.avif",
        );
    });

    test("if nuke vehicles are found", () => {
        expect(findVehicleFile(germanMapping, "☢Jaguar A")).toBe(
            "./assets/img/vehicles/air/jaguar_a.avif",
        );
        expect(findVehicleFile(germanMapping, "☢Tu-4")).toBe(
            "./assets/img/vehicles/air/tu_4.avif",
        );
        expect(findVehicleFile(germanMapping, "☢IL-28")).toBe(
            "./assets/img/vehicles/air/il_28.avif",
        );
        expect(findVehicleFile(germanMapping, "☢B-29A")).toBe(
            "./assets/img/vehicles/air/b-29.avif",
        );
        expect(findVehicleFile(germanMapping, "☢Su-7BKL")).toBe(
            "./assets/img/vehicles/air/su-7bkl.avif",
        );

        // yes really both exist
        expect(findVehicleFile(germanMapping, "☢Canberra B")).toBe(
            "./assets/img/vehicles/air/canberra_bimk6.avif",
        );
        expect(findVehicleFile(germanMapping, "☢Canberra B Mk 6")).toBe(
            "./assets/img/vehicles/air/canberra_bimk6.avif",
        );
    });

    test("if duplicate mapping", () => {
        expect(findVehicleFile(germanMapping, "Milan")).toBe(
            "./assets/img/vehicles/air/mirage_milan.avif",
        );
        // expect(findVehicleFile("Milan")).toBe("./assets/img/vehicles/ships/fr_destroyer_aigle_class_milan.avif");
    });

    test("Q-5A/B", () => {
        expect(findVehicleFile(germanMapping, "Q-5A/B\r\n")).toBe(
            "./assets/img/vehicles/air/q_5a.avif",
        );
    });
});

// not really a best practice, because it's implementation specific, but it's a automated way to verify this
describe("Special handling unnecessary", () => {
    const specialVehicleNames = Object.keys(specialMapping);

    /**
     * Check if the file is found in any mapping
     * @param vehicle vehicle identifier like the file is named
     * @returns true if found anywhere
     */
    function isFoundInDefaultMap(vehicle: string): boolean {
        const vehicleTypes: Record<string, string>[] = [
            germanMapping.vehicles.ground,
            germanMapping.vehicles.air,
            germanMapping.vehicles.ships,
        ];

        for (const map of vehicleTypes) {
            const name = map[vehicle];
            if (name) {
                return true;
            }
        }

        return false;
    }

    test.each(specialVehicleNames)(
        "if special case handling is now uncessary (%s)",
        (specialVehicleName) => {
            expect(isFoundInDefaultMap(specialVehicleName)).toBeFalsy();
        },
    );
});

let assetExtracted;
// check only one folder seems enough
const files = fs.readdirSync(`${VEHICLE_SRC_PATH}/${VehicleType.Ground}`);
if (files.length > 1) {
    // only check for avatars if at least one file except .gitkeep is downloaded
    assetExtracted = true;
}

const describeCond = assetExtracted ? describe : describe.skip;
describeCond("Vehicle image available", () => {
    async function testImageExists(assetPath: string) {
        const path = `${VEHICLE_SRC_PATH}/${assetPath}.${LOCAL_EXT}`;

        const exists = await fs.promises.stat(path);
        expect(exists.isFile()).toBeTruthy();
    }

    function merge(vehicles: [string, Record<string, string>][]) {
        let length = 0;
        for (const type of vehicles) {
            const map = type[1];
            length += Object.keys(map).length;
        }

        // pre allocate array to prevent memory allocation spam
        const mergedMap = new Array<string>(length);

        let position = 0;
        for (const type of vehicles) {
            const [prefix, map] = type;

            for (const vehicle of Object.keys(map)) {
                // unix is case-senstive
                const file = map[vehicle].toLowerCase();

                const path = `${prefix}/${file}`;
                mergedMap[position++] = path;
            }
        }

        return mergedMap;
    }

    // merge into single array with only the paths
    const vehicleTypes: [string, Record<string, string>][] = [
        [VehicleType.Ground, germanMapping.vehicles.ground],
        [VehicleType.Air, germanMapping.vehicles.air],
        [VehicleType.Ship, germanMapping.vehicles.ships]
    ];

    const mergedMap = merge(vehicleTypes);
    test.each(mergedMap)(
        "Vehicle image not downloaded (%s)",
        async (filePath) => await testImageExists(filePath),
    );

    const specialKeys = Object.entries(specialMapping);
    test.each(specialKeys)(
        "Special case image not downloaded (%s)",
        async (_, value) => {
            const vehicleType = value.type;
            const vehicleFileName = value.file;

            const filePath = `${vehicleType}/${vehicleFileName}`;
            await testImageExists(filePath);
        }
    );
});
