import {
    tBackgroundColor,
    tUl,
    tfontColor,
} from "../colorSelector";

import { Modal } from "iview";
const leftPos = () => {
    return document.getElementsByClassName("content")[0].offsetWidth - 300;
};

const default_green = "#33FF33";
const default_red = "#ff336659";
const default_yellow = "#FFFF3355";
let default_color_list = getConfig().color
if (default_color_list == undefined) {
    default_color_list = [default_red, default_green, default_yellow];
}
import SvgButton from './SvgButton'
import BackgroudSelector from './BackgroudSelector'
import { highlightType } from "../highlightType";
import { getConfig } from "../ANoteConfig";
export const NoteMenu = {
    name: "NoteMenu",
    components: {
        SvgButton, BackgroudSelector
    },
    data() {
        return {
            default_color_list,
            backgroundColorKey: 1,
            underlineColor: undefined,
            UnderlineEnable: false,
            fontColor: undefined,
            fontColorEnable: false,
            hlStyle: new highlightType(this.hl, this.noteid, this.data),
            style: {
                left: Math.min(leftPos(), this.left - 20) + "px",
                top: this.top - 80 - window.pageYOffset + "px",
            },
            hlType: undefined,
            selectedSubColor: undefined,
            notetext: this.note ? this.note : "",
            color1: "",
            notecouter: this.note ? this.note.length : 0,
            newnote: this.sources != undefined,
        };
    },
    watch: {
        // eslint-disable-next-line no-unused-vars
        selectedSubColor(val) {
            let type = tBackgroundColor, enable = this.selectedSubColor != undefined, colorhex;
            colorhex = default_color_list[this.selectedSubColor];
            this.hlStyle.setType({ type, enable, colorhex });
            this.updateSelection(type)
        }
    },
    computed: {
        recommendedColor() {
            if (this.UnderlineEnable || this.fontColorEnable) {
                return recommendedColorNoAlpha
            }
            return recommendedColor
        },
        colorList() {
            let ret = []
            for (let i = 0; i < 3; i++) {
                let colorhex = default_color_list[i]
                let style = `background-color: ${colorhex}`
                ret.push({ style })
            }
            return ret
        },
        EditTextTips() {
            if (this.notetext.length) return this.notetext;
            return "Note"
        },
        classColorPicker() {
            if (this.hlType == tBackgroundColor) {
                return "note-color-picker-selected"
            }
            return 'note-color-picker'
        },
    },
    mounted() {
        this.updateSelection();
        let picker = document.getElementsByClassName("ivu-color-picker-color");
        if (picker.length) picker[0].style.backgroundImage = "none";
    },
    methods: {
        updateSelection(a) {
            if (a != undefined) {
                let { enable, colorhex } = this.hlStyle.getType(a)
                this.updateButtonColor(a, enable, colorhex)
                this.color1 = colorhex
                this.hlType = a
                return
            }
            [tfontColor, tBackgroundColor, tUl].forEach((a) => {
                let { enable, colorhex } = this.hlStyle.getType(a)
                this.updateButtonColor(a, enable, colorhex)
                if (enable) {
                    this.hlType = a
                    this.color1 = colorhex
                }
            })
        },
        col(i) {
            let a = "border-bottom:2px solid var(--theme-color, #42b983);";
            if (i == this.hlType)
                return a
            return ""
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
            this.setFontType(e, tfontColor)
        },
        updateButtonColor(type, enable, colorhex) {
            if (type == tUl) {
                this.underlineColor = enable ? colorhex : undefined;
                this.UnderlineEnable = enable;
            } else if (type == tfontColor) {
                this.fontColor = enable ? colorhex : undefined;
                this.fontColorEnable = enable;
            } else {
                this.default_color_list[this.selectedSubColor] = colorhex;
                let color = this.default_color_list;
                getConfig().save({ color })
                this.backgroundColorKey = new Date() * 1
            }
        },
        setFontType(e, t) {
            e.stopPropagation();
            let { enable, colorhex } = this.hlStyle.getType(t)
            enable = enable == true ? false : true
            if (colorhex == undefined || colorhex.length == 0) {
                colorhex = this.color1
            }
            let type = t
            this.hlStyle.setType({ type, enable, colorhex })
            this.updateSelection(t)
        },
        onUnderline(e) {
            this.setFontType(e, tUl)
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
            let { sources } = this;
            let style = this.hlStyle.allTypes
            let note =
                this.notetext && this.notetext.length ? this.notetext : undefined;
            return { note, sources, style };
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
        onChangeColorPicker() {
            let type = this.hlType;
            let { enable, colorhex } = this.hlStyle.getType(type)
            colorhex = this.color1
            this.hlStyle.setType({ type, enable, colorhex })
            this.updateSelection(type)
            this.saveNoteData()
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
        data: { type: Object, default: {} },
        colorhex: { type: String, default: "" },
        note: {
            type: String,
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

const recommendedColorNoAlpha = [
    "rgba(45, 140, 240, 1)",
    "rgba(139, 195, 74, 1)",
    "rgba(241, 107, 98, 1)",
    "rgba(25, 190, 107, 1)",
    "rgba(255, 153, 0, 1)",
    "rgba(234, 76, 163, 1)",
    "rgba(13, 148, 170, 1)",
    "rgba(237, 64, 20, 1)",
    "rgba(0, 181, 255, 1)",
    "rgba(254, 189, 121, 1)",
    "rgba(93, 64, 55, 1)",
    "rgba(25, 201, 25, 1)",
    "rgba(249, 227, 28, 1)",
    "rgba(0, 188, 212, 1)",
    "rgba(240, 98, 146, 1)",
    "rgba(234, 26, 26, 1)",
    "rgba(155, 29, 234, 1)",
    "rgba(205, 220, 57, 1)",
    "rgba(96, 125, 139, 1)",
    "rgba(0, 194, 177, 1)",
    "rgba(172, 122, 51, 1)",
    "rgba(0, 0, 0, 1)",
    "rgba(255, 255, 255, 1)",
    "rgba(29, 53, 234, 1)",
]





