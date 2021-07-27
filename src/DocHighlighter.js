import Highlighter from 'web-highlighter';
import { Book } from './store';
import { User } from "./UserLogin";
import { log } from "./log";
import { getIntersection } from "./hl"
import { getConfig } from './ANoteConfig';
import { mountCmp, insertComponentAfter, parseurl, queryBox } from './utils';
import NoteMenu from './components/NoteMenu.vue'
import NoteMarker from './components/NoteMarker.vue'
import NoteBookmark from './components/NoteBookMark.vue'
import { hl_note } from './colorSelector';
import { highlightType } from './highlightType'
import ScrollMark from './components/ScrollMark'
import NoteImg from './components/NoteImg.vue'
import { hlIngoreElement, hlPlacement } from './hlPlacement';
import { getHtml } from './converDom2Html';
export let default_tree_version = 0.33
let cmpNodePosition = (node, othernode) => {
    if (node == undefined) {
        return 1
    }
    if (othernode == undefined) {
        return -1
    }
    let cmp = node.compareDocumentPosition(othernode)
    if (node == othernode) return 0;
    if (Node.DOCUMENT_POSITION_PRECEDING & cmp) {
        return 1
    }
    if (cmp & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1
    }
    if (cmp & Node.DOCUMENT_POSITION_CONTAINS) {
        return 1;
    }
    if (cmp & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        return -1
    }
    return 0
}
const copyPasteBoard = require('clipboard-copy')

