import { DestroyMessage } from "./index";

const KNOWN_SQUAD_MEMBERS = [
    ["CassualTux", "cardicon_esport_drops"],
    ["Lukasxox", "cardicon_bundeswehr_infantryman"],
    ["nudel28", "cardicon_fem_06"],
    ["SGTCross96", "cardicon_general_06"],
    ["Icefruit", "cardicon_armored_apex_woman"],
    ["l-IlIllIIlIIllI", "cardicon_fem_ru_modern_01"],
    ["Frevbucksmaster", "cardicon_tanker_il_01"],
    ["GA x Krabbe", "cardicon_strikemaster_pilot"]
]

export function isSquadRelevant(msg: DestroyMessage): boolean {
    for (const member of KNOWN_SQUAD_MEMBERS) {
        if (msg.killer.endsWith(member[0]) || msg.killed.endsWith(member[0])) {
            return true;
        }
    }

    return false;
}

export function getSquadAvatar(name: string) {
    for (const member of KNOWN_SQUAD_MEMBERS) {
        if (name.endsWith(member[0])) {
            return member[1];
        }
    }

    return null;
}
