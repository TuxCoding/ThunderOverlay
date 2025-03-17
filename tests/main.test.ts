import { DestroyMessage, parseMessage } from "@App/main";
import type { HudEvents } from "@App/network";
import * as fs from "fs";

describe("Test file parsing", () => {
    async function loadFile(path: string) {
        const resp = await fs.promises.readFile(
            `./tests/resources/events/${path}`,
            "utf8",
        );
        const raw = JSON.parse(resp) as HudEvents;

        return raw;
    }

    test("Simple single event", async () => {
        const damage = {
            id: 1,
            msg: "-GFF7- Somebody (IT-1) zerstört -GFF7- CassualTux (Magach 6M)",
            sender: "",
            enemy: false,
            mode: "",
            time: 13,
        };

        const expected: HudEvents = {
            events: [],
            damage: [damage],
        };

        const events = await loadFile("/simple.json");
        expect(events).toStrictEqual(expected);
    });

    test("Empty", async () => {
        const events = await loadFile("/empty.json");

        const expected: HudEvents = {
            events: [],
            damage: [],
        };

        expect(events).toStrictEqual(expected);
    });

    test("Multiple events", async () => {
        const events = await loadFile("/multiple.json");

        const expected: HudEvents = {
            events: [],
            damage: [
                {
                    id: 76,
                    msg: '=ZV0RU= ⋇MiOKO69 (Typ 90 (B) "Fuji") zerstört -HUB- jorken12 (LAV-AD)',
                    sender: "",
                    enemy: false,
                    mode: "",
                    time: 232,
                },
                {
                    id: 77,
                    msg: "=RMTS= ⋇Extaz1kk LT (BMP-2M) zerstört CorporaIRex (Christian II)",
                    sender: "",
                    enemy: false,
                    mode: "",
                    time: 234,
                },
            ],
        };

        expect(events).toStrictEqual(expected);
    });
});

describe("Message parsing", () => {
    test("Ignore suicide", () => {
        expect(
            parseMessage("╀CroDD╀ NoPrisoners_ (Q-5A/B) wurde zerstört"),
        ).toBeNull();
    });

    test("Ignore test drive", () => {
        expect(
            parseMessage("-GFF7- Lukasxox (IT-1) zerstört Magach 6M"),
        ).toBeNull();
    });

    test("Ignore non destroy messages", () => {
        expect(
            parseMessage(
                "=VNPAi= babyTurtle (Christian II) in Brand gesetzt [MVolk] Sam9841 (Objekt 292)",
            ),
        ).toBeNull();
    });

    const expected: DestroyMessage = {
        killer: "-GFF7- Somebody",
        destroyerVehicle: "IT-1",

        destroyedVehicle: "Magach 6M",
        killed: "-GFF7- CassualTux",
    };

    test("Destroy ground message parsing", () => {
        expect(
            parseMessage(
                "-GFF7- Somebody (IT-1) zerstört -GFF7- CassualTux (Magach 6M)",
            ),
        ).toStrictEqual(expected);
    });

    test("Destroy air message parsing", () => {
        expect(
            parseMessage(
                "-GFF7- Somebody (IT-1) abgeschossen -GFF7- CassualTux (Magach 6M)",
            ),
        ).toStrictEqual(expected);
    });

    test("Destroy parsing parenthesis", () => {
        const expected_parenthesis: DestroyMessage = {
            killer: "-GFF7- SGTCross96",
            destroyerVehicle: "BO 105 PAH-1",

            destroyedVehicle: "XM1 (GM)",
            killed: "sevenarchangel",
        };

        expect(
            parseMessage(
                "-GFF7- SGTCross96 (BO 105 PAH-1) zerstört sevenarchangel (XM1 (GM))",
            ),
        ).toStrictEqual(expected_parenthesis);
    });

    test("Destroy parsing parenthesis", () => {
        const expected_parenthesis2: DestroyMessage = {
            killer: "SCHIZAPHRENIK",
            destroyerVehicle: "Class 3 (P)",

            destroyedVehicle: "Strv 103С",
            killed: "[GARD6] ⋇Brotmann89",
        };

        expect(
            parseMessage(
                "SCHIZAPHRENIK (Class 3 (P)) zerstört [GARD6] ⋇Brotmann89 (Strv 103С)",
            ),
        ).toStrictEqual(expected_parenthesis2);
    });

    test("Destroy parsing parenthesis without clan", () => {
        const expect_no_clan: DestroyMessage = {
            killer: "SCHIZAPHRENIK",
            destroyerVehicle: "Class 3 (P)",

            destroyedVehicle: "Strv 103С",
            killed: "⋇Brotmann89",
        };

        expect(
            parseMessage(
                "SCHIZAPHRENIK (Class 3 (P)) zerstört ⋇Brotmann89 (Strv 103С)",
            ),
        ).toStrictEqual(expect_no_clan);
    });
});
