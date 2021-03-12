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
import { markColorList, hl_note, ul, getcsscolorbyid, customColor } from './colorSelector';
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
        let color, colorhex
        try {
            let hs = this.store.geths(noteid)
            note = hs.note;
            colorhex = hs.colorhex
            color = hs.color
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
        log("createNoteMenu", top, left, color)
        let hl = this;
        mountCmp(NoteMenu, { top, left, noteid, color, hl, note, colorhex, sources }, document.body)
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
    setHighlightColor(color, noteid, colorhex) {
        this.updateHignLightColor(noteid, color, colorhex);
        getConfig().save({ color, colorhex });
        this.store.update({ id: noteid, color, colorhex })
    }
    updateHignLightColor(noteid, color, colorhex) {
        this.removeHighLight(noteid);
        this.procssAllElements(noteid, (a) => {
            if (color == ul) {
                a.style.borderBottom = "2px solid " + colorhex
                a.style.backgroundColor ="" 
            } else {
                a.style.borderBottom = ""
                a.style.backgroundColor = colorhex
            }
        })
    }

    removeHighLight(noteid) {
        markColorList.forEach((a) => {
            this.highlighter.removeClass(a, noteid);
        });
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

        this.highlighter.on(Highlighter.event.HOVER, this.onHover.bind(this));
        this.highlighter.on(Highlighter.event.HOVER_OUT, this.onHoverOut.bind(this));
        this.highlighter.on(Highlighter.event.REMOVE, this.onRemove.bind(this));
        this.highlighter.on(Highlighter.event.CREATE, this.onCreate.bind(this));

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
        document.addEventListener("click", (e) => {
            const classname = 'docsify-highlighter'
            if (e.target.classList.contains(classname)) {
                e.stopPropagation()
                this.createNoteMenu(e.target)
            }
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
                let { id, color, colorhex, note } = this.store.geths(hs.id)
                if (colorhex && getcsscolorbyid(color) != colorhex) {
                    color = customColor
                    this.store.update({ id, color })
                }
                if (note && note.length) {
                    this.createMarkNode(id, note);
                }
                this.updateHignLightColor(id, color, colorhex);
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
            this.createNoteMenu(this.getElement(hs.id), sources)
        }
    };
    saveNoteData = (noteid, data) => {
        let { color, note, sources, colorhex } = data ? data : {}
        let change = color != undefined || note
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
                    if (color) {
                        hs.color = color;
                        hs.colorhex = colorhex
                        this.setHighlightColor(color, noteid, colorhex);
                    }
                    if (note) {
                        hs.note = note
                    }
                    let {date} = hs;
                    if(date==undefined){
                        hs.date = new Date()*1;
                    }
                    hs.top = this.getElementPosition(noteid)
                    return hs
                })
                sources2 = sources2.map(hs => ({ hs }));
                this.store.save(sources2);
                this.updatePanel();
            } else {
                if (color != undefined) {
                    this.setHighlightColor(color, noteid, colorhex);
                }
                this.store.update({ id: noteid, note })
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
        let a = this.getElement(id)
        if (a) {
            return this.getPosition(a);
        }
        return a;
    }
    scollTopID(id) {
        let { top } = this.getElementPosition(id);
        if (top != undefined)
            window.scrollTo(0, top - 60);
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