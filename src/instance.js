//<-- DOM_COMPONENT_ID -->
function getInstanceJs(parentClass, scriptInterface, addonTriggers, C3) {
    return class extends parentClass {
        constructor(inst, properties) {
            super(inst);
            if (properties) {
            }
            this.isAvailable = false;
            this.client = null;
            this.comlink = null;
            // this.PostToDOMAsync("initComlink", "let's init comlink");
        }

        SaveToJson() {
            return {
                // data to be saved for savegames
            };
        }

        LoadFromJson(o) {
            // load state for savegames
        }

        async _Initialize(appId) {
            console.log("initialize steamworks with appId:", appId);
            // let message = await this.comlink.steam.myData;
            const result = await this.PostToDOMAsync("initSteamworks", {
                appId,
            });
            console.log("result from initSteamworks:", result);
        }

        async _SetAchievement(achievementId) {
            const result = await this.PostToDOMAsync("setAchievement", {
                achievementId,
            });
            console.log("result from setAchievement:", result);
        }
    };
}
