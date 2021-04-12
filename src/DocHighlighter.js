import Highlighter from 'web-highlighter';
import { Book } from './store';
import { User } from "./UserLogin";
import { log } from "./log";
import {getIntersection} from "./hl"
import { getConfig } from './ANoteConfig';
import { createHtml, mountCmp, parseurl, queryBox } from './utils';
import NoteMenu from './components/NoteMenu.vue'
import NoteMarker from './components/NoteMarker.vue'
import NoteBookmark from './components/NoteBookMark.vue'
import { hl_note, tUl, tfontColor } from './colorSelector';
import { highlightType } from './highlightType'
import ScrollMark from './components/ScrollMark'
import { UTILS } from './css_path'
const copyPasteBoard =require('clipboard-copy')

const removeTips = () => {
    var tips = document.getElementsByClassName('note-menu');
    tips.forEach(element => {
        element.parentNode.removeChild(element);
    });
}
// function getXPathForElement(element) {
//     const idx = (sib, name) => sib
//         ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name)
//         : 1;
//     const segs = elm => !elm || elm.nodeType !== 1
//         ? ['']
//         : elm.id && document.getElementById(elm.id) === elm
//             ? [`id("${elm.id}")`]
//             : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
//     return segs(element).join('/');
// }

// function getElementByXPath(path) {
//     return (new XPathEvaluator())
//         .evaluate(path, document.documentElement, null,
//             XPathResult.FIRST_ORDERED_NODE_TYPE, null)
//         .singleNodeValue;
// }
export class DocHighlighter {
    getIds(selected) {
        if (!selected || !selected.$node || !selected.$node.parentNode) {
            return [];
        }
        return [
            this.highlighter.getIdByDom(selected.$node.parentNode),
            ...this.highlighter.getExtraIdByDom(selected.$node.parentNode)
        ].filter(i => i);
    }
    count() {
        let { store } = this;
        if (store) {
            let aa = store.getAll();
            return aa.length;
        }
        return 0
    }
    disableUserSelection(disable) {
        var main = document.getElementsByClassName('content')[0]
        if (disable == false)
            main.classList.remove('disable-user-selection')
        else {
            main.classList.add('disable-user-selection')
        }
    }
    createNoteMenu = (node, sources) => {
        let id= node.dataset.highlightId;
        const position = this.getPosition(node);
        let { top, left } = position;
        removeTips();
        let hs = {}
        try {
            hs = this.store.geths(id)
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
        if (hs == undefined) {
            if(sources.length){
                hs = sources[0]
            }else{
                hs = {id}
            }
        }
        let hl = this;
        try {
            document.getSelection().removeAllRanges()
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
        this.disableUserSelection()
        let onCloseMenu = () => {
            this.disableUserSelection(false)
        }
        let section = document.body
        mountCmp(NoteMenu, { top, left, hl, sources, onCloseMenu,hs}, section)
    };
    procssAllElements(nodeid, cb) {
        const classname = 'docsify-highlighter'
        let node;
        try {
            node = this.highlighter.getDoms(nodeid)
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
    getElement(nodeid) {
        const classname = 'docsify-highlighter'
        let node;
        try {
            node = this.highlighter.getDoms(nodeid)[0];
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
        if (node) return node;
        let elements = document.getElementsByClassName(classname)
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i]
            try {
                if (element.dataset.highlightId == nodeid)
                    return element;
                // eslint-disable-next-line no-empty
            } catch (error) { }
        }
        return node;
    }
    getNoteColor(noteid) {
        try {
            let hs = this.store.geths(noteid)
            return hs.color
        } catch (error) {
            return undefined;
        }
    }

    updatePanel() {
        if (this.updatePanelCb) {
            this.updatePanelCb();
        }
    }

    onHoverOut(a) {
        let { id } = a;
        this.highlighter.removeClass('highlight-wrap-hover', id);
    }
    updateHignLightColor(noteid, color, colorhex, disable) {
        this.removeHighLight(noteid);
        this.procssAllElements(noteid, (a) => {
            if (disable) {
                colorhex = ""
            }
            if (color == tUl) {
                if (colorhex != "")
                    a.style.borderBottom = "2px solid " + colorhex
                else
                    a.style.borderBottom = ""
            } else if (color == tfontColor) {
                a.style.color = colorhex
            } else {
                a.style.backgroundColor = colorhex
            }
        })
    }

    // eslint-disable-next-line no-unused-vars
    removeHighLight(noteid) {
    }

    onHover(a) {
        if (this.on()) {
            let { id } = a;
            this.highlighter.addClass('highlight-wrap-hover', id);
            return;
        }
    }

    on() {
        return getConfig().on;
    }


    constructor() {
        this.$root = document
        let checkUserStatus = ({ next }, changed) => {
            if (changed == false) {
                this.enable(false)
            } else {
                let a = () => {
                    this.createHightLigher()
                    this.enable(true)
                    this.updatePanel()
                }
                let userDataUpdate = async () => {
                    let b = new Book()
                    if (b.count() == 0) {
                        try {
                            a()
                            return
                            // eslint-disable-next-line no-empty
                        } catch (error) {
                        }
                        let title = ""
                        let content = "登录是否导入当前记录?"
                        let onOk = () => {
                            b.importFromUnNamed().then(() => {
                                a();
                            }).catch(() => {
                                a();
                            })
                        }
                        let onCancel = () => {
                            a();
                        }
                        queryBox({ title, content, onOk, onCancel })
                    } else {
                        a()
                    }
                }
                if (next) {
                    userDataUpdate().then(() => {

                    }).catch((e) => {
                        console.log(e)
                    })
                } else {
                    a()
                }
            }
        }
        checkUserStatus = checkUserStatus.bind(this)
        User.addCallback(checkUserStatus)
        this.unregister = () => {
            User.addCallback(checkUserStatus, true)
        }
        let handleImageClick = (e) => {
            // console.log(window.location)
            try {
                let menu = document.getElementsByClassName("note-menu")
                if (menu && menu.length) return

                let ele = e.target
                let find = false
                let ssss = document.querySelectorAll('.markdown-section img')
                for (let i = 0; i < ssss.length; i++) {
                    if (ele == ssss[i]) {
                        find = true;
                        break
                    }
                }
                if (find == false) return

                let { tagName } = ele
                if (tagName == 'IMG') {
                    e.stopPropagation()
                    let yes = ele.parentElement.classList.contains("docsify-highlighter")
                    if (yes) {
                        let { parentElement } = ele
                        this.createNoteMenu(parentElement)
                    } else {
                        const createUUID = (a) => {
                            return a
                                ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
                                : ((([1e7])) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/gu, createUUID);
                        }
                        let id = createUUID()
                        let parentTagName = 'img'
                        let parentIndex
                        let textOffset = 0
                        let imgs = document.querySelectorAll(parentTagName)
                        for (let i = 0; i < imgs.length; i++) {
                            if (ele == imgs[i]) {
                                parentIndex = i
                                break
                            }
                        }
                        let startMeta = { parentTagName, parentIndex, textOffset }
                        let endMeta = startMeta
                        let imgsrc = getEleSrc(ele);
                        let text = ""
                        let hs = { startMeta, endMeta, id, imgsrc, text }
                        let sources = [hs]
                        let wrap = document.createElement('i')
                        wrap.classList.add('docsify-highlighter')
                        // wrap.classList.add('highlight-mengshou-wrap')
                        wrap.dataset['highlightId'] = id
                        ele.parentElement.replaceChild(wrap, ele)
                        wrap.appendChild(ele)
                        this.createNoteMenu(wrap, sources)
                    }
                }
                // eslint-disable-next-line no-empty
            } catch (error) {
            }
            console.log(e)
        }
        document.addEventListener("click", handleImageClick);
        this.parseurlResult = parseurl();



        this.createHightLigher();

        if (this.on()) {
            this.enable(true);
        }
    }
    createHightLigher() {
        const onClick = (noteid) => {
            // const classname = 'docsify-highlighter'
            let { id } = noteid;
            let node = this.getElement(id)
            this.createNoteMenu(node)
        };
        let {$root} = this;
        this.highlighter = new Highlighter({
            $root,
            wrapTag: 'i',
            exceptSelectors: ['.html-drawer', '.my-remove-tip', '.op-panel', '.hl-ignored', '.charpterhtml'],
            style: {
                className: 'docsify-highlighter'
            }
        });
        this.highlighter.on(Highlighter.event.HOVER, this.onHover.bind(this));
        this.highlighter.on(Highlighter.event.HOVER_OUT, this.onHoverOut.bind(this));
        // this.highlighter.on(Highlighter.event.REMOVE, this.onRemove.bind(this));
        this.highlighter.on(Highlighter.event.CREATE, this.onCreate.bind(this));
        this.highlighter.on(Highlighter.event.CLICK, onClick);
        this.highlighter.hooks.Render.WrapNode.tap((id, selectedNodes) => {
            return selectedNodes
        });

        this.highlighter.hooks.Render.SelectedNodes.tap((id, selectedNodes) => {
            let last = selectedNodes[selectedNodes.length - 1]
            if (last.splitType != 'tail') return []
            if (selectedNodes.length === 0) {
                return [];
            }
            selectedNodes = selectedNodes.filter((selected) => {
                try {
                    let parent = selected.$node.parentNode;
                    if (parent.style.display == 'none' || parent.classList.contains('hl-ignored')) {
                        return false;
                    }
                    // eslint-disable-next-line no-empty
                } catch (error) {
                }
                return true
            })
            const candidates = selectedNodes.slice(1).reduce(
                (left, selected) => getIntersection(left, this.getIds(selected)),
                this.getIds(selectedNodes[0])
            );
            for (let i = 0; i < candidates.length; i++) {
                if (this.highlighter.getDoms(candidates[i]).length === selectedNodes.length) {
                    return [];
                }
            }

            return selectedNodes;
        });

        // this.highlighter.hooks.Serialize.Restore.tap(
        //     source => log('Serialize.Restore hook -', source)
        // );

        // this.highlighter.hooks.Serialize.RecordInfo.tap(() => {
        //     const extraInfo = Math.random().toFixed(4);
        //     log('Serialize.RecordInfo hook -', extraInfo);
        //     return extraInfo;
        // });
    }

    deleteId(id) {
        let { highlighter } = this;
        this.removeHighLight(id)
        highlighter.removeClass(hl_note, id)
        highlighter.removeClass("highlight-wrap-hover", id);
        highlighter.removeClass("highlight-tags", id);
        highlighter.remove(id);
        this.store.remove(id);
        this.updatePanel();
    }
    enable(enable) {
        if (enable) {
            this.store = new Book().toc.CharpterStorage()
        }
        getConfig().save({ on: enable })
        this.turnHighLight(enable);
    }
    onCopy(hs) {
        let {text} = hs?hs:{}
        if(text){
            copyPasteBoard(text)
        }
    }
    onCreate = (a) => {
        let { sources, type } = a;
        sources.forEach(hs => {
            try {
                this.highlighter.addClass('docsify-highlighter', hs.id);
                // eslint-disable-next-line no-empty
            } catch (error) {
            }
        })
        if (type == "from-store") {
            this.store.getAll()
            let creatFromStore = (hs) => {
                let hhs = this.store.geths(hs.id)
                let { id, style, note, bookmark, tree } =  hhs
                let a = new highlightType(this, hhs)
                a.showHighlight()
                let parentNodeId = this.parentNodeId(id)
                if (parentNodeId == undefined) {
                    if (tree == undefined) {
                        tree = this.getHtml(id).tree
                        this.store.update({ id, tree, version: '0.22' })
                    }
                }
                if (note && note.length) {
                    this.createMarkNode(id, note);
                }
                if (bookmark) {
                    this.createBookmarkNode(id)
                }
                this.addTagBackground(style, id);
                if (this.parseurlResult.noteid == hs.id) {
                    this.scollTopID(hs.id);
                }
            }
            creatFromStore = creatFromStore.bind(this);
            sources.forEach((hs) => {
                creatFromStore(hs)
            })
            this.updatePanel()
        } else {
            log('create -', sources);
            sources.forEach(hs => {
                let title = document.title
                hs.title = title;
            })
            let hs = sources[0]
            let menu = document.getElementsByClassName("note-menu")
            if (menu && menu.length) {
                this.highlighter.remove(hs.id);
                return;
            }
            this.createNoteMenu(this.getElement(hs.id), sources)
        }
    };
    parentNodeId(noteid) {
        let highlightIdExtra;
        try {
            this.highlighter.getDoms(noteid).forEach((node) => {
                if (highlightIdExtra == undefined)
                    highlightIdExtra = node.dataset.highlightIdExtra
                if (highlightIdExtra == undefined || highlightIdExtra.length == 0)
                    highlightIdExtra = undefined
            })
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
        return highlightIdExtra;
    }
    getHtml = (noteid) => {
        let parent = new Set();
        let doms = this.highlighter.getDoms(noteid);
        doms.forEach((a) => {
            console.log(a)
        })
        // let html = ""
        this.highlighter.getDoms(noteid).forEach((node) => {
            parent.add(node.parentElement)
        });
        let ret = []
        let styleList = []
        parent.forEach((node) => {
            const buildTree = (node) => {
                let ii = node.children
                let { tagName } = node;
                let children = []
                for (let i = 0; i < ii.length; i++) {
                    let el = ii[i];
                    let a = buildTree(el)
                    if (a.length) {
                        children.push(a)
                    }
                    if (el.classList.contains('docsify-highlighter')) {
                        let { tagName } = el;
                        let style = el.getAttribute("style")
                        if (styleList.indexOf(style) == -1) {
                            styleList.push(style)
                        }
                        style = styleList.indexOf(style)
                        let text = el.innerText;
                        let child = { tagName, text, style }
                        children.push(child)
                        // console.log(child);
                    }
                }
                return { tagName, children }
            }
            let a = buildTree(node)
            //     el.removeAttribute("data-highlight-id")
            //     el.removeAttribute("data-highlight-split-type")
            //     el.removeAttribute("data-highlight-id-extra")
            ret.push(a)
        })
        let tree = { nodes: ret, styleList }
        let html = createHtml(tree)
        return { html, tree }
    }

    saveNoteData = (noteid, data) => {
        let { note, sources, style, tags, img, bookmark } = data ? data : {}
        let change = style != undefined || note || tags.length || img && img.length || bookmark
        let highlightIdExtra = this.parentNodeId(noteid)
        let tree, version = '0.22';

        if (highlightIdExtra == undefined) {
            let a = this.getHtml(noteid)
            tree = a.tree
            let hsparent = this.store.geths(highlightIdExtra)
            if (hsparent) {
                let child = noteid
                this.store.update({ id: highlightIdExtra, child })
                let styleparent = hsparent.style
                if (styleparent && style) {
                    style = { ...styleparent, ...style }
                }
            }
        } else {
            let { tree } = this.getHtml(highlightIdExtra)
            this.store.update({ id: highlightIdExtra, tree, version })
        }

        if (note) {
            this.highlighter.addClass(hl_note, noteid);
            this.removeMarkNode(noteid)
            this.createMarkNode(noteid, note)
        } else {
            this.highlighter.removeClass(hl_note, noteid)
            this.removeMarkNode(noteid);
        }
        if (bookmark) {
            this.removeBookmarkNode(noteid)
            this.createBookmarkNode(noteid)
        } else {
            this.removeBookmarkNode(noteid)
        }
        this.addTagBackground(data, noteid);
        if (change && noteid != undefined) {
            if (sources) {
                let sources2 = sources.map(hs => {
                    if (style) {
                        hs.style = style;
                    }
                    if (note) {
                        hs.note = note
                    }
                    let { date } = hs;
                    if (date == undefined) {
                        hs.date = new Date() * 1;
                    }
                    let text = ''
                    this.highlighter.getDoms(noteid).forEach((a) => {
                        text = text + a.innerText
                    })
                    hs.text = text
                    hs.tags = tags
                    hs.top = this.getElementPosition(noteid)
                    hs.csspath = this.getElementCssPath(hs)
                    hs.bookmark = bookmark
                    hs.tree = tree
                    hs.version = version
                    return hs
                })
                sources2 = sources2.map(hs => ({ hs }));
                this.store.save(sources2);
            } else {
                this.store.update({ id: noteid, note, style, tags, bookmark, tree, version })
            }
        } else {
            this.removeHighLight(noteid);
            this.deleteId(noteid);
        }
        Book.updated = true;
        this.updatePanel();
    };
    addTagBackground(hs, noteid) {
        let { tags, style } = hs
        let need = (tags && tags.length);
        if (need) {
            if (style && Object.keys(style).length) {
                need = false;
            }
        }
        if (need) {
            this.highlighter.addClass('highlight-tags', noteid);
        }
    }

    replacementHS(hs) {
        let { startMeta, endMeta, text, csspath } = hs;
        if (csspath == undefined) {
            csspath = {}
        }
        let begin = startMeta.textOffset;
        let end = endMeta.textOffset;
        let nodes = document.querySelectorAll(startMeta.parentTagName)
        let getParentIndex = (endMeta, node) => {
            let { parentTagName, parentIndex } = endMeta
            let nn = this.$root.querySelectorAll(parentTagName)
            for (let i = 0; i < nn.length; i++) {
                let x = nn[i]
                if (node == x) {
                    parentIndex = i;
                    return { parentIndex }
                }
            }
            return {}
        }
        for (let idx = 0; idx < nodes.length; idx++) {
            let node = nodes[idx]
            let { innerText } = node;
            let same = (startMeta.parentIndex == endMeta.parentIndex && startMeta.parentTagName == endMeta.parentTagName)
            if (startMeta.parentIndex == endMeta.parentIndex && startMeta.parentTagName == endMeta.parentTagName) {
                innerText = innerText.substring(begin, end)
            } else {
                innerText = innerText.substring(begin)
            }
            if (innerText.length == 0) continue;
            if (text.indexOf(innerText) != 0) continue
            let endElement;
            if (same) {
                endElement = node
            } else {
                if (endMeta.parentTagName == startMeta.parentTagName) {
                    let index = startMeta.parentIndex
                    startMeta = { ...startMeta, ...getParentIndex(node) }
                    let { parentIndex } = endMeta;
                    parentIndex = parentIndex + index - startMeta.parentIndex
                    endMeta = { ...endMeta, ...{ parentIndex } }
                    console.log('find end')
                    return { ...hs, ...{ startMeta, endMeta } }
                }
                let parents = this.$root.querySelectorAll(endMeta.parentTagName);
                let a = text.substring(text.length - end)
                for (let i = 0; i < parents.length; i++) {
                    let span = parents[i]
                    let b = span.innerText.substring(0, end)
                    if (b.length == end && a.indexOf(b) == 0) {
                        endElement = span;
                        break;
                    }
                }
            }
            if (endElement) {

                endMeta = { ...endMeta, ...getParentIndex(endMeta, endElement) }
                startMeta = { ...startMeta, ...getParentIndex(startMeta, node) }
                console.log('find end')
                return { ...hs, ...{ startMeta, endMeta } }
            } else {
                let parents = this.$root.querySelectorAll(endMeta.parentTagName);
                // eslint-disable-next-line no-unused-vars
                // let a = text.substring(text.length - end - 1)
                let aa = []
                for (let i = 0; i < parents.length; i++) {
                    let span = parents[i]
                    let b = span.innerText.substring(0, end + 1)
                    if (b.length) {
                        aa.push(b)
                    }
                }

            }
        }
        if(hs.startMeta.parentTagName!='img'){
            console.warn('not find ',hs)
        }
        return hs
    }
    checkHS(hs) {
        return this.replacementHS(hs)
    }
    load = (loaded) => {
        if (loaded) {
            let { store, highlighter } = this;
            const storeInfos = store.getAll();
            storeInfos.forEach(
                ({ hs }) => {
                    try {
                        let node = this.getElement(hs.id);
                        if (node != undefined) {
                            this.updateHignLightColor(hs.id, hs.color, hs.colorhex);
                            return;
                        }
                        // eslint-disable-next-line no-empty
                    } catch (error) {
                    }
                    hs = this.checkHS(hs)
                    if (hs.imgsrc) {
                        let { startMeta, id } = hs;
                        let { parentTagName, parentIndex } = startMeta
                        let ele = document.querySelectorAll(parentTagName)[parentIndex]
                        let wrap = document.createElement('i')
                        wrap.classList.add('docsify-highlighter')
                        // wrap.classList.add('highlight-mengshou-wrap')
                        wrap.dataset['highlightId'] = id
                        if (ele) {
                            ele.parentElement.replaceChild(wrap, ele)
                            wrap.appendChild(ele)
                        }
                    } else {
                        highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id, hs.extra)
                    }
                }
            );
        } else {
            removeTips();
            let { store } = this;
            const storeInfos = store.getAll();
            storeInfos.forEach(
                ({ hs }) => {
                    this.removeHighLight(hs.id)
                }
            );
        }

    };
    createMarkNode(id, note) {
        let el = this.getElement(id);
        if (el) {
            let content = note;
            let hl = this;
            mountCmp(NoteMarker, { noteid: id, content, hl }, el);
        }
    }
    createBookmarkNode(id) {
        let el = this.getElement(id);
        if (el) {
            mountCmp(NoteBookmark, { noteid: id }, el);
        }
    }
    removeMarkNode(noteid) {
        this.procssAllElements(noteid, (el) => {
            if (el) {
                let a = el.getElementsByClassName('notemarker');
                for (let i = 0; i < a.length; i++) {
                    let b = a[i];
                    b.parentNode.removeChild(b);
                }
            }
        });
    }
    removeBookmarkNode(noteid) {
        let cls = "note-bookmark"
        this.procssAllElements(noteid, (el) => {
            if (el) {
                let a = el.getElementsByClassName(cls);
                for (let i = 0; i < a.length; i++) {
                    let b = a[i];
                    b.parentNode.removeChild(b);
                }
            }
        });
    }
    getElementCssPath(hs) {
        function fullPath(el) {
            if (el == undefined || el == null) return undefined
            return UTILS.cssPath(el, true)
        }
        let { startMeta, endMeta } = hs
        function getEle(startMeta) {
            try {
                let { parentIndex, parentTagName } = startMeta
                let ele = document.querySelectorAll(parentTagName)[parentIndex]
                return ele
            } catch (error) {
                return
            }
        }
        let start = fullPath(getEle(startMeta))
        let end = fullPath(getEle(endMeta))
        let csspath = { start, end }
        return csspath
    }
    getElementPosition(id) {
        let ret = {};
        this.procssAllElements(id, (a) => {
            let pos = this.getPosition(a);
            if (pos) {
                let { top } = pos;
                if (ret.top == undefined) {
                    ret = pos
                } else {
                    if (top > ret.top) {
                        ret = pos
                    }
                }
            }
        })
        return ret;
    }
    scollTopID(id) {
        let { top } = this.getElementPosition(id);
        if (top != undefined) {
            window.scrollTo(0, top - 120);
            let b = document.getElementsByClassName('content')[0]
            let pp = this.getPosition(b)
            mountCmp(ScrollMark, { id, hl: this, left: pp.left + 10, top }, document.body);
        }
    }
    // offsetHeight: 40
    // offsetLeft: 15
    // offsetParent: article#main.markdown-section
    // offsetTop: 30
    // offsetWidth: 68
    getPosition = ($node) => {
        let offset = {
            top: 0,
            left: 0,
            height: $node.offsetHeight
        };
        while ($node) {
            offset.top += $node.offsetTop;
            offset.left += $node.offsetLeft;
            $node = $node.offsetParent;
        }
        offset.bottom = offset.top + offset.height;
        return offset;
    };


    turnHighLight(enable) {
        let { highlighter } = this;
        if (enable) {
            highlighter.run();
        } else {
            highlighter.dispose();
            highlighter.stop();
        }
        this.load(enable);
    }
}
function getEleSrc(ele) {
    let imgsrc = ele.src;
    let url = new URL(imgsrc);
    let host = url.host;
    let currenthost = new URL(document.URL).host;
    if (host == currenthost) {
        let { host, pathname } = document.location
        let aaa = `${host}${pathname}`
        return imgsrc.split(aaa)[1]
    }
    return imgsrc;
}

export function preHighLightItems() {
    let children = [];
    document.getElementsByClassName("hl").forEach((a) => {
        children.push(a);
    });
    children = children.map((a) => {
        let label = a.innerText;
        let className = a.className;
        return { label, className, node: a };
    });
    return children;
}
