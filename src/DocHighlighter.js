import Highlighter from 'web-highlighter';
import { Book } from './store';
import { User } from "./UserLogin";
import { getIntersection } from './hl';
import { log } from "./log";
import { getConfig } from './ANoteConfig';
import { mountCmp, parseurl, queryBox } from './utils';
import NoteMenu from './components/NoteMenu.vue'
import NoteMarker from './components/NoteMarker.vue'
import NoteBookmark from './components/NoteBookMark.vue'
import { hl_note, tUl, tfontColor } from './colorSelector';
import { highlightType } from './highlightType'
import ScrollMark from './components/ScrollMark'
import { UTILS } from './css_path'
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
        let noteid = node.dataset.highlightId;
        const position = this.getPosition(node);
        let { top, left } = position;
        removeTips();
        let hs = {}
        try {
            hs = this.store.geths(noteid)
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
        if (hs == undefined) hs = {}
        let { style: data, note, tags, bookmark } = hs
        if (tags == undefined) tags = []
        if (data == undefined) data = {}
        // log("createNoteMenu", top, left, color)z
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
        //  document.querySelector('section.content')
        mountCmp(NoteMenu, { top, left, bookmark, noteid, hl, note, data, sources, tags, onCloseMenu }, section)
        // }
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
        this.highlighter = new Highlighter({
            wrapTag: 'i',
            exceptSelectors: ['.html-drawer', '.my-remove-tip', '.op-panel', '.hl-ignored'],
            style: {
                className: 'docsify-highlighter'
            }
        });
        this.highlighter.on(Highlighter.event.HOVER, this.onHover.bind(this));
        this.highlighter.on(Highlighter.event.HOVER_OUT, this.onHoverOut.bind(this));
        // this.highlighter.on(Highlighter.event.REMOVE, this.onRemove.bind(this));
        this.highlighter.on(Highlighter.event.CREATE, this.onCreate.bind(this));
        this.highlighter.on(Highlighter.event.CLICK, onClick);
        // this.highlighter.hooks.Render.WrapNode.tap((id, selectedNodes) => {
        //     return selectedNodes
        // });

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

        this.highlighter.hooks.Serialize.Restore.tap(
            source => log('Serialize.Restore hook -', source)
        );

        this.highlighter.hooks.Serialize.RecordInfo.tap(() => {
            const extraInfo = Math.random().toFixed(4);
            log('Serialize.RecordInfo hook -', extraInfo);
            return extraInfo;
        });
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
    onCopy(id) {
        var copyDom = this.getElement(id)
        //创建选中范围
        var range = document.createRange();
        range.selectNode(copyDom);
        //移除剪切板中内容
        window.getSelection().removeAllRanges();
        //添加新的内容到剪切板
        window.getSelection().addRange(range);
        //复制
        // try{
        //     var msg = successful ? "successful" : "failed";
        //     alert('Copy command was : ' + msg);
        // } catch(err){
        //     alert('Oops , unable to copy!');
        // }
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
                let { id, style, note, bookmark } = this.store.geths(hs.id)
                let a = new highlightType(this, id, style)
                a.showHighlight()
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
    saveNoteData = (noteid, data) => {
        let highlightIdExtra;
        let { note, sources, style, tags, img, bookmark } = data ? data : {}
        let change = style != undefined || note || tags.length || img && img.length || bookmark
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
        if (highlightIdExtra) {
            let hsparent = this.store.geths(highlightIdExtra)
            if (hsparent) {
                let child = noteid
                this.store.update({ id: highlightIdExtra, child })
                let styleparent = hsparent.style
                if (styleparent && style) {
                    style = { ...styleparent, ...style }
                }
            }
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
                    hs.parent = highlightIdExtra
                    return hs
                })
                sources2 = sources2.map(hs => ({ hs }));
                this.store.save(sources2);
            } else {
                this.store.update({ id: noteid, note, style, tags, bookmark,parent:highlightIdExtra})
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

    findhs(hs) {
        let { startMeta, endMeta, text, } = hs;
        let getInnerTxt = (startMeta) => {
            try {
                let { parentTagName, parentIndex, } = startMeta;
                let node = document.querySelectorAll(parentTagName)[parentIndex];
                return node.innerText;
            }
            catch (e) {
                return '';
            }
        };
        let b = getInnerTxt(startMeta)
        function skipSpace(b) {
            if (b) {
                let begin = 0
                for (let i = 0; i < b.length; i++) {
                    if (b != ' ') {
                        begin = i;
                        break;
                    }
                }
                if (begin) {
                    return b.substring(begin)
                }
            }
            return b
        }
        b = b.substring(startMeta.textOffset)
        b = skipSpace(b)
        let ttt = skipSpace(text)
        let e = getInnerTxt(endMeta)
        e = e.substring(0, endMeta.textOffset)
        let index = ttt.indexOf(b)
        if (index != 0) return false
        index = text.indexOf(e)
        if (index >= 0) {
            if (index + e.length >= text.length)
                return true;
        }
        return false;
    }
    checkHS(hs) {
        if (this.findhs(hs)) {
            return hs
        } else {
            let search = (css, tag, text, { begin, end }) => {
                let ret = []
                try {
                    let nodes = []
                    nodes = document.querySelectorAll(css)
                    for (let i = 0; i < nodes.length; i++) {
                        try {
                            let node = nodes[i];
                            let { innerText } = node
                            if (innerText) {
                                let find = false
                                if (begin != undefined && end != undefined) {
                                    let a = innerText.substring(begin, end)
                                    if (a.length && text.indexOf(a) >= 0) {
                                        find = true
                                    }
                                } else if (begin != undefined) {
                                    let a = innerText.substring(begin)
                                    if (a.length && text.indexOf(a) == 0) {
                                        find = true
                                    }

                                } else if (end != undefined) {
                                    let a = innerText.substring(0, end)
                                    let index = a.length ? text.indexOf(a) : -1
                                    if (index >= 0) {
                                        if (index + end >= text.length) find = true
                                    }
                                }
                                if (find) {
                                    let nn = document.querySelectorAll(tag)
                                    if (tag != css) {
                                        for (let i = 0; i < nn.length; i++) {
                                            let x = nn[i]
                                            if (node == x) {
                                                ret.push({ node, index: i })
                                                continue
                                            }
                                        }
                                    } else {
                                        ret.push({ node, index: i })
                                    }
                                }
                            }
                            // eslint-disable-next-line no-empty
                        } catch (error) { }
                    }
                }
                // eslint-disable-next-line no-empty
                catch (e) { }
                return ret
            };

            let { startMeta, endMeta, text, csspath } = hs;
            if (csspath == undefined) {
                csspath = {}
            }
            let { start: cssstart, end: cssend } = csspath
            let begin = startMeta.textOffset;
            let end = endMeta.textOffset;
            let same = (startMeta.parentTagName == endMeta.parentTagName && startMeta.parentIndex == endMeta.parentIndex)
            let n1 = search(cssstart ? cssstart : startMeta.parentTagName,
                startMeta.parentTagName,
                text, { begin, end: same ? end : undefined })
            let n2 = search(cssend ? cssend : endMeta.parentTagName,
                endMeta.parentTagName,
                text, { begin: same ? begin : undefined, end })
            if (n1.length && n2.length) {
                let findStartEnd = () => {
                    if (n1.length == 1 && n1.length) {
                        let start = n1[0]
                        let end = n2[0]
                        return { start, end }
                    }
                    return {}
                }
                const newhs = (start, end) => {
                    let parentIndex = start.index
                    startMeta = { ...startMeta, ...{ parentIndex } }
                    parentIndex = end.index
                    endMeta = { ...endMeta, ...{ parentIndex } }
                    hs = { ...hs, ...{ startMeta, endMeta } }
                    return hs
                }
                let { start, end } = findStartEnd()
                if (start && end) {
                    return newhs(start, end)
                }
            }
            return hs
        }
        //        "parentTagName": "LI",
        //"parentIndex": 14,
        //"textOffset": 5
        //    
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
                        ele.parentElement.replaceChild(wrap, ele)
                        wrap.appendChild(ele)
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
