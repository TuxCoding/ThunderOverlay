import { DestroyMessage } from "../src/index";
import { isSquadRelevant } from "../src/team";

describe('Squad member check', () => {
    const otherPlayerMsg: DestroyMessage = {
        killer: "-GFF7- somebody",
        destroyerTank: "▄F-5E",
        destroyedTank: "ZSU-23-4M",
        killed: "[CoyC] DRAGON#28"
    }
    test('Not relevant', () => {
        expect(isSquadRelevant(otherPlayerMsg)).toBe(false);
    })

    const consolePlayerMsg: DestroyMessage = {
        killer: "-GFF7- ⋇l-IlIllIIlIIllI",
        destroyerTank: "▄F-5E",
        destroyedTank: "ZSU-23-4M",
        killed: "[CoyC] DRAGON#28"
    }
    test('Console player', () => {
        expect(isSquadRelevant(consolePlayerMsg)).toBe(true);
    })

    const squadKiller: DestroyMessage = {
        killer: "-GFF7- nudel28",
        destroyerTank: "▄F-5E",
        destroyedTank: "ZSU-23-4M",
        killed: "[CoyC] DRAGON#28"
    }
    test('Squad destroyed somebody', () => {
        expect(isSquadRelevant(squadKiller)).toBe(true);
    })

    const squadKillerDestroyed: DestroyMessage = {
        killer: "-GFF7- somebody",
        destroyerTank: "▄F-5E",
        destroyedTank: "ZSU-23-4M",
        killed: "[CoyC] nudel28"
    }
    test('Squad got destroyed', () => {
        expect(isSquadRelevant(squadKillerDestroyed)).toBe(true);
    })
});
