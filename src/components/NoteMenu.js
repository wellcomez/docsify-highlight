import {
    yellow,
    green,
    red,
    ul,
    getcsscolorbyid,
    updateCssRule,
    customColor,
    fontColor,
    classNameFromColor,
} from "../colorSelector";

import { Modal } from "iview";
const leftPos = () => {
    return document.getElementsByClassName("content")[0].offsetWidth - 300;
};
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
import SvgButton from './SvgButton'
import BackgroudSelector from'./BackgroudSelector'
export const NoteMenu = {
    name: "NoteMenu",
    components:{
        SvgButton,BackgroudSelector
    },
    data() {
        return {
            style: {
                left: Math.min(leftPos(), this.left - 20) + "px",
                top: this.top - 80 - window.pageYOffset + "px",
                // width: 6 * 30,
            },
            selectedSubColor:2,
            notetext: this.note ? this.note : "",
            color1: "green",
            notecouter: this.note ? this.note.length : 0,
            newnote: this.sources != undefined,
            recommendedColor,
            underlineColor:undefined,
            fontColor:"red"
        };
    },
    computed: {
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
        fontColorEnable(){
            return this.color == customColor
        },
        UnderlineEnable() {
            return this.color == ul;
        },
        isYellow() {
            return this.color == yellow;
        },
        isRed() {
            return this.color == red;
        },
        isGreen() {
            return this.color == green;
        },
    },
    mounted() {
        this.color1 = getcsscolorbyid(this.color)
        if (this.colorhex) {
            if (this.colorhex.length) {

                this.color1 = this.colorhex
            }
        }
        this.updateUnderLineColor();
        let picker = document.getElementsByClassName("ivu-color-picker-color");
        if (picker.length) picker[0].style.backgroundImage = "none";
    },
    methods: {
        updateUnderLineColor() {
            if (this.color == ul) {
                this.underlineColor = this.color1;
            } else {
                this.underlineColor = undefined;
            }
            if(this.color==fontColor){
                this.fontColor = this.color1;
            }else{
                this.fontColor = undefined;
            }
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
        onFontColor(e){
            if(this.fontColorEnable==false){
                this.onClick(e,fontColor);   
            }else{
                this.onClick(e, red);
            }
        },
        onUnderline(e) {
            if (this.UnderlineEnable == false) {
                this.onClick(e, ul);
            } else {
                this.onClick(e, red);
            }
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
        // eslint-disable-next-line no-unused-vars
        // onActiveChange(a, b) {
        //     console.log("cccc", a, b)
        // },
        onChangeColor() {
            let x = classNameFromColor(this.color)
            if (x == undefined) {
                this.color = customColor;
            }
            this.updateUnderLineColor();
            // console.log("cccc", this.color1)
            updateCssRule(this.color, this.color1)
            this.saveNoteData()
        },
        onClick(e, color) {
            e.stopPropagation()
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
        onRed(e) {
            this.onClick(e, red);
        },
        onGreen(e) {
            this.onClick(e, green);
        },
        onYellow(e) {
            this.onClick(e, yellow);
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