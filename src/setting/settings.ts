import { loadLocalFile } from "@App/network";
import defaultSettings from "@App/settings.json";

export interface SquadAvatar {
    readonly username: string;
    readonly avatar: string | null;
}

/*
export enum EventSource {
    Me,
    Squad,
    Team,
    Enemy,
}

export interface SoundSetting {
    readonly file: string;
    readonly volume: number;
}

export interface EventTrigger {
    readonly event: string;
    readonly src: EventSource;

    readonly layout?: string;
    readonly sound?: SoundSetting[];
}*/

export interface Settings {
    readonly lang: string;

    readonly squad: SquadAvatar[];
    // readonly events: EventTrigger[];
}

abstract class SettingsRetriever {
    abstract loadSettings(): Promise<Settings>;
}

export class DefaultSetting extends SettingsRetriever {
    override loadSettings(): Promise<Settings> {
        return new Promise(() => defaultSettings as Settings);
    }
}

export class LocalSetting extends SettingsRetriever {
    override loadSettings(): Promise<Settings> {
        return loadLocalFile<Settings>("settings");
    }
}

export class WebSetting extends SettingsRetriever {
    override loadSettings(): Promise<Settings> {
        const defaultConf = new DefaultSetting().loadSettings();
        return defaultConf.then(conf => this.addWebSettings(conf));
    }

    private addWebSettings(def: Settings): Settings {
        const params = new URL(document.location.toString()).searchParams;
        const lang = params.get("lang") ?? def.lang;

        let squadMembers: SquadAvatar[] = [];
        const username = params.get("name");
        if (username) {
            const avatar = params.get("avatar") ?? "";
            squadMembers = [
                {
                    username,
                    avatar
                }
            ];
        } else {
            console.error("Username is not definied for detecting kills");
        }

        return {
            lang: lang,
            squad: squadMembers
        };
    }
}
