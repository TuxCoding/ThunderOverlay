import { addErrorHandlerImg, showNotification, type Notification } from "@App/ui";
import { DefaultSetting, LocalSetting, type Settings } from "@App/setting/settings";

import { loadLocalFile, type AssetMap } from "@App/network";

import defaultMapping from "@Mapping/english.json";
import { startUpdatingLoop } from "@App/thunder";

/* Run update only on the site not for tests */
if (typeof document !== "undefined") {
    void init();
}

const DEFAULT_LANG = "english";

function init() {
    addErrorHandlerImg();

    loadSettings().then(async settings => {
        const lang = settings.lang;

        let assetMap: AssetMap = defaultMapping as AssetMap;
        if (lang !== DEFAULT_LANG) {
            assetMap = await loadLang(lang);
        }

        return {settings, assetMap};
    }).then(async (state) => {
        await startUpdatingLoop(state.settings, state.assetMap);
    }).catch(console.error);

    showSampleNotification();
}

async function loadSettings(): Promise<Settings> {
    // If opened locally in a browser load the default
    if (isLocalEnvironment()) {
        console.warn("Loading default settings, because of file protocol");

        // load only the embedded default settings if loaded with the browser
        return new DefaultSetting().loadSettings();
    }

    // CORS in OBS is disabled by using a different protocol
    return new LocalSetting().loadSettings();
}

async function loadLang(lang: string): Promise<AssetMap> {
    if (isLocalEnvironment()) {
        return new Promise(() => defaultMapping);
    }

    return loadLocalFile(`./${lang}.json`);
}

function isLocalEnvironment() {
    const currentProtocol = document.location.protocol;
    return currentProtocol === "file:";
}

const DELAY_SAMPLE_NOTIFICATION = 1_000;

function showSampleNotification() {
    // test formatting with max number of clan and player characters and demonstrate initialization
    const sample: Notification = {
        killer: "^GFF7^ TuxCode",
        killerAvatar: "./assets/img/avatars/cardicon_fem_06.avif",

        killerTankIcon: "./assets/img/vehicles/ground/il_merkava_mk_3b.avif",
        destroyedTank: "./assets/img/vehicles/ground/ussr_t_90a.avif",

        killed: "^GFF7^ 1234567890123456",
    };

    // delay it slightly to relax demand on initialization for client application
    setTimeout(() => showNotification(sample), DELAY_SAMPLE_NOTIFICATION);
}
