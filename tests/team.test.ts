import { getSquadAvatar, isSquadRelevant } from "../src/team";

describe('Squad member check', () => {
    test('relevant', () => {
        expect(isSquadRelevant("-GFF7- TuxCode (Merkava Mk.1B) zerstört [CoyC] DRAGON#28 (BMP-2)")).toBeTruthy();
    });

    test('not relevant', () => {
        expect(isSquadRelevant("-GFF7- Somebody (Merkava Mk.1B) zerstört [CoyC] DRAGON#28 (BMP-2)")).toBeFalsy();
    });
});

describe('find avatar', () => {
    test('Not a squad member', () => {
        expect(getSquadAvatar("somebody")).toBeNull();
    })

    test('Console player', () => {
        expect(getSquadAvatar("⋇l-IlIllIIlIIllI")).toBe("cardicon_fem_ru_modern_01");
    })

    const KNOWN_SQUAD_MEMBERS = [
        ["TuxCode"],
        ["Lukasxox"],
        ["nudel28"],
        ["SGTCross96"],
        ["Icefruit"],
        ["l-IlIllIIlIIllI"]
    ]

    test.each(KNOWN_SQUAD_MEMBERS)('Squad member check', (member) => {
        expect(getSquadAvatar(member)).toBeDefined();
    });
})
