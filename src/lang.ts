// plane killed: shot down / NET_UNIT_KILLED_FM
// heli killed: shot down / NET_UNIT_KILLED_FM

// tank killed: destroyed / NET_UNIT_KILLED_GM
// boat killed: destroyed / NET_UNIT_KILLED_GM
// ship killed: destroyed / NET_UNIT_KILLED_GM
export enum DESTROY_TYPE {
    // NET_UNIT_KILLED_FM
    PLANE_DESTROYED = "abgeschossen",
    // NET_UNIT_KILLED_GM
    GROUND_DESTROYED = "zerstört",
    // TODO: was used once?
    BOMB_DESTROYED = "bomb",
    // NET_PLAYER_GM_HAS_DESTROYED
    SELFKILL_GROUND = "NET_PLAYER_GM_HAS_DESTROYED",
    // NET_PLAYER_HAS_CRASHED
    SELFKILL_AIR = "NET_PLAYER_HAS_CRASHED",
}

/**
 *
 *
 * ui.csv
 */
export enum Types {
    FIRE = "NET_UNIT_CRITICAL_HIT_BURN",
    CRIT = "NET_UNIT_CRITICAL_HIT",
    SEVERE = "NET_UNIT_SEVERE_DAMAGE",
    QUIT_GAME = "NET_PLAYER_DISCONNECT_FROM_GAME",
    QUIT_BATTLE = "NET_PLAYER_QUIT_FROM_GAME",
}

/**
 * Awards printed to the battle log. The descriptions of each can be retrieved from:
 * https://wiki.warthunder.com/Awards
 *
 * unlocks_streaks.csv
 */
export enum Awards {
    // match
    AccordingIntelligence = "global_destroy_enemy_marked_by_ally",
    Adamant = "tank_die_hard",
    Antimech = "trophy_near_bomber",
    Avenger = "global_avenge_friendly",
    Balancer = "trophy_near_punisher",
    BaseDefender = "global_base_defender",

    BomberHunter = "marks_5_bombers",
    BomberRescuer = "defender_bomber",
    BomberNightmare = "marks_10_bombers",

    BulletProof = "trophy_near_survivor",
    Doomsday = "killStreak_bomber_nuclear_success",
    EyeForEye = "global_avenge_self",

    FighterHunter = "marks_5_fighters",
    FighterRescuer = "defender_fighter",
    FighterNightmare = "marks_10_fighters",

    FireArrows = "marks_rocket_kill",
    FireFighter = "tank_help_with_extinguishing",

    FirstStrike = "first_blood",
    FinalBlow = "final_blow",

    GodMode = "marks_killed_plane_20_ranks_higher",
    GroundRescuer = "defender_ground",
    HeavyFury = "trophy_near_tankman",
    HeavyHero = "heroic_tankman",
    Repair = "tank_help_with_repairing",
    HeroSky = "heroic_fighter",
    Intelligence = "tank_marked_enemy_destroyed_by_ally",
    MissionMaker = "heroic_mission_maker",
    OnHand = "trophy_near_wingman",
    PeacefulAtom = "peaceful_atom",
    Punisher = "heroic_punisher",
    RankMatter = "marks_killed_plane_10_ranks_higher",
    RogueWave = "trophy_near_water",
    SafeBomber = "killStreak_bomber_survived",
    SafeAttacker = "killStreak_attacker_survived",
    SafeFighter = "killStreak_fighter_survived",
    SafeHelicopter = "killStreak_helicopter_survived",
    SkillMatters = "marks_killed_plane_15_ranks_higher",
    Sniper = "tank_sniper_shot",
    SoftLanding = "marks_landing_after_critical_hit",
    SupportingFire = "squad_assist",
    Surprise = "marks_bomb_kill",

    TankRescuer = "defender_tank",
    TankHunter = "marks_5_tanks",
    TankNightmare = "marks_10_tanks",

    TerrorOcean = "trophy_near_ship",
    TerrorSea = "heroic_ship",
    TerrorSky = "trophy_near_fighter",
    TheBestSquad = "squad_best",
    TheLastMan = "last_man_standing",
    Thunderer = "heroic_bomber",
    Tsunami = "heroic_water",
    ShipRescuer = "defender_ship",
    WingBreaker = "tank_best_antiAircraft",
    WingMan = "heroic_wingman",

    // streak counted on multiple events
    // three below are type specific
    Double = "double_kill_ground",
    Triple = "triple_kill_ground",
    Multi = "multi_kill_ground",

    Assist = "row_air_assist",
    BaseCapture = "global_base_capturer",
    ShadowStrike = "global_shadow_assassin",
    Professional = "global_kills_without_death",
    WithoutMiss = "tank_kill_without_fail",
}
