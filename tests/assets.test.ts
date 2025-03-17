import { findAvatarFile, findVehicleFile } from "../src/assets";

describe('find avatar', () => {
    const KNOWN_SQUAD_MEMBERS = [
        "CassualTux",
        "Lukasxox",
        "nudel28",
        "SGTCross96",
        "Icefruit",
        "l-IlIllIIlIIllI",
    ]

    test('Not existing', () => {
        expect(findAvatarFile("somebody")).toBeNull();
    });

    for (const member of KNOWN_SQUAD_MEMBERS) {
        test('Existing', () => {
            expect(findAvatarFile(member)).toBeDefined();
        });
    }
})

describe('find vehicle', () => {
    test('Not existing vehicle', () => {
        expect(findVehicleFile('Uknown')).toBeNull();
    });

    test('Simple name', () => {
        expect(findVehicleFile('2S38')).toBe("ussr_2s38.png");
    });

    test('Name with space', () => {
        expect(findVehicleFile('Magach 6M')).toBe("il_magach_6m.png");
    });

    test('Name with dash', () => {
        expect(findVehicleFile('T-80B')).toBe("ussr_t_80b.png");
    });

    test("Name with quote symbol", () => {
        expect(findVehicleFile("Ra'am Sagol")).toBe("il_merkava_mk_3_raam_segol.png");
    });

    test("Name with parenthis", () => {
        expect(findVehicleFile("T-72AV (TURMS-T)")).toBe("ussr_t_72av_turms.png");
    });

    test("Name with divisor", () => {
        expect(findVehicleFile("VCC-80/30")).toBe("it_vcc_80_hitfist_30.png");
    });

    test("Name with underscore and dot", () => {
        expect(findVehicleFile("Merkava_Mk.1B")).toBe("il_merkava_mk_1b.png");
    });

    test('Special chacter before vehicle', () => {
        expect(findVehicleFile("◔Mi-24D")).toBe("il_merkava_mk_1b.png");
    });

    test('Special chacter before vehicle', () => {
        expect(findVehicleFile("▅UH-1B")).toBe("il_merkava_mk_1b.png");
    });
})
