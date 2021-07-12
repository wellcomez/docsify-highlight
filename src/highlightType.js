import {
    tfontColor,
    tUl, tBackgroundColor
} from "./colorSelector";

const default_green = "#33FF33";
const default_red = "#ff3366";
const default_yellow = "#FFFF33";

import { getConfig } from "./ANoteConfig";
const defaultColor = {};
defaultColor[tBackgroundColor] = [default_green, "rgba(51,255,255,0.92)",default_red, default_yellow];
defaultColor[tUl] = ["green", "red", "yellow"];
defaultColor[tfontColor] = ["black", "green", "red", "white"];
class colorSettings {
    constructor(type, values = undefined) {
        this.type = type
        let xxx = getConfig().load()[this.name()]
        if(xxx){
            values = xxx
        }
        this.colorList = values;
        this.colorListSet = new Set(this.colorList)
    }
    name(){
        return "colorList"+this.type
    }
    addColor(a) {
        if (this.colorListSet.has(a)) {
            return;
        }
        this.colorListSet.add(a);
        this.colorList = Array.from(this.colorListSet)
        let config ={}
        config[this.name()] = this.colorList;
        getConfig().save(config)
    }
}
// eslint-disable-next-line no-unused-vars
export class highlightType {
    constructor(hl, hs) {
        let { id: noteid, style } = hs;
        if (style == undefined) style = {}
        this.hl = hl;
        this.noteid = noteid;
        if (style) {
            this.allTypes = style;
        }
        if (this.allTypes[tfontColor] == undefined) {
            this.allTypes[tfontColor] = { colorhex: "red" };
        }
        if (this.allTypes[tUl] == undefined)
            this.allTypes[tUl] = { colorhex: "red" };
        this.colorSettings = {};
        let aaa = [tUl, tfontColor, tBackgroundColor]
        for (let i = 0; i < aaa.length; i++) {
            let a = aaa[i];

            let b = new colorSettings(a, defaultColor[a]);
            this.colorSettings[a] = b;
            let { enable, colorhex } = this.getType(a)
            b.addColor(colorhex)
            if (enable) {
                // b.onSelectedColor(colorhex)
            }
        }
    }
    getDefaultColor(type) {
        return this.getColorList(type)[0]
    }
    getColorList(type) {
        return this.colorSettings[type].colorList;
    }
    addColor(type, color) {
        this.colorSettings[type].addColor(color);
    }
    setColorByIndex(type, index) {
        let colorlist = this.getColorList(type);
        let enable = true;
        let colorhex = colorlist[index]
        this.setType({ type, enable, colorhex })
    }
    currentColor(type) {
        return this.colorSettings[type].currentColor();
    }
    showHighlight() {
        for (let color in this.allTypes) {
            let { enable, colorhex } = this.allTypes[color];
            let { noteid } = this
            if (enable) {
                color = parseInt(color)
                this.hl.updateHignLightColor(noteid, color, colorhex);
            }
        }
    }
    getStyle() {
        let style = {};
        for (let a in this.allTypes) {
            let { enable, colorhex } = this.allTypes[a]
            if (enable) {
                style[a] = { enable, colorhex }
            }
        }
        return style
    }
    getType(type) {
        let a = this.allTypes[type];
        if (a)
            return a;
        return {};
    }
    setType({ type, enable, colorhex }) {
        let { noteid } = this;
        let color = type;
        let disable = enable != true;
        this.allTypes[type] = { enable, colorhex };
        this.hl.updateHignLightColor(noteid, color, colorhex, disable);
    }
    json() {
        return this.allTypes;
    }
}