const removeTips = () => {
    var tips = document.getElementsByClassName('note-menu');
    tips.forEach(element => {
        element.parentNode.removeChild(element);
    });
}
export class DocHighlighter {
    getIds(selected) {
        if (!selected || !selected.$node || !selected.$node.parentNode) {
            return [];
        }
        let id1 = ""
        try {
            id1 = this.highlighter.getIdByDom(selected.$node.parentNode)
        } catch (error) {
            console.error(error)
        }
        let id2 = []
        try {
            id2 = this.highlighter.getExtraIdByDom(selected.$node.parentNode)
        } catch (error) {
            console.error(error)
        }
        return [id1, ...id2].filter(i => i);
    }
    count() {
        let aa = this.allhs();
        return aa.length;
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
            hs = this.hsbyid(id)
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
    getElement(nodeid) {
        const classname = 'docsify-highlighter'
        let node;
        try {
            node = this.getHighlightDom(nodeid)[0];
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
            let hs = this.hsbyid(noteid)
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
        // this.$root = document.querySelector('article')
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
            try {
                let menu = document.getElementsByClassName("note-menu")
                if (menu && menu.length) return

                let ele = e.target
                let parentTagName = 'img'
                let ssss = this.$root.querySelectorAll(parentTagName)
                ssss = Array.prototype.slice.call(ssss);
                let parentIndex = ssss.indexOf(ele)
                if (parentIndex == -1) return
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
                        let textOffset = 0
                        let startMeta = { parentTagName, parentIndex, textOffset }
                        let endMeta = startMeta
                        let imgsrc = getEleSrc(ele);
                        let title = this.store.title
                        let hs = { startMeta, endMeta, id, imgsrc, title }
                        let sources = [hs]
                        if (ele) {
                            let wrap = mountCmp(NoteImg, { id, hl: this, imgElement: ele }, ele, true).$el
                            this.createNoteMenu(wrap, sources)
                        }
                    }
                }
            } catch (error) {
                console.error(error)
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
        // eslint-disable-next-line no-unused-vars
        const onClick = (noteid, a, b) => {
            // const classname = 'docsify-highlighter'
            let { id } = noteid;
            let node;
            try {
                let el = b.target
                let { parentElement } = el
                if (hlIngoreElement(el) || (parentElement && hlIngoreElement(parentElement))) {
                    return
                }
                if (this.getIdByDom(el) == id) {
                    node = el
                }
                // eslint-disable-next-line no-empty
            } catch (error) {
            }
            if (node == undefined) {
                node = this.getElement(id)
            }
            this.createNoteMenu(node)
        };
        let { $root } = this;
        let a = new Highlighter({
            $root,
            wrapTag: 'i',
            exceptSelectors: ['.html-drawer', '.my-remove-tip', '.op-panel', '.charpterhtml'],
            style: {
                className: 'docsify-highlighter'
            }
        });
        this.highlighter = a;
        this.hsPlacement = new hlPlacement(this)
        a.on(Highlighter.event.HOVER, this.onHover.bind(this));
        a.on(Highlighter.event.HOVER_OUT, this.onHoverOut.bind(this));
        // a.on(Highlighter.event.REMOVE, this.onRemove.bind(this));
        a.on(Highlighter.event.CREATE, this.onCreate.bind(this));
        a.on(Highlighter.event.CLICK, onClick);
        a.hooks.Render.WrapNode.tap((id, selectedNodes) => {
            return selectedNodes
        });
        let self = this
        a.hooks.Render.SelectedNodes.tap((id, selectedNodes) => {
            if (selectedNodes.length === 0) {
                return [];
            }
            selectedNodes = selectedNodes.filter((selected) => {
                try {
                    let parent = selected.$node.parentNode;
                    const ingoreElement = (parent) => {
                        if (parent) {
                            if (parent.classList) {
                                let a = ['notemarker', 'note-inline-tooltiptext'].find((a) => parent.classList.contains(a))
                                if (a) return true
                            }
                            if (parent.style.display == 'none')
                                return true
                        }
                        return false;
                    }
                    if (ingoreElement(parent) || ingoreElement(selected.$node)) {
                        return false;
                    }
                    // eslint-disable-next-line no-empty
                } catch (error) {
                }
                return true
            })
            if (selectedNodes.length) {
                let last = selectedNodes[selectedNodes.length - 1]
                if (selectedNodes.length > 1) {
                    if (last.splitType != 'tail') {
                        if (last.splitType == 'both' && selectedNodes.length == 1) {
                            return selectedNodes
                        }
                        let hs = self.store.geths(id)
                        if (hs) {
                            selectedNodes = this.hsPlacement.filterSelectedNotes(selectedNodes, hs)
                            if (selectedNodes.length == 0) {
                                console.error("selectedNodes " + hs.id + " " + hs.text, selectedNodes.length, last.splitType);
                                return []
                            } else {
                                return selectedNodes
                            }
                        }
                    }
                }
            }
            try {
                const candidates = selectedNodes.slice(1).reduce(
                    (left, selected) => getIntersection(left, this.getIds(selected)),
                    this.getIds(selectedNodes[0])
                );
                candidates.length
                for (let i = 0; i < candidates.length; i++) {
                    if (this.getHighlightDom(candidates[i]).length === selectedNodes.length) {
                        selectedNodes = [];
                        break;
                    }
                }
                if (selectedNodes.length == 0) {
                    let hs = self.store.geths(id)
                    if (hs) {
                        // console.error("selectedNodes-length==0", selectedNodes.length, hs.id, hs.text);
                    }
                }
                return selectedNodes;
            } catch (error) {
                console.error(error)
            }
        });
        // new hlPosition()
        // this.highlighter.hooks.Serialize.Restore.tap(
        //     source => log('Serialize.Restore hook -', source)
        // );

        // eslint-disable-next-line no-unused-vars
        // this.highlighter.hooks.Serialize.RecordInfo.tap((start, end, root) => {
        //     const extraInfo = Math.random().toFixed(4);
        //     return extraInfo;
        // });
    }

    deleteId(id, store) {
        let { highlighter } = this;
        let childList = this.childIdList(id);
        let parentList = this.parentIdList()



        const removid = (id) => {
            this.procssAllElements(id, (a) => {
                let n = a.querySelectorAll('.imgzoombtn');
                for (let i = 0; i < n.length; i++) {
                    let b = n[i];
                    b.parentNode.removeChild(b);
                }
            });
            this.removeMarkNode(id);
            this.removeHighLight(id)
            highlighter.removeClass(hl_note, id)
            highlighter.removeClass("highlight-wrap-hover", id);
            highlighter.removeClass("highlight-tags", id);
            highlighter.remove(id);
            if (store == undefined) {
                store = this.store
            }
            store.remove(id);
        }
        removid(id);
        childList.forEach((id) => removid(id))

        parentList.forEach((id) => {
            let hs = this.hsbyid(id)
            let a = new highlightType(this.highlighter, hs)
            a.showHighlight()
            this.updateHtml(id)
        })
        this.updatePanel();
    }
    parentIdList(noteid) {
        try {
            let extra = this.highlighter.getExtraIdByDom(this.getElement(noteid))
            return extra
        } catch (error) { return [] }
    }
    childIdList(id) {
        let childList = new Set();
        this.procssAllElements(id, (a) => {
            let id1 = this.highlighter.getIdByDom(a);
            if (id1 != id) {
                childList.add(id1);
            }
        });
        return Array.from(childList)
    }

    enable(enable) {
        if (enable) {
            this.store = new Book().toc.CharpterStorage()
        }
        getConfig().save({ on: enable })
        this.turnHighLight(enable);
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
    updateStyleOfHs(id) {
        let hhs = this.hsbyid(id)
        let a = new highlightType(this.highlighter, hhs)
        a.showHighlight()

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
            let creatFromStore = ({ id }) => {
                let hhs = this.hsbyid(id)
                let { style, note, bookmark, nodetree, version } = hhs
                this.updateStyleOfHs(id)
                if (nodetree == undefined) {
                    nodetree = this.hsPlacement.hsNodetree(hhs)
                    this.store.update({ ...{ id }, ...nodetree })
                }


                if (version != default_tree_version) {
                    let { tree } = this.getHtml(id)
                    this.store.update({ id, tree, version: default_tree_version })
                }

                if (note && note.length) {
                    this.createMarkNode(id, note);
                }
                if (bookmark) {
                    this.createBookmarkNode(id)
                }
                this.addTagBackground(style, id);
                if (this.parseurlResult.noteid == id) {
                    this.scollTopID(id);
                }
            }
            creatFromStore = creatFromStore.bind(this);
            sources.forEach((hs) => {
                try {
                    creatFromStore(hs)
                } catch (error) {
                    console.error(error);
                }
            })
            this.updatePanel()
        } else {
            log('create -', sources);
            sources.forEach(hs => {
                let title = document.title
                hs.title = title;
            })
            let hs = sources[0]
            let normal = this.getHighlightDom(hs.id).filter((a) => {
                let ignore = hlIngoreElement(a) || hlIngoreElement(a.parentElement)
                return ignore ? false : true
            })
            if (normal.length == 0) {
                this.highlighter.remove(hs.id)
                return
            }
            let menu = document.getElementsByClassName("note-menu")
            if (menu && menu.length) {
                this.highlighter.remove(hs.id);
                return;
            }
            this.createNoteMenu(this.getElement(hs.id), sources)
        }
    };
    getHighlightDom = (noteid) => this.highlighter.getDoms(noteid)


    // eslint-disable-next-line no-unused-vars
    getHtml = (noteid) => {
        let dom = this.getHighlightDom(noteid).sort(cmpNodePosition)
        return getHtml(dom)
    }



    saveNoteData = (noteid, data) => {
        let { note, sources, style, tags, img, bookmark } = data ? data : {}
        let change = style != undefined && Object.keys(style).length || note || tags.length || img && img.length || bookmark
        // let version = '0.22';
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
            let newone = sources != undefined
            if (sources) {
                let sources2 = sources.map(a => {
                    let hs = { ...a }
                    if (note) {
                        hs.note = note
                    }
                    if (!hs.date) {
                        hs.date = new Date() * 1;
                    }
                    hs.tags = tags
                    hs.bookmark = bookmark
                    let nodetree = this.hsNodetree(noteid, hs)
                    hs = { ...hs, ...nodetree }
                    return { hs }
                })
                this.store.save(sources2);
            } else {
                let nodetree = this.hsNodetree(noteid)
                this.store.update({ id: noteid, note, tags, bookmark, nodetree, ...nodetree })
            }
            let highlightIdExtras = this.parentIdList(noteid)
            if (newone) {
                highlightIdExtras && highlightIdExtras.forEach((parentID) => {
                    let hsparent = this.hsbyid(parentID)
                    if (hsparent) {
                        let styleparent = hsparent.style
                        if (styleparent && style) {
                            style = { ...styleparent, ...style }
                        }
                    }
                })
            }
            this.store.update({ id: noteid, style, parent: highlightIdExtras })
            this.updateStyleOfHs(noteid)
            let extra = this.childIdList(noteid)
            extra.forEach((id) => {
                let hhs = this.hsbyid(id)
                let a = new highlightType(this.highlighter, hhs)
                a.showHighlight()

            })
            this.updateHtml(noteid)
            highlightIdExtras && highlightIdExtras.forEach((parentID) => {
                let hsparent = this.hsbyid(parentID)
                if (hsparent) {
                    this.updateHtml(parentID);
                }
            })

        } else {
            this.removeHighLight(noteid);
            this.deleteId(noteid);
        }
        this.updateAllPositions()
        Book.updated = true;
        this.updatePanel();
    };
    updateHtml(id) {
        let version = 0.33
        let { tree } = this.getHtml(id);
        if (tree)
            this.store.update({ id, tree, version });
    }

