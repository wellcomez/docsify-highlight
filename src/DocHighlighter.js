/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
import Highlighter from 'web-highlighter';
import { LocalStore } from './store';
import { getIntersection } from './hl';
import { log } from "./log";
import { getConfig } from './ANoteConfig';
import { mountCmp, parseurl } from './mountCmp';
import NoteMenu from './components/NoteMenu.vue'
import NoteMarker from './components/NoteMarker.vue'
import { hl_note, tUl, tfontColor } from './colorSelector';
import { highlightType } from './highlightType'
import ScrollMark from './components/ScrollMark'
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
        return [
            this.highlighter.getIdByDom(selected.$node.parentNode),
            ...this.highlighter.getExtraIdByDom(selected.$node.parentNode)
        ].filter(i => i);
    }
    count() {
        let aa = this.store.getAll();
        return aa.length;
    }
    createNoteMenu = (node, sources) => {
        let noteid = node.dataset.highlightId;
        const position = this.getPosition(node);
        let { top, left } = position;
        removeTips();
        let note = undefined
        let data = {}
        try {
            let hs = this.store.geths(noteid)
            note = hs.note;
            data = hs.style
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
        // log("createNoteMenu", top, left, color)
        let hl = this;
        try {
            document.getSelection().removeAllRanges()
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
        mountCmp(NoteMenu, { top, left, noteid, hl, note, data, sources }, document.body)
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
    key() {
        let { path } = parseurl()
        return path;
    }
    constructor() {
        this.store = new LocalStore(this.key(), document.title);
        this.highlighter = new Highlighter({
            wrapTag: 'i',
            exceptSelectors: ['.my-remove-tip', '.op-panel']
        });
        // document.addEventListener("hashchange", () => {
        //     console.log(window.location)
        // });
        this.parseurlResult = parseurl();
        const onClick = (noteid) => {
            // const classname = 'docsify-highlighter'
            let { id } = noteid;
            let node = this.getElement(id)
            this.createNoteMenu(node)
        };
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

        if (this.on()) {
            this.enable(true);
        }
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
            sources.forEach(hs => {
                let { id, style, note } = this.store.geths(hs.id)
                let a = new highlightType(this, id, style)
                a.showHighlight()
                if (note && note.length) {
                    this.createMarkNode(id, note);
                }
                if (this.parseurlResult.id == hs.id) {
                    this.scollTopID(hs.id);
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
            let menu = document.getElementsByClassName("note-menu")
            if (menu && menu.length) {
                this.highlighter.remove(hs.id);
                return;
            }
            this.createNoteMenu(this.getElement(hs.id), sources)
        }
    };
    saveNoteData = (noteid, data) => {
        let { note, sources, style } = data ? data : {}
        let change = style != undefined || note
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
                    hs.top = this.getElementPosition(noteid)
                    return hs
                })
                sources2 = sources2.map(hs => ({ hs }));
                this.store.save(sources2);
                this.updatePanel();
            } else {
                this.store.update({ id: noteid, note, style })
            }
        } else {
            this.removeHighLight(noteid);
            this.deleteId(noteid);
        }
    };
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
            mountCmp(ScrollMark, { id, hl: this, left:pp.left+10, top }, document.body);
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