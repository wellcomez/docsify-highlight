/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import {
    tBackgroundColor,
    tUl,
    tfontColor,
} from "../colorSelector";
import mediumZoom from "medium-zoom";
import { Modal } from "iview";


import SvgButton from './SvgButton'
import TagPanel from './TagPanel'
import BackgroudSelector from './BackgroudSelector'
import DropColor from './DropColor'
import { highlightType } from "../highlightType";
import { getContentNode } from "../hl";
export const NoteMenu = {
    name: "NoteMenu",
    components: {
        SvgButton, BackgroudSelector, TagPanel, DropColor
    },
    data() {
        return {
            recommendedColor: recommendedColor,
            backgroundColorEnable: false,
            notetext: this.hs.note,
            noteid: this.hs.id,
            tags: [],
            bookmark: false,
            imageNeedAdd: false,
            justify: 'space-between',
            img: undefined,
            showfortxt: true,
            showtagPane: false,
            // first3Colors: default_color_list,
            backgroundColorKey: 1,
            underlineColor: undefined,
            UnderlineEnable: false,
            fontColor: undefined,
            fontColorEnable: false,
            hlStyle: new highlightType(this.hl, this.hs),
            backGroundstyle: "",
            style: {
            },
            hlType: undefined,
            selectedSubColor: undefined,
            color1: "",
            newnote: this.sources != undefined,
            colorList: [],
            hlSettings: undefined
        };
    },
    watch: {
        color1() {
            this.colorList = this.hlSettings ? this.hlSettings.colorList : [];
        },
        hlType(a) {
            if (a == tUl || a == tfontColor) {
                this.recommendedColor = recommendedColorNoAlpha
            } else {
                this.recommendedColor = recommendedColor
            }
            this.hlSettings = this.hlStyle.hlSettings(a)
        },
        hlSettings(a) {
            if (a)
                this.colorList = a.colorList
        },
        showtagPane() {
            this.updatePos()
        },
        selectedSubColor(val) {
            if (val < 0) return
            this.hlStyle.setColorByIndex(this.hlType, val)
            this.updateSelection(this.hlType)
        }
    },
    computed: {
        tagCount() {
            return this.tags.length
        },
        tipclass() {
            return this.showfortxt ? "my-remove-tip" : "my-remove-tip notfortext"
        },
        backgroundClass() {
            if (this.hlType == tBackgroundColor) {
                return "backgroundClass"
            } else {
                return ""
            }
        },
        notecouter() { return this.notetext ? this.notetext.length : 0 },
        bookmarkiconcolor() {
            if (this.bookmark) {
                return "var(--theme-color, #42b983)";
            }
            return undefined;
        },
        bookmarkicon() {
            return this.bookmark ? "ios-bookmark" : "ios-bookmark-outline";
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
        let { sources, noteid, hl, hs } = this
        let { bookmark, tags } = hs
        this.bookmark = bookmark
        if (tags) this.tags = tags
        let nodes = hl.highlighter.getDoms(noteid)
        let imsgUrl = []
        let hasText = false
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i]
            if (node.innerText.length) {
                hasText = true
            }
            let imgs = node.querySelectorAll('img')
            for (let j = 0; j < imgs.length; j++) {
                let img = imgs[j]
                let { src } = img ? img : {}
                imsgUrl.push(src)
            }
        }
        if (imsgUrl.length) {
            this.img = imsgUrl
        }
        if (hasText == false && this.img) {
            this.showfortxt = false
            this.justify = 'start'
            if (sources) {
                this.imageNeedAdd = true
            }
        }
        this.initDefaultButton();
        this.updatePos()
        let picker = document.getElementsByClassName("ivu-color-picker-color");
        if (picker.length) picker[0].style.backgroundImage = "none";
    },
    methods: {
        onClickDelete(index) {
            this.hlSettings.deleteIndex(index);
            this.colorList = this.hlSettings.colorList;
        },
        zoomoutImg() {
            let a = this.hl.getElement(this.noteid)
            let img = a.querySelector("img")
            if (img) {
                let zoom = mediumZoom(img, {
                    //   container: ".markdown-section",
                    margin: 24,
                    background: "#838383",
                    scrollOffset: 0,
                });
                zoom.open();
                zoom.on("closed", () => {
                    zoom.detach();
                });
            }
        },
        onBookmark() {
            this.bookmark = this.bookmark == false
        },
        onClickBackGround(e) {
            this.enableDisableFont(e, tBackgroundColor);
        },
        updatePos() {
            let top = this.top - (this.showtagPane ? 140 : 80) - window.pageYOffset
            top = Math.max(0, top) + 'px'
            this.style = {
                left: this.menuLeft(),
                top
            }
        },
        menuLeft() {
            if (window.screen.availWidth < 450) return "0px";
            const content = getContentNode()
            // document.querySelector(".content");
            let panelLeft = this.left
            let el = document.querySelector('.my-remove-tip')
            if (el) {
                let a = el.getClientRects()[0].width;
                a = content.getClientRects()[0].width - a
                panelLeft =  Math.min(panelLeft,a)
            }

            return panelLeft + "px"
        },
        updateButtonColor(type, enable, colorhex) {
            if (type == tUl) {
                this.underlineColor = enable ? colorhex : undefined;
                this.UnderlineEnable = enable;
            } else if (type == tfontColor) {
                this.fontColor = enable ? colorhex : undefined;
                this.fontColorEnable = enable;
            } else {
                this.backGroundstyle
                    = `background-color:${colorhex}`
                this.backgroundColorEnable = enable
            }
        },
        initDefaultButton() {
            let aaa = [tUl, tfontColor, tBackgroundColor]
            aaa.forEach((a) => {
                let { enable, colorhex } = this.hlStyle.getType(a)
                if (colorhex == undefined) {
                    colorhex = this.hlStyle.getDefaultColor(a)
                }
                this.updateButtonColor(a, enable, colorhex)
                if (enable) {
                    if (colorhex != undefined) {
                        this.hlType = a
                        this.color1 = colorhex
                    }
                }
            })
        },
        updateSelection(a) {
            if (a != undefined) {
                let { enable, colorhex } = this.hlStyle.getType(a)
                this.updateButtonColor(a, enable, colorhex)
                if (colorhex != undefined)
                    this.color1 = colorhex
                this.hlType = a
                return
            }
        },
        col(i) {
            let a = "border-bottom:2px solid white;";
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
            this.enableDisableFont(e, tfontColor)
        },

        enableDisableFont(e, t) {
            e.stopPropagation();
            let { enable, colorhex } = this.hlStyle.getType(t)
            if (this.hlType == t || enable != true) {
                enable = enable == true ? false : true
            }
            if (colorhex == undefined || colorhex.length == 0) {
                if (colorhex == undefined || colorhex.length == 0) {
                    colorhex = this.hlStyle.getDefaultColor(t);
                }
            }
            let type = t
            this.hlStyle.render({ type, enable, colorhex })
            this.updateSelection(t)
        },
        onUnderline(e) {
            this.enableDisableFont(e, tUl)
        },
        onSearch() {
            // console.log("xx");
            this.removeSelectionHighLight();
            this.removeMenu();
        },
        onCopy(e) {
            e.stopPropagation()
            let { hl, hs } = this;
            hl.onCopy(hs);
        },
        notedata() {
            let { sources, tags, img, bookmark } = this;
            if (this.imageNeedAdd) {
                img = undefined
            }
            let style = this.hlStyle.getStyle();
            let note =
                this.notetext && this.notetext.length ? this.notetext : undefined;
            return { note, sources, style, tags, img, bookmark };
        },
        saveNoteData() {
            this.save(this.noteid, this.notedata());
            this.newnote = false;
        },
        // eslint-disable-next-line no-unused-vars
        removeSelectionHighLight() {
            this.saveNoteData();
        },
        onClickMask(e) {
            e.stopPropagation();
            let mask = document.querySelectorAll(".note-menu")[0];
            if (mask != e.target) return;
            this.removeSelectionHighLight();
            this.removeMenu();
        },
        onChangeColorPicker() {
            let type = this.hlType;
            let colorhex = this.color1
            this.hlSettings.addColor(colorhex)
            this.hlStyle.render({ type, enable: true, colorhex })
            this.updateSelection(type)
            this.saveNoteData()
        },
        removeMenu() {
            this.onCloseMenu()
            var tips = document.querySelectorAll(".note-menu");
            tips.forEach((tip) => {
                tip.parentNode.removeChild(tip);
            });
        },
        onDelete() {
            const id = this.noteid;
            let { hl } = window;
            hl.deleteId(id);
            this.removeMenu();
        },
    },
    model: {
        props: "bookmark"
    },
    props: {
        hs: {
            type: Object, default: {}
        },
        onCloseMenu: {
            type: Function,
            default: function () { }
        },
        colorhex: { type: String, default: "" },
        left: {
            type: Number,
            default: undefined,
        },
        sources: {
            type: Array,
            default: undefined,
        },
        save: { type: Function, default: undefined },
        hl: {
            type: Object,
            default: undefined,
        },
        top: {
            type: Number,
            default: undefined,
        }
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





