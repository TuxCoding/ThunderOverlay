import * as fs from 'fs';
import { DestroyMessage, HudEvents, parseMessage } from '../src/index';

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

        expect(raw).toStrictEqual(expected);
    });
});

describe('Message parsing', () => {
    const expected: DestroyMessage = {
        killer: "-GFF7- Lukasxox",
        destroyerTank: "IT-1",

        destroyedTank: "Magach 6M",
        killed: "-GFF7- CassualTux"
    };

    test('Destroy message parsing', () => {
        expect(parseMessage("-GFF7- Lukasxox (IT-1) zerstört -GFF7- CassualTux (Magach 6M)")).toStrictEqual(expected);
    });

    test('Ignore test drive', () => {
        expect(parseMessage("-GFF7- Lukasxox (IT-1) zerstört Magach 6M")).toBeNull();
    });

    test('Ignore non destroy messages', () => {
        expect(parseMessage("=VNPAi= babyTurtle (Christian II) in Brand gesetzt [MVolk] Sam9841 (Objekt 292)")).toBeNull();
    })
});
