import {
    tfontColor,
    tUl, tBackgroundColor
} from "./colorSelector";

const default_green = "#33FF33";
const default_red = "#ff3366";
const default_yellow = "#FFFF33";

import { getConfig } from "./ANoteConfig";
import { hlIngoreElement } from "./hlPlacement";
const defaultColor = {};
defaultColor[tBackgroundColor] = [default_green, "rgba(51,255,255,0.92)", default_red, default_yellow];
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
// eslint-disable-next-line no-unused-vars
export class highlightType {
    constructor(hl, hs) {
        this.colorSettings = {};
        this.allTypes = {};
        this.getHighlightDom = (noteid) => hl.getDoms(noteid)
        this.noteid = hs.id;
        this.procssAllElements = (nodeid, cb) => {
            const classname = 'docsify-highlighter'
            let node;
            try {
                node = this.getHighlightDom(nodeid)
                if (node) {
                    for (let i = 0; i < node.length; i++) {
                        let el = node[i]
                        cb(el)
                    }
                    return
                }
                // eslint-disable-next-line no-empty
            } catch (error) {
            }
            let elements = document.getElementsByClassName(classname)
            for (let i = 0; i < elements.length; i++) {
                let element = elements[i]
                try {
                    if (element.dataset.highlightId == nodeid) {
                        cb(element)
                    }
                    // eslint-disable-next-line no-empty
                } catch (error) { }
            }
        }
        this.updateHignLightColor = (noteid, type, colorhex, disable) => {
            // this.removeHighLight(noteid);
            this.procssAllElements(noteid, (a) => {
                if (disable) {
                    colorhex = ""
                }
                this.updateNodeHighLightColor(a, type, colorhex);
            })
        }
        this.updateNodeHighLightColor = (node, type, colorhex) => {
            if (node.getAttribute('data-highlight-id') != this.noteid) return;
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
                    this.setType({ type, enable, colorhex })
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
        this.setType({ type, enable, colorhex })
    }
    currentColor(type) {
        return this.colorSettings[type].currentColor();
    }
    showHighlight() {
        for (let type in this.allTypes) {
            let { enable, colorhex } = this.allTypes[type];
            let { noteid } = this
            if (enable) {
                type = parseInt(type)
                this.updateHignLightColor(noteid, type, colorhex);
            }
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
        if (enable && colorhex) {
            lastDefaultColor[type] = colorhex;
        }
        this.updateHignLightColor(noteid, color, colorhex, disable);
    }
    json() {
        return this.allTypes;
    }
}
