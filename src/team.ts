/**
 * Team members with name -> file name
 */
const KNOWN_SQUAD_MEMBERS = [
    ["CassualTux", "cardicon_esport_drops"],
    ["Lukasxox", "cardicon_bundeswehr_infantryman"],
    ["nudel28", "cardicon_fem_06"],
    ["SGTCross96", "cardicon_general_06"],
    ["Icefruit", "cardicon_armored_apex_woman"],
    ["l-IlIllIIlIIllI", "cardicon_fem_ru_modern_01"],
    ["Frevbucksmaster", "cardicon_tanker_il_01"],
    ["GA x Krabbe", "cardicon_strikemaster_pilot"],
    ["-SKTro- Ratten_pt", "cardicon_tanker_ger_08"]
]

// Clan tags have a symbol before and after and 5 alphanumeric chars between
// alphanumberic, _, - and spaces are allowed for names

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MAX_NAME_LEN = 16;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MIN_NAME_LEN = 2;

/**
 * Check if the message includes the name of a squad member
 * @param msg complete battle log msg
 * @returns if one squad avatar is included
 */
export function isSquadRelevant(msg: string): boolean {
    for (const member of KNOWN_SQUAD_MEMBERS) {
        // use includes check to be more aggressive if message includes spaces and we could
        // check against the complete log message
        if (msg.includes(member[0])) {
            return true;
        }
    }

    return false;
}

/**
 * Get squad avatar file name
 * @param name squad member with clan
 * @returns avatar file name or null
 */
export function getSquadAvatar(name: string): string | null {
    for (const member of KNOWN_SQUAD_MEMBERS) {
        if (name.endsWith(member[0])) {
            // use endsWith, because its not necessary to check with different positions
            return member[1];
        }
    }

    return null;
}
