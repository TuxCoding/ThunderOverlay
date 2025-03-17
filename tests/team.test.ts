import { DestroyMessage } from "../src/index";
import { getSquadAvatar, isSquadRelevant } from "../src/team";

describe('Squad member check', () => {
    const otherPlayerMsg: DestroyMessage = {
        killer: "-GFF7- somebody",
        destroyerTank: "▄F-5E",
        destroyedTank: "ZSU-23-4M",
        killed: "[CoyC] DRAGON#28"
    }
    test('Not relevant', () => {
        expect(isSquadRelevant(otherPlayerMsg)).toBeFalsy();
    })

    const consolePlayerMsg: DestroyMessage = {
        killer: "-GFF7- ⋇l-IlIllIIlIIllI",
        destroyerTank: "▄F-5E",
        destroyedTank: "ZSU-23-4M",
        killed: "[CoyC] DRAGON#28"
    }
    test('Console player', () => {
        expect(isSquadRelevant(consolePlayerMsg)).toBeTruthy();
    })

    const squadKiller: DestroyMessage = {
        killer: "-GFF7- nudel28",
        destroyerTank: "▄F-5E",
        destroyedTank: "ZSU-23-4M",
        killed: "[CoyC] DRAGON#28"
    }
    test('Squad destroyed somebody', () => {
        expect(isSquadRelevant(squadKiller)).toBeTruthy();
    })

    const squadKillerDestroyed: DestroyMessage = {
        killer: "-GFF7- somebody",
        destroyerTank: "▄F-5E",
        destroyedTank: "ZSU-23-4M",
        killed: "[CoyC] nudel28"
    }
    test('Squad got destroyed', () => {
        expect(isSquadRelevant(squadKillerDestroyed)).toBeTruthy();
    })
});

describe('find avatar', () => {
    test('Not existing', () => {
        expect(getSquadAvatar("somebody")).toBeNull();
    });

    const KNOWN_SQUAD_MEMBERS = [
        ["CassualTux"],
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
