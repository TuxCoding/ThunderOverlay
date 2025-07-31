import { AVATAR_FILE_PATH, LOCAL_EXT } from "@App/lang/assets";
import { getSquadAvatar, isSquadRelevant, setSquadList } from "@App/setting/team";
import * as fs from "fs";

const KNOWN_SQUAD_MEMBERS = [
    {username: "TuxCode", avatar: "cardicon_esport_drops"},
    {username: "Lukasxox", avatar: "cardicon_bundeswehr_infantryman"},
    {username: "nudel28", avatar: "cardicon_fem_06"},
    {username: "l-IlIllIIlIIllI", avatar: "cardicon_general_06"},
];

beforeAll(() => {
    setSquadList(KNOWN_SQUAD_MEMBERS);
});

describe("Squad member relevance check", () => {
    test("relevant (squad member involved)", () => {
        expect(
            isSquadRelevant(
                "-GFF7- TuxCode (Merkava Mk.1B) zerstört [CoyC] DRAGON#28 (BMP-2)",
            ),
        ).toBeTruthy();
    });

    test("not relevant (squad member not involved)", () => {
        expect(
            isSquadRelevant(
                "-GFF7- Somebody (Merkava Mk.1B) zerstört [CoyC] DRAGON#28 (BMP-2)",
            ),
        ).toBeFalsy();
    });
});

describe("find avatar", () => {
    test("Not a squad member", () => {
        expect(getSquadAvatar("somebody")).toBeNull();
    });

    test("Console player", () => {
        expect(getSquadAvatar("⋇l-IlIllIIlIIllI")).toBe(
            "cardicon_general_06",
        );
    });

    test.each(KNOWN_SQUAD_MEMBERS)("Squad member check (%s)", (member) => {
        // verify each player has avatar defined in source
        expect(getSquadAvatar(member.username)).toBeDefined();
    });
});

// check whether avatar are downloaded if defined
const AVATAR_SRC_PATH = `./src/${AVATAR_FILE_PATH}`;

let assetExtracted;
const files = fs.readdirSync(AVATAR_SRC_PATH);
if (files.length > 1) {
    // only check for avatars if at least one file except .gitkeep is downloaded
    assetExtracted = true;
}

const describeCond = assetExtracted ? describe : describe.skip;
describeCond("Team avatar available", () => {
    test.each(KNOWN_SQUAD_MEMBERS)(
        "Squad member avatar exists (%s)",
        async (member) => {
            const file = getSquadAvatar(member.username);
            if (!file) {
                // not defined in source
                fail("avatar not defined?");
            }

            const path = `${AVATAR_SRC_PATH}/${file}.${LOCAL_EXT}`;
            const exists = await fs.promises.stat(path);

            expect(exists.isFile()).toBeTruthy();
        },
    );
});
