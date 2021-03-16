import {
    getcsscolorbyid,
    tfontColor,
    tUl
} from "../colorSelector";

// eslint-disable-next-line no-unused-vars
export class highlightType {
    constructor(hl, noteid) {
        this.hl = hl;
        this.noteid = noteid;
        this.allTypes = {};
        this.allTypes[tfontColor] = { colorhex: "red" };
        this.allTypes[tUl] = { colorhex: "red" };
        this.currentType = undefined;
    }
    getType(type) {
        let a = this.allTypes[type];
        if (a)
            return a;
        return {};
    }
    setType({ type, enable, colorhex }) {
        let { noteid } = this;
        if (colorhex) {
            if (enable == false) {
                colorhex = getcsscolorbyid(type);
            }
        }
        let color = type;
        let disable = enable != true;
        this.allTypes[type] = { enable, colorhex };
        this.hl.updateHignLightColor(noteid, color, colorhex, disable);
        if (enable) {
            this.currentType = type;
        }
    }
    json() {
        return this.allTypes;
    }
}
