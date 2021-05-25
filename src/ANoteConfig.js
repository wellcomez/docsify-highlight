/* eslint-disable no-empty */
import { BookToc } from './store';
import { User } from "./UserLogin";
export class ANoteConfig {
    constructor() {
        let toc = new BookToc();
        let userid = User.getUsername();
        this.toANoteConfig = "toANoteConfig" + toc.bookname + '-' + userid;
        this.load()
    }
    // __save() {
    //     try {
    //         var data = JSON.stringify(this);
    //         window.localStorage.setItem("toANoteConfig", data)
    //     } catch (error) {

    //     }
    // }
    save(config) {
        try {
            let { on } = config;
            if (on != undefined) {
                this.on = on;
            }
        } catch (error) {
        }
        let a = { ...this.load(), ...config }
        try {
            var data = JSON.stringify(a);
            window.localStorage.setItem(this.toANoteConfig, data)
        } catch (error) {
        }
    }
    load() {
        try {
            var data = window.localStorage.getItem(this.toANoteConfig);
            let ret = JSON.parse(data)
            let { on } = ret
            this.on = on;
            return ret;
        } catch (error) {
        }

        if (this.on == undefined) this.on = true
        return { on: true }
    }
}
export let getConfig = () => {
    return new ANoteConfig();
}

