import {
    tfontColor,
    tUl
} from "./colorSelector";

// eslint-disable-next-line no-unused-vars
export class highlightType {
    constructor(hl, noteid, style = {}) {
        this.hl = hl;
        this.noteid = noteid;
        if (style) {
            this.allTypes = style;
        }
        if (this.allTypes[tfontColor] == undefined) {
            this.allTypes[tfontColor] = { colorhex: "red" };
        }
        if (this.allTypes[tUl])
            this.allTypes[tUl] = { colorhex: "red" };
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
