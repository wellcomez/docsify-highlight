import {
    tfontColor,
    tUl, tBackgroundColor
} from "./colorSelector";

const default_green = "#33FF33";
const default_red = "#ff3366";
const default_yellow = "#FFFF33";

import { getConfig } from "./ANoteConfig";
import { hlIngoreElement } from "./hlPlacement";
import { SubNode } from "./MainNode";
const defaultColor = {};
defaultColor[tBackgroundColor] = [default_green, "rgba(51,255,255,0.92)", default_red, default_yellow,"rgba(96, 125, 139, 0.22)","rgba(255, 255, 255, 0.1)"];
defaultColor[tUl] = ["red", "green", "yellow"];
defaultColor[tfontColor] = ["red", "black", "green", "white"];

export let lastDefaultColor = {};
[tUl, tfontColor, tBackgroundColor].forEach((a) => {
    lastDefaultColor[a] = defaultColor[a][0]
})
class colorSettings {
    constructor(type, values = undefined) {
        this.type = type
        let xxx = getConfig().load()[this.name()]
        if (xxx) {
            values = xxx
        }
        this.colorList = values;
        this.colorListSet = new Set(this.colorList)
    }
    getDefaultColor() {
        if (this.colorList == undefined || this.colorList.length == 0) {
            this.colorList = defaultColor[this.type];
        }
        return this.colorList[0];
    }
    name() {
        return "colorList" + this.type
    }
    deleteIndex(i) {
        this.colorList = this.colorList.filter((a, index) => {
            return i != index;
        })
        if (this.colorList.length == 0) {
            this.colorList = defaultColor[this.type];
        }
        this.save()
    }
    addColor(a) {
        if (a && a.length) {
            if (this.colorListSet.has(a)) {
                return;
            }
            this.colorListSet.add(a);
            this.colorList = Array.from(this.colorListSet)
            this.save();
        }
    }

    save() {
        let config = {};
        config[this.name()] = this.colorList;
        getConfig().save(config);
    }
}
export class highlightType {
    constructor(hl, hs) {
        this.updateHignLightColor = (noteid, type, colorhex, enable) => {
            let current = hl.MainNode(noteid)
            current.nodes.forEach((node) => {
                if (enable != true) colorhex = ""
                this.updateNodeHighLightColor(node, type, colorhex);
            })
        }
        this.getStyleByType = (type, colorhex) => {
            let style = {}
            if (type == tUl) {
                if (colorhex != "")
                    style.borderBottom = "2px solid " + colorhex;
                else
                    style.borderBottom = "";
            } else if (type == tfontColor) {
                style.color = colorhex;
            } else {
                style.backgroundColor = colorhex;
            }
            return style;
        }

        this.updateNodeHighLightColor = (node, type, colorhex) => {
            let sub = new SubNode(node)
            if (sub.highlightId != this.noteid) return;
            if (hlIngoreElement(node) || hlIngoreElement(node.parentElement)) return;
            if (type == tUl) {
                if (colorhex != "")
                    node.style.borderBottom = "2px solid " + colorhex;

                else
                    node.style.borderBottom = "";
            } else if (type == tfontColor) {
                node.style.color = colorhex;
            } else {
                node.style.backgroundColor = colorhex;
            }
        }
        this.getType = (type) => {
            let a = this.allTypes[type];
            if (a)
                return a;
            return {};
        }
        this.setTypeValue = ({ type, enable, colorhex }) => {
            this.allTypes[type] = { enable, colorhex };
            if (enable && colorhex) {
                lastDefaultColor[type] = colorhex;
            }
        }
        this.currentColor = (type) => {
            return this.colorSettings[type].currentColor();
        }
        this.colorSettings = {};
        this.allTypes = {};
        this.noteid = hs.id;
        let { style } = hs;
        if (style == undefined) style = {}
        if (style) {
            this.allTypes = { ...style };
        }

        [tUl, tfontColor, tBackgroundColor].forEach((type) => {
            let b = this.colorSettings[type] = new colorSettings(type, defaultColor[type]);
            const colorhex = lastDefaultColor[type];
            if (colorhex) {
                b.addColor(colorhex);
                let { enable } = this.getType(type);
                if (enable != true) {
                    this.setTypeValue({ type, enable, colorhex })
                }
            }
        });
    }
    hlSettings(type) {
        return this.colorSettings[type]
    }
    getDefaultColor(type) {
        return this.hlSettings(type).getDefaultColor()
    }
    setColorByIndex(type, index) {
        let hl = this.hlSettings(type)
        let colorlist = hl.colorList;
        let enable = true;
        let colorhex = colorlist[index]
        this.render({ type, enable, colorhex })
    }

    showHighlight() {
        for (let type in this.allTypes) {
            let { enable, colorhex } = this.allTypes[type];
            let { noteid } = this
            type = parseInt(type)
            this.updateHignLightColor(noteid, type, colorhex, enable);
        }
    }


    highlightNode(node) {
        for (let type in this.allTypes) {
            let { enable, colorhex } = this.allTypes[type];
            if (enable) {
                type = parseInt(type)
                this.updateNodeHighLightColor(node, type, colorhex);
            }
        }
    }
    cssStyle() {
        let style = {};
        for (let a in this.allTypes) {
            let { enable, colorhex } = this.allTypes[a]
            if (enable) {
                let ccc = this.getStyleByType(a, colorhex)
                style = { ...style, ...ccc }
            }
        }
        return style
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

    render({ type, enable, colorhex }) {
        let { noteid } = this;
        let color = type;
        this.setTypeValue({ type, enable, colorhex })
        this.updateHignLightColor(noteid, color, colorhex, enable);
    }
    json() {
        return this.allTypes;
    }
}
