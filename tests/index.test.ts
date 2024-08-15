import * as fs from 'fs';
import { DestroyMessage, HudEvents, isSquadRelevant, parseMessage } from '../src/index';

describe('Test file parsing', () => {
    const raw = JSON.parse(fs.readFileSync('./tests/hud_events.json', 'utf-8'));
    const events = raw as HudEvents;

    const damage = {
        "id": 1,
        "msg": "-GFF7- Lukasxox (IT-1) zerstört -GFF7- CassualTux (Magach 6M)",
        "sender": "",
        "enemy": false,
        "mode": "",
        "time": 13
    }

    const expected: HudEvents = {
        "events": [],
        "damage": [damage]
    }

    test('Equality check', () => {
        expect(raw).toStrictEqual(expected);
    });
});

describe('Message parsing', () => {
    const expected: DestroyMessage = {
        killer: "-GFF7 Lukasxox",
        destroyerTank: "IT-1",

        destroyedTank: "Magach 6M",
        killed: "-GFF7 CassualTux"
    };

    test('Destroy message parsing', () => {
        expect(parseMessage("-GFF7- Lukasxox (IT-1) zerstört -GFF7- CassualTux (Magach 6M)")).toBe(expected);
    });

    test('Ignore test drive', () => {
        expect(parseMessage("-GFF7- Lukasxox (IT-1) zerstört Magach 6M")).toBeNull();
    });

    test('Ignore non destroy messages', () => {
        expect(parseMessage("=VNPAi= babyTurtle (Christian II) in Brand gesetzt [MVolk] Sam9841 (Objekt 292)")).toBeNull();
    })
});

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
