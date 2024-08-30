import { getSquadAvatar, isSquadRelevant } from "../src/team";
import * as fs from 'fs';
import { AVATAR_FILE_PATH, FILE_EXT } from "../src/assets";

const KNOWN_SQUAD_MEMBERS = [
    ["TuxCode"],
    ["Lukasxox"],
    ["nudel28"],
    ["SGTCross96"],
    ["Icefruit"],
    ["l-IlIllIIlIIllI"]
];

describe('Squad member relevance check', () => {
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
    });

    test('Console player', () => {
        expect(getSquadAvatar("⋇l-IlIllIIlIIllI")).toBe("cardicon_fem_ru_modern_01");
    });


    test.each(KNOWN_SQUAD_MEMBERS)('Squad member check (%s)', (member) => {
        expect(getSquadAvatar(member)).toBeDefined();
    });
});

// check if avatar is downloaded if defined
describe('Team avatar available', () => {
    test.each(KNOWN_SQUAD_MEMBERS)('Squad member avatar exists (%s)', async (member) => {
        const file = getSquadAvatar(member);
        if (!file) {
            // not found
            expect(false).toBeTruthy();
            return;
        }

        const path = `./src/${AVATAR_FILE_PATH}/${file}.${FILE_EXT}`
        const exists = await fs.promises.stat(path);

        expect(exists.isFile()).toBeTruthy();
    });
});
