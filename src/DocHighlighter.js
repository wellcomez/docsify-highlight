/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
import Highlighter from 'web-highlighter';
import { Book } from './store';
import { User } from "./UserLogin";
import { getIntersection } from './hl';
import { log } from "./log";
import { getConfig } from './ANoteConfig';
import { mountCmp, parseurl, queryBox } from './utils';
import NoteMenu from './components/NoteMenu.vue'
import NoteMarker from './components/NoteMarker.vue'
import { hl_note, tUl, tfontColor } from './colorSelector';
import { highlightType } from './highlightType'
import ScrollMark from './components/ScrollMark'
import { downloadFromCloud } from './leanweb';
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

function getElementByXPath(path) {
    return (new XPathEvaluator())
        .evaluate(path, document.documentElement, null,
            XPathResult.FIRST_ORDERED_NODE_TYPE, null)
        .singleNodeValue;
}
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
        let { style: data, note, tags } = hs
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
        mountCmp(NoteMenu, { top, left, noteid, hl, note, data, sources, tags, onCloseMenu }, document.body)
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

    onRemove(a) {
        let { ids } = a;
        // ids.forEach(id => this.store.remove(id));
        // this.updatePanel();
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
        let checkUserStatus = ({ old, next }, changed) => {
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
                            let data = await downloadFromCloud();
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
        // document.addEventListener("hashchange", () => {
        //     console.log(window.location)
        // });
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
            exceptSelectors: ['.my-remove-tip', '.op-panel']
        });
        this.highlighter.on(Highlighter.event.HOVER, this.onHover.bind(this));
        this.highlighter.on(Highlighter.event.HOVER_OUT, this.onHoverOut.bind(this));
        this.highlighter.on(Highlighter.event.REMOVE, this.onRemove.bind(this));
        this.highlighter.on(Highlighter.event.CREATE, this.onCreate.bind(this));
        this.highlighter.on(Highlighter.event.CLICK, onClick);

        this.highlighter.hooks.Render.SelectedNodes.tap((id, selectedNodes) => {
            selectedNodes = selectedNodes.filter(n => n.$node.textContent);
            if (selectedNodes.length === 0) {
                return [];
            }

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
                let { id, style, note } = this.store.geths(hs.id)
                let a = new highlightType(this, id, style)
                a.showHighlight()
                if (note && note.length) {
                    this.createMarkNode(id, note);
                }
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
        let { note, sources, style, tags } = data ? data : {}
        let change = style != undefined || note || tags.length
        if (note) {
            this.highlighter.addClass(hl_note, noteid);
            this.removeMarkNode(noteid)
            this.createMarkNode(noteid, note)
        } else {
            this.highlighter.removeClass(hl_note, noteid)
            this.removeMarkNode(noteid);
        }
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
                    hs.tags = tags
                    hs.top = this.getElementPosition(noteid)
                    hs.csspath = this.getElementCssPath(hs)
                    return hs
                })
                sources2 = sources2.map(hs => ({ hs }));
                this.store.save(sources2);
                this.updatePanel();
            } else {
                this.store.update({ id: noteid, note, style, tags })
            }
        } else {
            this.removeHighLight(noteid);
            this.deleteId(noteid);
        }
    };
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
        b = b.substring(startMeta.textOffset)
        let e = getInnerTxt(endMeta)
        e = e.substring(0, endMeta.textOffset)
        if (text.indexOf(b) >= 0) {
            let index = text.indexOf(e)
            if (index >= 0) {
                if (index + e.length >= text.length)
                    return true;
            }
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
                                    for (let i = 0; i < nn.length; i++) {
                                        let x = nn[i]
                                        if (node == x) {
                                            ret.push({ node, index: i })
                                            continue
                                        }
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
                    highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id, hs.extra)
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
        let { top, left } = this.getElementPosition(id);
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
