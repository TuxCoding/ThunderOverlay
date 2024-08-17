import { findVehicleFile } from "../src/assets";


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

    test("Name with underscore and dot", () => {
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
})
