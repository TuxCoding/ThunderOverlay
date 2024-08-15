import { DestroyMessage } from ".";

const KNOWN_SQUAD_MEMBERS = [
    "CassualTux",
    "Lukasxox",
    "nudel28",
    "SGTCross96",
    "Icefruit",
    "l-IlIllIIlIIllI",
    "Frevbucksmaster"
]

export function isSquadRelevant(msg: DestroyMessage): boolean {
    for (const member of KNOWN_SQUAD_MEMBERS) {
        if (msg.killer.includes(member) || msg.killed.includes(member)) {
            return true;
        }
    }

    return false;
}
