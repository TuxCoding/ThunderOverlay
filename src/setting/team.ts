import type { SquadAvatar } from "./settings";

/**
 * Team members with name -> file name
 */
let squadMembers: SquadAvatar[] = [];

// Clan tags have a symbol before and after and 5 alphanumeric chars between
// alphanumberic, _, - and spaces are allowed for names

// based on https://store.gaijin.net/profile.php?view=change_nick
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MAX_NAME_LEN = 16;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MIN_NAME_LEN = 2;

export function setSquadList(members: SquadAvatar[]) {
    squadMembers = members;
}

/**
 * Check if the message includes the name of a squad member
 * @param msg complete battle log msg
 * @returns if one squad avatar is included
 */
export function isSquadRelevant(msg: string): boolean {
    for (const member of squadMembers) {
        // use includes check to be more aggressive if message includes spaces and we could
        // check against the complete log message
        const squadName = member.username;
        if (msg.includes(squadName)) {
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
    for (const member of squadMembers) {
        if (name.endsWith(member.username)) {
            // use endsWith, because its not necessary to check with different positions
            // and it excludes clan tags in comparison to startsWith
            return member.avatar;
        }
    }

    return null;
}
