import Highlighter from 'web-highlighter';
import { Book } from './store';
import { User } from "./UserLogin";
import { log } from "./log";
import { getIntersection } from "./hl"
import { getConfig } from './ANoteConfig';
import { createHtml, mountCmp, insertComponentAfter, parseurl, queryBox, getImgSrcUrl } from './utils';
import NoteMenu from './components/NoteMenu.vue'
import NoteMarker from './components/NoteMarker.vue'
import NoteBookmark from './components/NoteBookMark.vue'
import { hl_note, tUl, tfontColor } from './colorSelector';
import { highlightType } from './highlightType'
import ScrollMark from './components/ScrollMark'
import { UTILS } from './css_path'
import NoteImg from './components/NoteImg.vue'
const copyPasteBoard = require('clipboard-copy')

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
        let id = node.dataset.highlightId;
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
            if (sources.length) {
                hs = sources[0]
            } else {
                hs = { id }
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
        mountCmp(NoteMenu, { top, left, hl, sources, onCloseMenu, hs }, section)
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
        this.$root = document.querySelector('article')
        this.innerText = document.querySelector('article').innerText
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
                let ssss = this.$root.querySelectorAll('.markdown-section img')
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
                        let imgs = this.$root.querySelectorAll(parentTagName)
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
                        if (ele) {
                            let wrap = mountCmp(NoteImg, { id, hl: this, imgElement: ele }, ele, true).$el
                            this.createNoteMenu(wrap, sources)
                        }
                    }
                }
                // eslint-disable-next-line no-empty
            } catch (error) {
            }
            console.log(e)
        }
        this.enalbeClickListener = (enable) => {
            if (enable) {
                document.addEventListener("click", handleImageClick);
            } else {
                document.removeEventListener("click", handleImageClick);
            }
        }
        this.enalbeClickListener(true);
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
        let { $root } = this;
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
            if (selectedNodes.length === 0) {
                return [];
            }
            let last = selectedNodes[selectedNodes.length - 1]
            if (last.splitType != 'tail') {
                if (last.splitType == 'both' && selectedNodes.length == 1) {
                    return selectedNodes
                }
                console.error("selectedNodes", selectedNodes.length, last.splitType);
                return []
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

    deleteId(id, store) {
        let { highlighter } = this;
        this.procssAllElements(id, (a) => {
            let n = a.querySelectorAll('.imgzoombtn')
            for (let i = 0; i < n.length; i++) {
                let b = n[i];
                b.parentNode.removeChild(b);
            }
        })
        this.removeHighLight(id)
        highlighter.removeClass(hl_note, id)
        highlighter.removeClass("highlight-wrap-hover", id);
        highlighter.removeClass("highlight-tags", id);
        highlighter.remove(id);
        if (store == undefined) {
            store = this.store
        }
        store.remove(id);
        // this.repairToc()
        this.updatePanel();
    }
    enable(enable) {
        if (enable) {
            this.store = new Book().toc.CharpterStorage()
        }
        getConfig().save({ on: enable })
        this.turnHighLight(enable);
    }
    searchInDom(text, trim) {
        if (this.textNodes == undefined) {
            let nodeIterator = document.createNodeIterator(
                this.$root,
                NodeFilter.SHOW_TEXT,
                {
                    // eslint-disable-next-line no-unused-vars
                    acceptNode(node) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );
            let currentNode;
            currentNode = nodeIterator.nextNode();
            this.textNodes = []
            while (currentNode) {
                let trim = currentNode.wholeText.replace(/\u3000| |\t/g, '')
                if (trim != "\n") {
                    let parentElement = currentNode.parentElement
                    if (parentElement) {
                        this.textNodes.push({ currentNode, trim, parentElement })
                    }
                    // console.log(trim)
                }
                currentNode = nodeIterator.nextNode()
            }
        }
        const pars = [];
        this.textNodes.forEach((n) => {
            let a = n.trim.indexOf(trim)
            if (a >= 0) {
                let { currentNode } = n;
                let element = currentNode.parentElement
                if (element) {
                    let textOffset = element.innerText.indexOf(text)
                    if (textOffset == -1) {
                        textOffset = element.innerText.indexOf(trim)
                    }
                    pars.push({ element, textOffset, text });
                }
            }
        })
        if (pars.length)
            return pars
        return
    }
    onCopy(hs) {
        let { text, id } = hs ? hs : {}
        let url = "";
        if (id) {
            let charpter = this.store.Chapter();
            id = charpter.url(id)
            if (id) { url = decodeURI(id) }
        }
        let ret = url + "\n\n" + (text ? text : "")
        copyPasteBoard(ret)
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
            let creatFromStore = (hs) => {
                let hhs = this.store.geths(hs.id)
                let { id, style, note, bookmark, tree } = hhs
                let a = new highlightType(this, hhs)
                a.showHighlight()
                let parentNodeId = this.parentNodeId(id)
                let pos = this.getHSPostion(hs)
                this.store.update({ ...{ id }, ...pos })
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
    convertNote2TreeNode = (el, styleList) => {
        let { tagName } = el;
        let style = el.getAttribute("style")
        if (styleList.indexOf(style) == -1) {
            styleList.push(style)
        }
        style = styleList.indexOf(style)
        let text = el.innerText;
        let child = { tagName, text, style }
        return child
    }
    buildTree = (node, styleList) => {
        let ii = node.children
        let { tagName } = node;
        let children = []
        for (let i = 0; i < ii.length; i++) {
            let el = ii[i];
            let a = this.buildTree(el, styleList)
            if (a.children.length) {
                children.push(a)
            }
            if (el.classList.contains('docsify-highlighter')) {
                let child = this.convertNote2TreeNode(el, styleList)
                children.push(child)
                // console.log(child);
            }
        }
        return { tagName, children }
    }
    getHtml = (noteid, checkparent) => {
        let parent = new Set();
        let parentNode = document.createElement("div");
        let ret = []
        let styleList = []
        if (checkparent) {
            this.highlighter.getDoms(noteid).forEach((node) => {
                let find = false;
                parent.forEach((a) => {
                    a.querySelectorAll(".docsify-highlighter").forEach((b) => {
                        if (find == false) {
                            find = b == node;
                        }
                    })
                })
                if (find == false) {
                    parent.add(node.parentElement)
                }
            });
        } else {
            this.highlighter.getDoms(noteid).forEach((node) => {
                let child = this.convertNote2TreeNode(node, styleList)
                ret.push(child);
            })
            parent.add(parentNode)
        }
        parent.forEach((node) => {
            let a = this.buildTree(node, styleList)
            ret.push(a)
        })
        let tree = { nodes: ret, styleList }
        let html = createHtml(tree)
        return { html, tree }
    }
    search = (text, ptns) => {
        let maxlen = 0;
        ptns.forEach((a) => {
            maxlen = a.length + maxlen;
        })
        let findstr = (str, ptn) => {
            // let re = new RegExp(ptn, "g")
            // return [...str.matchAll(re)]
            let hacker = [];
            let i = 0;
            while (~(i = str.indexOf(ptn, i + ptn.length))) hacker.push(i);
            return hacker.map((a) => {
                let ret = { index: a }
                ret[0] = ptn
                return ret
            })
        }
        let keyResult
        let allResult = []
        ptns.forEach((a) => {
            let r = findstr(text, a)
            if (r.length == 1) {
                if (keyResult == undefined) {
                    keyResult = r[0];
                } else if (keyResult.index < r[0].index) {
                    keyResult = r[0];
                }
            }
            r.forEach((a) => {
                allResult.push(a)
            })
        })
        if (keyResult) {
            let ret = Math.max(0, keyResult.index - maxlen + keyResult[0].length)
            // console.log(ptns.join(""), ret)
            return ret
        }
        return
    }
    getTextIndex(noteid) {
        let ptns = this.highlighter.getDoms(noteid).map((a) => {
            if (a.innerText.length) {
                return a.innerText
            }
            return
        }).filter((a) => a != undefined)
        return this.search(this.innerText, ptns)
    }

    saveNoteData = (noteid, data) => {
        let { note, sources, style, tags, img, bookmark } = data ? data : {}
        let change = style != undefined && Object.keys(style).length || note || tags.length || img && img.length || bookmark
        let highlightIdExtra = this.parentNodeId(noteid)
        let tree, version = '0.22';

        if (highlightIdExtra == undefined) {
            let a = this.getHtml(noteid, false);
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
            let { tree } = this.getHtml(highlightIdExtra, true)
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
                    hs.csspath = this.getElementCssPath(hs)
                    hs.bookmark = bookmark
                    hs.tree = tree
                    hs.version = version
                    hs = { ...hs, ...this.getHSPostion(hs) }
                    return hs
                })
                sources2 = sources2.map(hs => ({ hs }));
                this.store.save(sources2);
                // this.repairToc();
            } else {
                let textIndex = this.getTextIndex(noteid);
                this.store.update({ id: noteid, note, style, tags, bookmark, tree, version, textIndex })
            }
        } else {
            this.removeHighLight(noteid);
            this.deleteId(noteid);
        }
        Book.updated = true;
        this.updatePanel();
    };
    getHSPostion(hs) {
        let noteid = hs.id
        let top = this.getTopElementPosition(noteid);

        let textIndex = this.getTextIndex(noteid);

        if (textIndex == undefined) {
            let ptns = this.getHSText(hs);
            if (ptns) {
                textIndex = this.search(this.innerText, ptns)
            }
        }
        if (textIndex == undefined)
            textIndex = hs.textIndex
        if (top == undefined) {
            top = hs.top
        }
        return { top, textIndex }
    }

    getHSText(hs) {
        let { tree } = hs;
        const concatchild = (children) => {
            return children.map((a) => {
                let { text, children } = a;
                if (children) {
                    return concatchild(children);
                }
                if (text == undefined || text == null) { return "" }
                return text;
            }).join("")
        }
        if (tree && tree.nodes) {
            return tree.nodes.map((a) => {
                let { text, children } = a;
                if (children)
                    return concatchild(children)
                if (text == undefined || text == null) { return "" }
                return text;
            }).filter((a) => {
                let yes = a && a.length;
                return yes;
            });
        }
        return undefined;
    }

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
    getMetaElement(meta) {
        let nodes = this.$root.querySelectorAll(meta.parentTagName)
        try {
            nodes[meta.parentIndex]
        } catch (error) {
            return
        }
    }
    fixMeta = (hs) => {
        const { text } = hs
        let trimstring = (s) => {
            return s.replace(/\u3000| |\t/g, '');
        }
        let textTrimed = trimstring(text)
        let ptns = this.getHSText(hs);
        if (ptns == undefined) return
        let xxx = ptns.map((a) => {
            let trim = trimstring(a);
            let textOffset = textTrimed.indexOf(trim);
            return { value: a, trim, index: textOffset }
        }).sort((a, b) => {
            return a.textOffset - b.textOffset;
        })
        // let e1 = this.getMetaElement(startMeta)
        // let e2 = this.getMetaElement(endMeta)
        // const findTextInElement = (e1, { value, trim }) => {
        //     if (e1) {
        //         let t = trimstring(e1.innerText)
        //         if (e1.innerText.indexOf(value) != -1) return true;
        //         if (t.indexOf(trim) != -1) return true;
        //     }
        //     return
        // }
        // if (findTextInElement(e1, ptns[0]) && findTextInElement(e2, ptns[ptns.length - 1])) {
        //     return hs;
        // }
        let beginTag = trimstring(xxx[0].value)
        let endTag = trimstring(xxx[xxx.length - 1].value)
        console.log(beginTag, endTag)
        let searchResult = xxx.map((a) => {
            let { value, trim } = a
            return this.searchInDom(value, trim)
        })


        let node1 = searchResult[0];
        let node2 = searchResult[searchResult.length - 1];

        if (node1 == undefined || node1.length > 1 || node2 == undefined || node2.length > 1) {
            let begin, end;
            searchResult.forEach((a, idx) => {
                if (a.length == 1) {
                    if (begin == undefined) {
                        begin = idx
                    }
                    end = idx;
                }
            })
            if (begin != undefined) {
                let node = searchResult[begin][0]
                for (let i = begin - 1; i >= 0; i--) {
                    let prev = searchResult[i].filter((a) => {
                        let { element } = a;
                        if (element == node.element) return true;
                        let ret = node.element.compareDocumentPosition(element)
                        if (ret & (Node.DOCUMENT_POSITION_PRECEDING + Node.DOCUMENT_POSITION_CONTAINED_BY)) {
                            return true;
                        }
                    })
                    prev = prev.sort((a, b) => {
                        let ret = a.element.compareDocumentPosition(b.element)
                        if (ret & Node.DOCUMENT_POSITION_FOLLOWING) {
                            return -1;
                        } else {
                            return 1;
                        }
                    })
                    node = prev[prev.length - 1]
                    searchResult[i] = [node]
                }
                // console.log('begin', node, node.element.innerText);
                node1 = node
            }
            if (end != undefined) {
                let node = searchResult[end][0]
                for (let i = end + 1; i < searchResult.length; i++) {
                    let prev = searchResult[i].filter((a) => {
                        let { element } = a;
                        if (element == node.element) return true;
                        let ret = node.element.compareDocumentPosition(element)
                        if (ret & Node.DOCUMENT_POSITION_FOLLOWING + Node.DOCUMENT_POSITION_CONTAINED_BY) {
                            return true;
                        }
                    })
                    prev = prev.sort((a, b) => {
                        let ret = a.element.compareDocumentPosition(b.element)
                        if (ret & (Node.DOCUMENT_POSITION_FOLLOWING)) {
                            return -1;
                        } else {
                            return 1;
                        }

                    })[0];
                    node = prev;
                    searchResult[i] = [node]
                    // console.log(prev);
                }
                // console.log('end', node, node.element.innerText);
                node2 = node
            }
        } else {
            node1 = node1[0]
            node2 = node2[0]
        }
        let dom2meta = (e) => {
            let { element, textOffset } = e
            let parentTagName = element.tagName
            let { parentIndex } = this.getParentIndex({ parentTagName }, element)
            let startMeta = { parentTagName, parentIndex, textOffset }
            return startMeta
        }

        if (node1 && node2) {
            let startMeta = dom2meta(node1)
            let endMeta = dom2meta(node2)
            let { text } = searchResult[searchResult.length - 1][0]
            endMeta.textOffset = text.length
            return { ...hs, ...{ startMeta, endMeta } }
        }
    }
    getParentIndex = (endMeta, node) => {
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
    replacementHS(hs) {

        let { startMeta, endMeta, text, csspath } = hs;
        if (csspath == undefined) {
            csspath = {}
        }



        let begin = startMeta.textOffset;
        let end = endMeta.textOffset;
        let nodes = this.$root.querySelectorAll(startMeta.parentTagName)
        for (let idx = 0; idx < nodes.length; idx++) {
            let node = nodes[idx]
            let { innerText } = node;
            let same = (startMeta.parentIndex == endMeta.parentIndex && startMeta.parentTagName == endMeta.parentTagName)
            let endElement;
            if (startMeta.parentIndex == endMeta.parentIndex && startMeta.parentTagName == endMeta.parentTagName) {
                if (innerText.length >= text.length) {
                    let childNodes = []
                    for (let j = 0; j < node.childNodes.length; j++) {
                        childNodes.push(node.childNodes[j])
                    }
                    innerText = childNodes.filter((a) => {
                        if (a.classList)
                            return a.classList.contains("hl-ignored") ? false : true;
                        return true
                    }).map((a) => {
                        return a.textContent
                    }).join("")
                    text = text.replace(/\u3000| |\t/g, '')
                    innerText = innerText.replace(/\u3000| |\t/g, '')
                } else {
                    innerText = ""
                }

            } else {
                innerText = innerText.substring(begin)
            }
            if (innerText.length == 0) continue;
            if (text.indexOf(innerText) != 0) continue
            if (same) {
                endElement = node
            } else {
                if (endMeta.parentTagName == startMeta.parentTagName) {
                    let index = startMeta.parentIndex
                    startMeta = { ...startMeta, ...this.getParentIndex(node) }
                    let { parentIndex } = endMeta;
                    parentIndex = parentIndex + index - startMeta.parentIndex
                    endMeta = { ...endMeta, ...{ parentIndex } }
                    // console.log('find end')
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

                endMeta = { ...endMeta, ...this.getParentIndex(endMeta, endElement) }
                startMeta = { ...startMeta, ...this.getParentIndex(startMeta, node) }
                // console.log('find end')
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
        if (hs.startMeta.parentTagName != 'img') {
            try {
                let xxx = this.fixMeta(hs)
                if (xxx) {
                    return xxx
                }
            } catch (error) {
                console.error(error)
            }
            console.warn('not find ', hs)
        }
        return hs
    }
    checkHS(hs) {
        return this.replacementHS(hs)
    }
    updateAllPositions() {
        let { store } = this;
        const storeInfos = store.getAll();
        storeInfos.forEach(
            ({ hs }) => {
                let { id } = hs;
                let pos = this.getHSPostion(hs)
                store.update({ ...{ id }, ...pos })
            });
    }
    load = (loaded) => {
        if (loaded) {
            this.updateAllPositions();
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
                        let { startMeta, id, note } = hs;
                        let { parentTagName, parentIndex } = startMeta
                        let ele = this.$root.querySelectorAll(parentTagName)[parentIndex]
                        if (ele) {
                            let ok = true;
                            let imgsrc = getEleSrc(ele);
                            if (imgsrc == hs.imgsrc) {
                                ok = true;
                            } else {
                                let images = this.$root.querySelectorAll(parentTagName);
                                for (let i = 0; i < images.length; i++) {
                                    let e = images[i];
                                    if (getEleSrc(ele) == hs.imgsrc) {
                                        ele = e;
                                        startMeta.parentIndex = i;
                                        hs.startMeta = startMeta
                                        this.store.update({ id, startMeta })
                                        ok = true;
                                        break;
                                    }
                                }
                                let url = store.Chapter().url(id);
                                let imgsrc = getImgSrcUrl(hs.imgsrc);
                                console.error("Not-find",
                                    "\n" + decodeURI(url),
                                    "\n" + decodeURI(imgsrc),
                                    this.store.title, hs)
                            }
                            if (ok) {
                                mountCmp(NoteImg, { id, note, hl: this, imgElement: ele }, ele, true)
                            }
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
    findTailElement(id, tail = true) {
        let el = this.getElement(id);
        if (el == undefined) return
        let pos = this.getPosition(el)
        let index
        // var str = "[微笑][微笑][微笑][微笑][微笑][微笑]"
        // eslint-disable-next-line no-unused-vars
        let findRexpr = (str, rstr) => {
            var regstr = new RegExp(rstr, "g");
            return str.search(regstr)
        }
        this.procssAllElements(id, (node) => {
            let { innerText } = node
            if (innerText && innerText.length) {
                let a = this.innerText.indexOf(innerText);
                if (index == undefined) index = a;
                else if (tail) {
                    if (a > index) {
                        el = node
                        index = a;
                    }
                } else {
                    if (a < index) {
                        el = node
                        index = a;
                    }
                }
                return;
            }
            let p2 = this.getPosition(node)
            let yes = p2.top > pos.top;
            if (tail == false) yes = !yes;
            if (yes) {
                pos = p2;
                el = node;
            }
        })
        return el
    }
    createMarkNode(id, note) {
        let el = this.findTailElement(id)
        if (el) {
            let content = note;
            let hl = this;
            let marker = document.getElementById(id + "notemarker")
            if (marker) { return }
            insertComponentAfter(NoteMarker, { noteid: id, content, hl }, el);
        }
    }
    createBookmarkNode(id) {
        let el = this.findTailElement(id);
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
        let marker = document.getElementById(noteid + "notemarker")
        if (marker) { marker.parentElement.removeChild(marker); }

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
                let ele = this.$root.querySelectorAll(parentTagName)[parentIndex]
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
    // getElementPosition(id) {
    //     let ret = {};
    //     this.procssAllElements(id, (a) => {
    //         let pos = this.getPosition(a);
    //         if (pos) {
    //             let { top } = pos;
    //             if (ret.top == undefined) {
    //                 ret = pos
    //             } else {
    //                 if (top < ret.top) {
    //                     ret = pos
    //                 }
    //             }
    //         }
    //     })
    //     return ret;
    // }
    scollTopID(id) {
        let { top, element } = this.getTopElement(id);
        if (top != undefined) {
            if (element) {
                element.scrollIntoView()
            } else {
                window.scrollTo(0, top);
            }
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
            offset.top += $node.offsetTop - $node.scrollTop;
            offset.left += $node.offsetLeft - $node.scrollLeft;
            $node = $node.offsetParent;
        }
        offset.bottom = offset.top + offset.height;
        return offset;
    };
    getTopElement = (noteid) => {
        let element
        let top, left, bottom;
        this.procssAllElements(noteid, (a) => {
            let pos = this.getPosition(a)
            if (top == undefined || top > pos.top) {
                element = a;
            }
            top = top ? Math.min(top, pos.top) : pos.top;
            left = left ? Math.min(left, pos.left) : pos.left;
            bottom = bottom ? Math.max(bottom, pos.bottom) : pos.bottom;
        });
        return { top, left, bottom, element };
    };
    getTopElementPosition = (noteid) => {
        let { top, left, bottom } = this.getTopElement(noteid)
        return { top, left, bottom };
    };
    turnHighLight(enable) {
        let { highlighter } = this;
        if (enable) {
            highlighter.run();
        } else {
            highlighter.dispose();
            highlighter.stop();
            this.enalbeClickListener(false);
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
