import * as fs from 'fs';
import type { HudEvents } from './network';

import { DestroyMessage } from '../src/index';
import { parseMessage } from '../src/index';

describe('Test file parsing', () => {
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

    test('Equality check', async () => {
        const resp = await fs.promises.readFile('./tests/resources/events/simple.json', "utf8");
        const raw = JSON.parse(resp);
        const events = raw as HudEvents;

        expect(events).toStrictEqual(expected);
    });
});

describe('Message parsing', () => {
    test('Ignore suicide', () => {
        expect(parseMessage("╀CroDD╀ NoPrisoners_ (Q-5A/B) wurde zerstört")).toBeNull();
    });

    const expected: DestroyMessage = {
        killer: "-GFF7- Lukasxox",
        destroyerTank: "IT-1",

        destroyedTank: "Magach 6M",
        killed: "-GFF7- CassualTux"
    };

    test('Ignore test drive', () => {
        expect(parseMessage("-GFF7- Lukasxox (IT-1) zerstört Magach 6M")).toBeNull();
    });

    test('Ignore non destroy messages', () => {
        expect(parseMessage("=VNPAi= babyTurtle (Christian II) in Brand gesetzt [MVolk] Sam9841 (Objekt 292)")).toBeNull();
    })

    test('Destroy ground message parsing', () => {
        expect(parseMessage("-GFF7- Lukasxox (IT-1) zerstört -GFF7- CassualTux (Magach 6M)")).toStrictEqual(expected);
    });

    test('Destroy air message parsing', () => {
        expect(parseMessage("-GFF7- Lukasxox (IT-1) abgeschossen -GFF7- CassualTux (Magach 6M)")).toStrictEqual(expected);
    });

    test('Destroy bomb message parsing', () => {
        expect(parseMessage("-GFF7- Lukasxox (IT-1) bomb -GFF7- CassualTux (Magach 6M)")).toStrictEqual(expected);
    });

    const expected_parenthesis: DestroyMessage = {
        killer: "-GFF7- SGTCross96",
        destroyerTank: "BO 105 PAH-1",

        destroyedTank: "XM1 (GM)",
        killed: "sevenarchangel"
    };
    test('Destroy parsing parenthesis', () => {
        expect(parseMessage("-GFF7- SGTCross96 (BO 105 PAH-1) zerstört sevenarchangel (XM1 (GM))")).toStrictEqual(expected_parenthesis);
    });

    const expected_parenthesis2: DestroyMessage = {
        killer: "SCHIZAPHRENIK",
        destroyerTank: "Class 3 (P)",

        destroyedTank: "Strv 103С",
        killed: "[GARD6] ⋇Brotmann89"
    };
    test('Destroy parsing parenthesis', () => {
        expect(parseMessage("SCHIZAPHRENIK (Class 3 (P)) zerstört [GARD6] ⋇Brotmann89 (Strv 103С)")).toStrictEqual(expected_parenthesis2);
    });

    const expect_no_clan: DestroyMessage = {
        killer: "SCHIZAPHRENIK",
        destroyerTank: "Class 3 (P)",

        destroyedTank: "Strv 103С",
        killed: "⋇Brotmann89"
    };
    test('Destroy parsing parenthesis', () => {
        expect(parseMessage("SCHIZAPHRENIK (Class 3 (P)) zerstört ⋇Brotmann89 (Strv 103С)")).toStrictEqual(expect_no_clan);
    });

    const expect_line: DestroyMessage = {
        killer: "╀CroDD╀ NoPrisoners_",
        destroyerTank: "Q-5A/B",

        destroyedTank: "JaPz.K A2",
        killed: "⋇Einherjar1910"
    };
    test('Destroy parsing line break', () => {
        expect(parseMessage("╀CroDD╀ NoPrisoners_ (Q-5A/B\r\n) zerstört ⋇Einherjar1910 (JaPz.K A2)")).toStrictEqual(expect_line);
    });
});
