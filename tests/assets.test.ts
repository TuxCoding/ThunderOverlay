import { findAvatarFile } from "./assets";

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

})
