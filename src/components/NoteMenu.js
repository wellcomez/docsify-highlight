import {
    backgroundColor,
    ul,
    getcsscolorbyid,
    updateCssRule,
    customColor,
    fontColor,
} from "../colorSelector";

import { Modal } from "iview";
const leftPos = () => {
    return document.getElementsByClassName("content")[0].offsetWidth - 300;
};

import SvgButton from './SvgButton'
import BackgroudSelector from './BackgroudSelector'
// eslint-disable-next-line no-unused-vars
const default_green = "#33FF33"
const default_red = "#ff336659"
const default_yellow = "#FFFF3355"
const default_color_list = [default_red, default_green, default_yellow]
class highlightType {
    constructor(hl, noteid) {
        this.hl = hl
        this.noteid = noteid
        this.allTypes = {
        }
        this.currentType = undefined
    }
    getType(type) {
        let a = this.allTypes[type]
        if(a)return a
        return{} 
    }
    setType({ type, enable, colorhex }) {
        let { noteid } = this
        if (colorhex) {
            if (enable == false) {
                colorhex = getcsscolorbyid(type)
            }
        }
        let color = type
        let disable = enable != true
        this.allTypes[type] = { enable, colorhex }
        this.hl.updateHignLightColor(noteid, color, colorhex, disable)
        if(enable){
            this.currentType = type
        }
    }
}
export const NoteMenu = {
    name: "NoteMenu",
    components: {
        SvgButton, BackgroudSelector
    },
    data() {
        return {
            hlStyle: new highlightType(this.hl, this.noteid),
            style: {
                left: Math.min(leftPos(), this.left - 20) + "px",
                top: this.top - 80 - window.pageYOffset + "px",
                // width: 6 * 30,
            },
            hlType: customColor,
            selectedSubColor: undefined,
            notetext: this.note ? this.note : "",
            color1: "",
            notecouter: this.note ? this.note.length : 0,
            newnote: this.sources != undefined,
            recommendedColor,
        };
    },
    watch: {
        // eslint-disable-next-line no-unused-vars
        selectedSubColor(val) {
            this.updateBackgroudColor();
        }
    },
    computed: {
        underlineColor(){
            let {hlStyle} = this
            let a = hlStyle.getType(ul)
            let {enable} = a;
            if(enable)return a.colorhex
        },
        colorList() {
            let ret = [
                {
                    subclass: "hlred d1",
                },
                {
                    subclass: "hlgreen d1",
                },
                {
                    subclass: "hlyellow d1",
                },
            ];
            return ret
        },
        EditTextTips() {
            if (this.notetext.length) return this.notetext;
            return "Note"
        },
        classColorPicker() {
            if (this.color == customColor) {
                return "note-color-picker-selected"
            }
            return 'note-color-picker'
        },
    },
    mounted() {
        // let { hlStyle } = this;
        // let enable = true;
        // this.hlType = backgroundColor;
        // let colorhex = this.color1;
        // hlStyle.setType({ type: this.hlStyle, enable, colorhex })
        // this.updateUnderLineColor();
        let picker = document.getElementsByClassName("ivu-color-picker-color");
        if (picker.length) picker[0].style.backgroundImage = "none";
    },
    methods: {
        updateBackgroudColor() {
            let type = backgroundColor, enable = true, colorhex;
            this.hlType = type
            colorhex = default_color_list[this.selectedSubColor];
            this.color1 = colorhex;
            this.hlStyle.setType({ type, enable, colorhex });
        },
        updateUnderLineColor() {
        },
        openEditor() {
            var tmpdata = this.notetext;
            Modal.confirm({
                onOk: () => {
                    this.notetext = tmpdata;
                    this.notecouter = tmpdata.length;
                    this.saveNoteData();
                },
                render: (h) => {
                    return h("Input", {
                        props: {
                            value: this.notetext,
                            autofocus: true,
                            rows: 4,
                            clearable: true,
                            placeholder: "Please enter your name...",
                            type: "textarea",
                        },
                        on: {
                            input: (val) => {
                                tmpdata = val;
                            },
                        },
                    });
                },
            });
        },
        onFontColor(e) {
            this.setFontType(e,fontColor)
        },
        setFontType(e,t) {
            e.stopPropagation();
            let {enable} = this.hlStyle.getType(t)
            enable = enable == true ? false : true
            let colorhex = this.color1
            let type = ul
            this.hlStyle.setType({ type, enable, colorhex })
        },
        onUnderline(e) {
            this.setFontType(e,ul)
        },
        onSearch() {
            // console.log("xx");
            this.removeSelectionHighLight();
            this.removeMenu();
        },
        onCopy(e) {
            e.stopPropagation()
            // console.log("onCopy");
            let { hl } = window;
            hl.onCopy(this.noteid);
            this.removeSelectionHighLight();
            this.removeMenu();
        },
        notedata() {
            let { sources, color, color1: colorhex } = this;
            if (this.newnote == false) {
                sources = undefined;
            }
            if (colorhex && colorhex.length == 0) colorhex = undefined;
            let note =
                this.notetext && this.notetext.length ? this.notetext : undefined;
            return { note, color, sources, colorhex };
        },
        saveNoteData() {
            this.hl.saveNoteData(this.noteid, this.notedata());
            this.newnote = false;
        },
        // eslint-disable-next-line no-unused-vars
        removeSelectionHighLight() {
            this.saveNoteData();
        },
        onClickMask(e) {
            e.stopPropagation();
            let mask = document.getElementsByClassName("note-menu")[0];
            if (mask != e.target) return;
            this.removeSelectionHighLight();
            this.removeMenu();
        },
        onChangeColor() {
            updateCssRule(this.color, this.color1)
            this.saveNoteData()
        },
        onClick(e, color) {
            if (e == undefined) return
            this.color = color;
            let color1 = getcsscolorbyid(this.color)
            if (color1.length) {
                this.colorhex = this.color1 = color1;
            } else {
                this.colorhex = this.color1;
            }
            this.updateUnderLineColor();
            this.saveNoteData();
        },
        removeMenu() {
            var tips = document.getElementsByClassName("note-menu");
            tips.forEach((tip) => {
                tip.parentNode.removeChild(tip);
            });
        },
        onDelete() {
            const id = this.noteid;
            let { hl } = window;
            // console.log("*click remove-tip*", id);
            hl.deleteId(id);
            this.removeMenu();
        },
    },
    props: {
        colorhex: { type: String, default: "" },
        note: {
            type: String,
            default: undefined,
        },
        color: {
            type: Number,
            default: undefined,
        },
        left: {
            type: Number,
            default: undefined,
        },
        sources: {
            type: Array,
            default: undefined,
        },
        hl: {
            type: Object,
            default: undefined,
        },
        top: {
            type: Number,
            default: undefined,
        },
        noteid: {
            type: String,
            default: undefined,
        },
    },
}
const recommendedColor = [
    "rgba(45, 140, 240, 0.5)",
    "rgba(139, 195, 74, 0.5)",
    "rgba(241, 107, 98, 0.5)",
    "rgba(25, 190, 107, 0.5)",
    "rgba(255, 153, 0, 0.5)",
    "rgba(234, 76, 163, 0.5)",
    "rgba(13, 148, 170, 0.5)",
    "rgba(237, 64, 20, 0.5)",
    "rgba(0, 181, 255, 0.5)",
    "rgba(254, 189, 121, 0.5)",
    "rgba(93, 64, 55, 0.5)",
    "rgba(25, 201, 25, 0.5)",
    "rgba(249, 227, 28, 0.5)",
    "rgba(0, 188, 212, 0.5)",
    "rgba(240, 98, 146, 0.5)",
    "rgba(234, 26, 26, 0.5)",
    "rgba(155, 29, 234, 0.5)",
    "rgba(205, 220, 57, 0.5)",
    "rgba(96, 125, 139, 0.5)",
    "rgba(0, 194, 177, 0.5)",
    "rgba(172, 122, 51, 0.5)",
    "rgba(0, 0, 0, 0.5)",
    "rgba(255, 255, 255, 0.5)",
    "rgba(29, 53, 234, 0.5)",
]


