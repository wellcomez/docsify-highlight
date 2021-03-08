/* eslint-disable no-empty */
export class ANoteConfig {
    constructor() {
        this.load()
    }
    __save() {
        try {
            var data = JSON.stringify(this);
            window.localStorage.setItem("toANoteConfig", data)
        } catch (error) {

        }
    }
    save(config) {
        try {
            let { on, color } = config;
            if (on != undefined) {
                this.on = on;
            }
            if (color != undefined) {
                this.color = color;
            }
            this.__save();
        } catch (error) {
        }
    }
    load() {
        try {

            var data = window.localStorage.getItem("toANoteConfig");
            JSON.parse(data)
            let { on, color } = JSON.parse(data)
            this.on = on;
            this.color = color;
        } catch (error) {
        }

        if (this.color == undefined) {
            this.color = "yellow"
        }
        if (this.on == undefined) {
            this.on = true;
        }
    }
}
export let getConfig = () => {
    return new ANoteConfig();
}

