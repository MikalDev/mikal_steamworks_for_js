{
    //<-- DOM_COMPONENT_ID -->
    const HANDLER_CLASS = class SteamworksJSDOMHandler extends DOMHandler {
        constructor(iRuntime) {
            super(iRuntime, DOM_COMPONENT_ID);
            console.log("*** INFO *** domSide.js started");

            this._isAvailable = false;
            this._steamworks = null;
            this._steamId = null;
            let notBrowser = typeof window.process === "object";

            console.log("Steamworksjs not browser:", notBrowser);
            if (notBrowser) {
                if (!globalThis.steamworksConstruct) {
                    globalThis.steamworksConstruct = new Steamworks();
                    this.steamworks = globalThis.steamworksConstruct;
                    console.log(
                        "Steamworksjs:",
                        globalThis.steamworksConstruct
                    );
                }
            } else {
                globalThis.steamworksConstruct = { isAvailable: false };
                this.steamworks = globalThis.steamworksConstruct;
            }
            this.AddRuntimeMessageHandlers([
                ["initSteamworks", (e) => this._initSteam(e)],
                ["setAchievement", (e) => this._setAchievement(e)],
            ]);
        }
        _initSteam(e) {
            if (!this.steamworks.isAvailable) {
                console.warn("Steamworks not available");
                return { isOK: false, message: "Steamworks not available" };
            }
            const appId = e.appId;
            if (!isFinite(appId)) {
                console.error("Invalid App ID", appId);
                return { isOK: false, message: "Invalid App ID" };
            }
            this.steamworks.init(appId);
            return { isOK: true, message: "Steamworks initialized" };
        }

        _setAchievement(e) {
            if (!this.steamworks.isAvailable) {
                console.warn("Steamworks not available");
                return { isOK: false, message: "Steamworks not available" };
            }
            const achievementId = e.achievementId;
            // check if achievementId is a string
            if (typeof achievementId !== "string") {
                console.error("Invalid Achievement ID", achievementId);
                return { isOK: false, message: "Invalid Achievement ID" };
            }
            const result =
                this.steamworks.client.achievement.activate(achievementId);
            console.log("setAchievement result:", result);
            if (result) {
                return { isOK: true, message: "Achievement set" };
            } else {
                return { isOK: false, message: "Achievement not set" };
            }
        }
    };
    RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS);
    console.log("*** INFO *** domSide.js finished");
}

class Steamworks {
    constructor() {
        this.SteamCallback = null;
        this.nativebinding = undefined;
        this.runCallbacksInterval = undefined;
        this.isAvailable = false;
        this.isReadyForInit = false;
        this.client = null;

        const { platform, arch, versions } = process;
        console.info("[SteamworksJS] platform:", platform);
        console.info("[SteamworksJS] arch:", arch);
        console.info("[SteamworksJS] nw version:", versions.nw);

        this.isReadyForInit = true;
        if (platform === "win32" && arch === "x64") {
            this.client = require("steamworksjs.win32-x64-msvc.node");
            this.isAvailable = true;
        } else if (platform === "linux" && arch === "x64") {
            this.client = require("steamworksjs.linux-x64-gnu.node");
            this.isAvailable = true;
        } else if (platform === "darwin") {
            if (arch === "x64") {
                this.client = require("steamworksjs.darwin-x64.node");
                this.isAvailable = true;
            } else if (arch === "arm64") {
                this.client = require("steamworksjs.darwin-arm64.node");
                this.isAvailable = true;
            }
        } else {
            throw new Error(
                `Unsupported OS: ${platform}, architecture: ${arch}`
            );
        }
    }

    /**
     * Initialize the steam client or throw an error if it fails
     * @param {number} [appId] - App ID of the game to load, if undefined, will search for a steam_appid.txt file
     * @returns {Omit<Client, 'init' | 'runCallbacks'>}
     */
    // module.exports.init = (appId) => {
    init(appId) {
        const {
            init: internalInit,
            runCallbacks,
            restartAppIfNecessary,
            ...api
        } = this.client;

        internalInit(appId);

        clearInterval(this.runCallbacksInterval);
        this.runCallbacksInterval = setInterval(runCallbacks, 1000 / 30);
        this.isAvailable = true;

        return api;
    }

    pong() {
        console.log("steamworks Pong");
        return "Pong";
    }
}
