import Highlighter from 'web-highlighter';
import { Book } from './store';
import { User } from "./UserLogin";
import { log } from "./log";
import Vue from 'vue';
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
import { convertHight2Html } from './converDom2Html';
import { MainNode, cmpNodePosition, SubNode, main_node_contain, getPosition } from './MainNode';
import { getIntersection } from './hl';
export let get_default_tree_version = () => {
    return '0.60.3-' + getConfig().enableScript()
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
    createNoteMenu = (node, sources, newnode) => {
        let id = node.dataset.highlightId;
        const position = getPosition(node);
        let { top, left } = position;
        removeTips();
        let hs = hs = this.hsbyid(id)
        if (hs == undefined) {
            if (sources && sources.length) {
                hs = sources[0]
            }
            if (hs == undefined) {
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
        let save = (a, b) => {
            this.saveNoteData(a, b, newnode)
        }
        mountCmp(NoteMenu, { top, left, hl, sources, onCloseMenu, hs, save }, section)
    };

    procssAllElements(nodeid, cb) {
        let node = this.MainNode(nodeid);
        node.nodes.forEach((el) => {
            cb(el)
        })
    }
    MainNode = (id) => new MainNode(id, this)
    getElement(id) {
        let node = this.MainNode(id)
        let ret = node.findMainNode()
        if (ret) return ret
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
        const onClick = (source, highlighter, event) => {
            // const classname = 'docsify-highlighter'
            let { id } = source;
            let node;
            try {
                let el = event.target
                let { parentElement } = el
                if (hlIngoreElement(el) || (parentElement && hlIngoreElement(parentElement))) {
                    return
                }
                // eslint-disable-next-line no-unused-vars
                let sub = new SubNode(el)
                let domid = highlighter.getIdByDom(el)
                if (domid == id) {
                    node = el
                }
            } catch (error) {
                console.error(error)
            }
            if (node == undefined) {
                node = this.getElement(id)
            }
            this.createNoteMenu(node)
        };
        let a = this.newHighlighter();
        this.highlighter = a;
        
        this.highlighterLoad = this.newHighlighter();
        this.highlighterLoad.on(Highlighter.event.CREATE, this.onCreate.bind(this));

        this.hsPlacement = new hlPlacement(this)
        a.on(Highlighter.event.HOVER, this.onHover.bind(this));
        a.on(Highlighter.event.HOVER_OUT, this.onHoverOut.bind(this));
        // a.on(Highlighter.event.REMOVE, this.onRemove.bind(this));
        a.on(Highlighter.event.CREATE, this.onCreateSelect.bind(this));
        a.on(Highlighter.event.CLICK, onClick);
        this.highlightIdSet = new Set()
        a.hooks.Render.WrapNode.tap((id, selectedNodes) => {
            // let yes = this.highlightIdSet.has(id)
            // if (yes==false) {
            //     let sub = new SubNode(selectedNodes)
            //     let hs = this.hsbyid(id)
            //     if (hs) {
            //         let render = this.render(hs)
            //         render && render.highlightNode(selectedNodes, false)
            //     }
            //     if (sub.highlightIdExtra) {
            //         // let hs = this.hsbyid(sub.highlightIdExtra)
            //         // let render = this.render(hs)
            //         // let style = render.cssStyle()
            //         selectedNodes.style.backgroundColor = "red"
            //         // for (let k in style) {
            //         //     selectedNodes.style[k] = style[k]
            //         // }
            //     }
            // }
            return selectedNodes
        });
        let self = this
        const filterSelectedNotes = (selectedNodes) => selectedNodes.filter((selected) => {
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

        this.highlighter.hooks.Render.SelectedNodes.tap((id, selectedNodes) => {
            selectedNodes = filterSelectedNotes(selectedNodes)
            if (selectedNodes.length) {
                let last = selectedNodes[selectedNodes.length - 1]
                if (selectedNodes.length > 1) {
                    if (last.splitType != 'tail') {
                        if (last.splitType == 'both' && selectedNodes.length == 1) {
                            return selectedNodes
                        }
                    }
                }
            }
            return selectedNodes;
        });
        this.highlighterLoad.hooks.Render.SelectedNodes.tap((id, selectedNodes) => {
            selectedNodes = filterSelectedNotes(selectedNodes)
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
                for (let i = 0; i < candidates.length; i++) {
                    if (this.highlighter.getDoms(candidates[i]).length === selectedNodes.length) {
                        selectedNodes = [];
                        break;
                    }
                }
            } catch (error) {
                console.error(error)
            }
            return selectedNodes;
        })
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

    newHighlighter() {
        let { $root } = this;
        return new Highlighter({
            $root,
            wrapTag: 'i',
            exceptSelectors: ['.html-drawer', '.my-remove-tip', '.op-panel', '.charpterhtml'],
            style: {
                className: 'docsify-highlighter'
            }
        });
    }

    deleteId(id, store, sub = true) {
        let { highlighter } = this;
        let mainNode = this.MainNode(id)
        let childList = mainNode.childIdList();
        let parentList = mainNode.parentIdList()



        const removid = (id) => {
            this.highlightIdSet.delete(id)
            this.procssAllElements(id, (a) => {
                let n = a.querySelectorAll('.imgzoombtn');
                for (let i = 0; i < n.length; i++) {
                    let b = n[i];
                    b.parentNode.removeChild(b);
                }
            });
            this.removeMarkNode(id);
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
        if (sub) {
            if (mainNode.isConverted()) {
                childList.forEach((id) => removid(id))
            }
        }

        parentList.forEach((id) => {
            let hs = this.hsbyid(id)
            let a = this.render(hs)
            a.showHighlight()
            this.updateHtml(id)
        })
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
    renderByID(id) {
        let hhs = this.hsbyid(id)
        this.renderHS(hhs)
    }
    onCreateSelect = (a) => {
        let { sources } = a;
        sources.forEach(hs => {
            try {
                this.highlighter.addClass('docsify-highlighter', hs.id);
                // eslint-disable-next-line no-empty
            } catch (error) {
            }
        })

        this.onHandleSelecttion(sources)
    }
    onCreate = (a) => {
        let { sources} = a;
        sources.forEach(hs => {
            try {
                this.highlighter.addClass('docsify-highlighter', hs.id);
                // eslint-disable-next-line no-empty
            } catch (error) {
            }
        })
        let creatFromStore = ({ id }) => {
            let currentNode = this.MainNode(id)
            this.highlightIdSet.add(id)
            let hhs = this.hsbyid(id)
            let { note, bookmark, nodetree, parent } = hhs
            this.renderHS(hhs)


            if (parent == undefined) {
                parent = currentNode.parentIdList()
            }
            if (nodetree == undefined) {
                nodetree = this.hsPlacement.hsNodetree(hhs)
            }
            this.store.update({ ...{ id }, ...nodetree, parent })
            if (note && note.length) {
                this.createMarkNode(id, note);
            }
            if (bookmark) {
                this.createBookmarkNode(id)
            }
            if (this.parseurlResult.noteid == id) {
                this.scollTopID(id);
            }
            // if (version != default_tree_version) {
            //     let { tree } = this.getHtml(id)
            //     this.store.update({ id, tree, version: default_tree_version })
            // }
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
    };

    onHandleSelecttion(sources) {
        log('create -', sources);
        sources.forEach(hs => {
            let title = document.title
            hs.title = title;
        })
        let hs = sources[0]
        let currentNode = this.MainNode(hs.id)
        let normal = currentNode.nodes.filter((a) => {
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
        this.createNoteMenu(this.getElement(hs.id), sources, currentNode)
    }
    // eslint-disable-next-line no-unused-vars
    getHtml = (noteid) => {
        let node = this.MainNode(noteid)
        let dom = node.nodes.sort(cmpNodePosition)
        return convertHight2Html(dom)
    }



    saveNoteData = (noteid, data, preNewNode) => {
        try {
            this.__saveNoteData(noteid, data, preNewNode)
        } catch (error) {
            console.error(error)
        }
    }
    __saveNoteData = (noteid, data, preNewNode) => {
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
        let newone = preNewNode != undefined
        if (change && noteid != undefined) {
            if (sources) {
                let sources2 = sources.map(a => {
                    this.highlightIdSet.add(a.id)
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
                this.store.update({ id: noteid, note, tags, bookmark, ...nodetree })
            }
            let currentNode = this.MainNode(noteid)
            if (newone) {
                style = this.resolveNodeConflict(currentNode, style, preNewNode);
            }
            this.store.update({ id: noteid, style })
            this.renderByID(noteid)
            let extra = currentNode.childIdList()
            extra.forEach((id) => {
                let hhs = this.hsbyid(id)
                this.renderHS(hhs)
            })
            this.updateHtml(noteid)
            let parentWrap = currentNode.parentIdList()
            parentWrap && parentWrap.forEach((parentID) => {
                let hsparent = this.hsbyid(parentID)
                if (hsparent) {
                    this.updateHtml(parentID);
                }
            })
            this.store.update({ id: noteid, style, parent: parentWrap })

        } else {
            this.deleteId(noteid, this.store, false);
            if (preNewNode)
                preNewNode && preNewNode.existIds.forEach((id) => {
                    let node = this.MainNode(id)
                    if (node.findMainNode()) {
                        let hs = this.hsbyid(id)
                        this.renderHS(hs)
                    }
                })
        }
        this.updateAllPositions()
        Book.updated = true;
        this.updatePanel();
    };
    resolveNodeConflict(curretNode, style, preNewNode) {
        let parent = curretNode.parentIdList()
        if (parent.length) {
            parent.forEach((parentID) => {
                let hs = this.hsbyid(parentID);
                if (hs) {
                    let parentNode = this.MainNode(parentID);
                    if (parentNode.findMainNode()) {
                        const position = parentNode.cmpNodePosition(curretNode);
                        let bIn = position == main_node_contain;
                        if (bIn) {
                            let styleparent = hs.style;
                            let mergestyle = { ...(styleparent ? styleparent : {}), ...(style ? style : {}) };
                            style = mergestyle;
                        } else {
                            if (parentNode.sliceByNewNode(curretNode)) {
                                let hs2 = parentNode.createNewMeta(this.hsPlacement, hs);
                                if (hs2) {
                                    hs = { ...hs, ...hs2 };
                                    this.store.update(hs);
                                }
                                let p = parentNode.cmpNodeHeadBefore(curretNode);
                                console.warn("overlap.....", p, ' ' + parentNode, curretNode, hs2);
                            }
                        }
                    } else {
                        console.warn('hasRemoved');
                    }
                }
            });
        } else {
            let noteid = curretNode.id
            preNewNode.existIds.forEach((id) => {
                let old = this.MainNode(id);
                let hs = this.hsbyid(id);
                let overlap = curretNode.checkOverLap(old);
                let pos = curretNode.cmpNodePosition(old);
                let render = this.render(hs);
                overlap.map((node) => {
                    let sub = new SubNode(node);
                    sub.changeID({ id, extra: noteid });
                    render.highlightNode(node);
                });
                let parent = this.MainNode(id).parentIdList()
                hs = { id, parent }
                this.store.update(hs)
                if (old.findMainNode() == undefined) {
                    console.warn('hasRemoved', overlap, pos);
                }
            });
        }
        return style;
    }

    render(hs) {
        if (hs)
            return new highlightType(this, hs)
        return
    }
    renderHS(hs) {
        let render = this.render(hs)
        render && render.showHighlight()
    }

    updateHtml(id) {
        let version = get_default_tree_version()
        let { tree } = this.getHtml(id);
        if (tree)
            this.store.update({ id, tree, version });
    }

    fixid(id) {
        let hs = this.hsbyid(id)
        hs = this.hsPlacement.fix(hs);
        this.highlighterLoad.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id, hs.extra)
    }
    hsNodetree(id, hs) {
        return this.hsPlacement.hsNodetree(id, hs)
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
            const storeInfos = this.allhs();
            const storeInfosImg = this.storeInfosImg(storeInfos)
            storeInfos.forEach(
                ({ hs }) => {
                    this.highlightIdSet.add(hs.id)
                    try {
                        if (this.getElement(hs.id) != undefined) {
                            this.renderHS(hs)
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
                        this.highlighterLoad.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id, hs.extra)
                    }
                }
            );
        } else {
            removeTips();
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

    findTailElement(id) {
        let { tail } = this.getTopElement({ id })
        return tail
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

    scollTopID(id) {
        let hs = this.hsbyid(id)
        if (hs) {
            let { top, element } = this.getTopElement(hs);
            if (top != undefined) {
                window.scrollTo(0, top - 100);
            } else {
                if (element) {
                    element.scrollIntoView()
                } else {
                    return
                }
            }
            let pos = { left: -30, top }
            let el = document.querySelector(".scollposion")
            if (this.scrollMarker && el) {
                Vue.set(this.scrollMarker, "id", id)
                Vue.set(this.scrollMarker, "pos", pos)
            } else {
                this.scrollMarker = mountCmp(ScrollMark, { id, pos }, this.$root);
            }
        }
    }
    getTopElement = (hs) => {
        let { id } = hs
        if (hs.imgsrc) {
            let { element } = this.findHSImgElement(hs)
            if (element) {
                let { top } = getPosition(element)
                return { top, element, tail: element }
            }
        }
        let curretNode = this.MainNode(id)
        let element = curretNode.subFirst()
        if (element) {
            let tail = curretNode.subLast()
            let { top } = getPosition(element)
            return { top, element, tail }
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
