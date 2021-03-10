import "../icons";
import {
    yellow,
    green,
    red,
    ul,
    getcsscolorbyid,
    updateCssRule,
    customColor,
    classNameFromColor,
} from "../colorSelector";

import { Modal } from "iview";
const leftPos = () => {
    return document.getElementsByClassName("content")[0].offsetWidth - 300;
};

export const NoteMenu = {
    name: "NoteMenu",
    data() {
        return {
            style: {
                left: Math.min(leftPos(), this.left - 20) + "px",
                top: this.top - 25 - window.pageYOffset + "px",
                // width: 6 * 30,
            },
            notetext: this.note ? this.note : "",
            color1: "green",
            notecouter: this.note ? this.note.length : 0,
            newnote: this.sources != undefined,
        };
    },
    computed: {
        classColorPicker(){
            if(this.color==customColor){
                return "let note-color-picker-selected"
            }
            return 'left note-color-picker'
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
        let picker = document.getElementsByClassName("ivu-color-picker-color");
        if (picker.length) picker[0].style.backgroundImage = "none";
    },
    methods: {
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

        onUnderline(e) {
            if (this.UnderlineEnable == false) {
                this.onClick(e, ul);
            } else {
                this.onClick(e, red);
            }
        },
        onSearch() {
            console.log("xx");
            this.removeSelectionHighLight();
            this.removeMenu();
        },
        onCopy() {
            console.log("onCopy");
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
            let mask = document.getElementsByClassName("note-menu")[0];
            if (mask != e.target) return;
            this.removeSelectionHighLight();
            this.removeMenu();
        },
        // eslint-disable-next-line no-unused-vars
        onChangeColor(a, b, c) {
            let x = classNameFromColor(this.color)
            if (x == undefined) {
                this.color = customColor;
            }
            updateCssRule(this.color, this.color1)
            this.saveNoteData()
        },
        onClick(e, color) {
            this.color = color;
            let color1 = getcsscolorbyid(this.color)
            if (color1.length) {
                this.colorhex = this.color1 = color1;
            } else {
                this.colorhex = this.color1;
            }
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
            console.log("*click remove-tip*", id);
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