    fixid(id) {
        let hs = this.hsbyid(id)
        hs = this.hsPlacement.fix(hs);
        this.highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id, hs.extra)
    }
    hsNodetree(id, hs) {
        return this.hsPlacement.hsNodetree(id, hs)
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

    replacementHS(hs) {
        return this.hsPlacement.replacementHS(hs)
    }
    checkHS(hs) {
        return this.replacementHS(hs)
    }
    hsbyid(id) {
        return this.store.geths(id)
    }
    allhs() {
        if (this.store) {
            const storeInfos = this.store.getAll();
            return storeInfos
        }
        return []
    }
    updateAllPositions() {
        let storeInfos = this.allhs();
        let self = this
        storeInfos = storeInfos.map(
            ({ hs }) => {
                let { element } = self.getTopElement(hs)
                return { hs, el: element }
            }).sort((a, b) => {
                return cmpNodePosition(a.el, b.el)
            }).map((a, idx) => {
                let { hs } = a
                hs.domidx = idx
                return { hs }
            })
        this.store.jsonToStore(storeInfos)
    }
    storeInfosImg = (storeInfos) => storeInfos.filter(({ hs }) => {
        return hs.imgsrc
    })
    load = (loaded) => {
        if (loaded) {
            let { highlighter } = this;
            const storeInfos = this.allhs();
            const storeInfosImg = this.storeInfosImg(storeInfos)
            storeInfos.forEach(
                ({ hs }) => {
                    try {
                        if (this.getElement(hs.id) != undefined) {
                            let render = new highlightType(this.highlighter, hs)
                            render.showHighlight()
                            return;
                        }
                    } catch (error) {
                        console.error(error)
                    }
                    if (hs.imgsrc) {
                        let { note, id } = hs
                        let { ok, element } = this.fixHSImgElement(hs, storeInfosImg)
                        if (ok) {
                            mountCmp(NoteImg, { id, note, hl: this, imgElement: element }, element, true)
                        }
                    } else {
                        hs = this.checkHS(hs)
                        highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id, hs.extra)
                    }
                }
            );
        } else {
            removeTips();
            const storeInfos = this.allhs();
            storeInfos.forEach(
                ({ hs }) => {
                    this.removeHighLight(hs.id)
                }
            );
        }

    };
    findHSImgElement(hs, storeInfosImg = undefined) {
        let parentTagName = 'img'
        let images = this.$root.querySelectorAll(parentTagName);
        let { startMeta } = hs;
        let { parentIndex } = startMeta
        let ele = images[parentIndex]
        if (ele) {
            let imgsrc = getEleSrc(ele);
            if (imgsrc == hs.imgsrc) {
                return { element: ele, parentIndex }
            }
        }


        if (storeInfosImg == undefined) {
            storeInfosImg = this.storeInfosImg(this.store.getAll())
        }
        let allHs = storeInfosImg.map(({ hs }) => hs).filter((a) => {
            return a.imgsrc == hs.imgsrc;
        }).sort((a, b) => {
            return a.startMeta.parentIndex - b.startMeta.parentIndex
        });
        let index = allHs.indexOf(hs);
        images = Array.prototype.slice.call(images);
        let hsImageElements = images.filter((e) => {
            return getEleSrc(e) == hs.imgsrc;
        }).sort(cmpNodePosition);
        let element = hsImageElements[index];
        parentIndex = undefined
        if (element) {
            hsImageElements.indexOf(element);
        }
        return { element, parentIndex };

    }
    fixHSImgElement(hs, storeInfosImg = undefined) {
        let { startMeta, id, title } = hs
        let { element, parentIndex } = this.findHSImgElement(hs, storeInfosImg)
        let ok
        if (element) {
            ok = true
            if (startMeta.parentIndex != parentIndex && parentIndex != undefined) {
                startMeta.parentIndex = parentIndex
                hs.startMeta = startMeta;
                this.store.update({ id, startMeta, title });
            }
            if (title) {
                title = this.store.title
                if (title) {
                    this.store.update({ id, title });
                }
            }
        }
        return { hs, ok, element }
    }

    findTailElement(id, tail = true) {
        let ret = this.getTopElement({ id })
        if (tail) { return ret.tail }
        return ret.element
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
        let hs = this.hsbyid(id)
        if (hs) {
            let { top, element } = this.getTopElement(hs);
            if (element) {
                element.scrollIntoView()
            } else if (top != undefined) {
                window.scrollTo(0, top);
            }
            if (top == undefined) {
                if (element)
                    top = this.getPosition(element).top
            }
            if (top == undefined) { return }
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
    }

    getTopElement = (hs) => {
        let { id } = hs
        if (hs.imgsrc) {
            let { element } = this.findHSImgElement(hs)
            if (element) {
                let { top } = this.getPosition(element)
                return { top, element, tail: element }
            }
        }
        let nodes = this.getHighlightDom(id)
        if (nodes.length) {
            let element = nodes[0]
            let { top } = this.getPosition(element)
            return { top, element, nodes, tail: nodes[nodes.length - 1] }
        }
        return {}
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
