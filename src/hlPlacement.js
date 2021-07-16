import { UTILS } from './css_path'
let trimstring = (s) => {
    return s.replace(/\u3000| |\t/g, '');
}
export let getHSText = (hs) => {
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
export let rebuildTree = (tree) => {
    if (tree && tree.nodes) {
        let convert = (a) => {
            let { text, children, tagName } = a;
            let innerText
            if (tagName == "article".toUpperCase())
                return undefined
            if (children) {
                children = children.map(convert).filter((a) => a != undefined)
                if (tagName != "I") {
                    let text2 = []
                    let innerText2 = []
                    children = children.map((a) => {
                        let { tagName, text, innerText } = a;
                        if (innerText) {
                            innerText2.push(innerText)
                        }
                        if (tagName == "I") {
                            if (text.length)
                                text2.push(trimstring(text))
                            return undefined
                        }
                        return a;
                    }).filter((a) => a != undefined);
                    if (children.length == 0)
                        children = undefined
                    if (text2.length) {
                        text = text2.join('');
                    }
                    if (innerText2.length) {
                        innerText = innerText2.join('');
                    }
                }
            } else {
                if (text == "")
                    return undefined
                innerText = text
            }
            text = text && text.length ? { text } : {}
            innerText = innerText ? { innerText } : {}
            children = children && children.length ? { children } : {}
            return { ...text, ...children, tagName, ...innerText, parentTagName: tagName }
        }
        tree = tree.nodes.map(convert).filter((a) => a != undefined)
        let { innerText } = tree.map((node) => {
            let { innerText } = node
            return innerText
        }).filter((a) => a != undefined).join("")
        return { tree, innerText }
    }
    return {};
}
export class hlPlacement {
    constructor(hl) {
        this.queryNodes = {}
        this.queryNodesOffset = {}
        this.highlighter = hl.highlighter
        this.$root = hl.$root
        this.hl = hl;
    }
    getOffsetSet(s) {
        let r = this.queryNodesOffset[s]
        if (r == undefined) {
            r = new Set()
            this.queryNodesOffset[s] = r;
        }
        return r
    }
    getMetaElement(meta) {
        let nodes = this.$root.querySelectorAll(meta.parentTagName)
        try {
            return nodes[meta.parentIndex]
        } catch (error) {
            return
        }
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
    hsNodetree(id, hs) {
        let csspath = this.getElementCssPath(hs)
        let { startMeta, endMeta } = hs ? hs : {}
        let nodetree = this.highlighter.getDoms(id)
            .sort((a, b) => {
                if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
                    return -1;
                }
                return 1;
            })
            .filter((a) => {
                let { innerText } = a
                return innerText && innerText.length > 0
            })
            .map((a) => {
                return this.convertDom2Nodetree(a);
            })

        let a = [];
        for (let i = 0; i < nodetree.length; i++) {
            let b = nodetree[i];
            let c = a.length ? a[a.length - 1] : {}
            if (b.parentTagName == "article".toUpperCase()) {
                continue
            }
            if (c.parentIndex == b.parentIndex && c.parentTagName == b.parentTagName) {
                continue
            }
            a.push(b)
        }
        nodetree = a
        if (nodetree == undefined || nodetree.length == 0) {
            nodetree = {}
        } else {
            if (startMeta && endMeta) {
                console.log(startMeta, nodetree[0])
                console.log(endMeta, nodetree[nodetree.length - 1])
            }
        }
        return { nodetree, ...csspath };
    }
    fixMeta = (hs) => {
        const { text } = hs
        let textTrimed = trimstring(text)
        let ptns = getHSText(hs);
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
    convertDom2Nodetree(a) {
        let element = a;
        let { innerText } = a;
        let parentTagName = a.tagName;
        if (a.tagName == 'I') {
            element = a.parentElement;
            parentTagName = element.tagName;
        }
        let { id } = element;
        if ((id && id.length) == false) {
            id = undefined;
        }
        let { parentIndex } = this.getParentIndex({ parentTagName }, element);
        let textOffset = element.innerText.indexOf(innerText);
        return { parentTagName, parentIndex, innerText, id, textOffset };
    }

    getElementCssPath(hs) {
        if (hs) {
            let fullPath = (el) => {
                if (el == undefined || el == null) return undefined
                return UTILS.cssPath(el, true)
            }
            let { startMeta, endMeta } = hs
            let getEle = (startMeta) => {
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
            return { csspath }
        }
        return {}
    }
    s = (meta) => {
        let { parentIndex, parentTagName, innerText, findIndex, prevElement } = meta
        let nodes = this.queryNodes[parentTagName]
        if (nodes == undefined) {
            nodes = this.$root.querySelectorAll(parentTagName)
            this.queryNodes[parentTagName] = nodes
        }
        let idx = findIndex
        if (idx == undefined) {
            idx = parentIndex
            if (idx == undefined) {
                idx = 0
            }
        } else {
            idx = idx + 1
        }
        findIndex = undefined
        let findel
        const _check = (i) => {
            let el = nodes[i]
            if (el.innerText.indexOf(innerText) != -1) {
                if (prevElement) {
                    let cmp = prevElement.compareDocumentPosition(el)
                    if ((cmp & (Node.DOCUMENT_POSITION_CONTAINS + Node.DOCUMENT_POSITION_FOLLOWING)) == false) {
                        return
                    }
                }
                parentIndex = i
                findIndex = i;
                findel = el
                return true
            }
        }
        let out = false
        for (let i = idx; i < nodes.length; i++) {
            out = _check(i)
            if (out) break
        }
        // if (out != true) {
        //     for (let i = idx - 1; i >= 0; i--) {
        //         out = _check(i)
        //         if (out) break
        //     }
        // }
        return { ...meta, ...{ findIndex, findel, parentIndex } }
    }
    updateParentIndex(nodetree, hs) {
        let first = nodetree[0]
        let last = nodetree[nodetree.length - 1]
        let { startMeta, endMeta } = hs
        if (first.parentTagName == startMeta.parentTagName) {
            let offset = first.parentIndex - startMeta.parentIndex
            this.getOffsetSet(first.parentTagName).add(offset)
            startMeta.parentIndex += offset
            if (startMeta.parentTagName == endMeta.parentTagName) {
                endMeta.parentIndex = endMeta.parentIndex + offset
                return { ...hs, ...{ startMeta, endMeta } }
            }
            if (last.parentTagName == endMeta.parentTagName) {
                endMeta.parentIndex = last.parentIndex;
                return { ...hs, ...{ startMeta, endMeta } }
            }
        }
    }
    searchByNodetree(hs) {
        let { nodetree } = hs
        if (nodetree && nodetree.length) {

            let result = [nodetree[0]]
            for (let i = 1, len = nodetree.length; i < len; i++) {
                (nodetree[i].parentIndex !== nodetree[i - 1].parentIndex || nodetree[i].parentTagName !== nodetree[i - 1].parentTagName) && result.push(nodetree[i])
            }
            nodetree = result.filter((a) => a.innerText && a.innerText.length)
            let text = trimstring(hs.text)
            let beginIdx, endRange;
            nodetree.forEach((a, idx) => {
                a.originalIndex = a.parentIndex
                let { trim } = a
                if (trim == undefined) {
                    trim = trimstring(a.innerText)
                    a.trim = trim;
                }
                let index = text.indexOf(trim)
                if (index != -1) {
                    if (beginIdx == undefined) {
                        if (index == 0) {
                            beginIdx = idx
                        }
                    }
                    if (endRange !== undefined && trim.length + beginIdx == endRange + 1) {
                        beginIdx = undefined;
                        endRange = undefined;
                        return
                    }
                    endRange = index + trim.length - 1
                }
            })
            if (beginIdx != undefined) {
                nodetree = nodetree.slice(beginIdx)
            }
            let i = 1
            let { startMeta, endMeta } = hs
            let beginMeta = nodetree[0]
            nodetree[0] = beginMeta = this.s(beginMeta)
            if (beginMeta.findIndex === undefined) {
                beginMeta.parentIndex = undefined;
                nodetree[0] = beginMeta = this.s(beginMeta)
            }
            if (nodetree.length == 1 && beginMeta.findIndex != undefined) {
                let first = nodetree[0]
                let last = nodetree[0]
                if (first.parentTagName == startMeta.parentTagName) {
                    startMeta.parentIndex = first.parentIndex;
                    if (last.parentTagName == startMeta.parentTagName) {
                        endMeta.parentIndex = last.parentIndex;
                        return { ...hs, ...{ startMeta, endMeta } }
                    }
                }
            }
            while (i < nodetree.length) {
                let { findIndex } = beginMeta
                if (findIndex == undefined) break;
                let next = nodetree[i]
                next.prevElement = beginMeta.findel
                if (next.parentTagName == beginMeta.parentTagName) {
                    if (next.originalIndex == beginMeta.originalIndex) {
                        nodetree[i] = beginMeta
                        i++;
                        continue
                    }
                    next.findIndex = findIndex
                }
                nodetree[i] = next = this.s(next)
                if (next.findIndex != undefined) {
                    beginMeta = { ...next }
                    beginMeta.prevElement = undefined
                    i = i + 1
                } else {
                    beginMeta = this.s(beginMeta)
                    continue
                }
            }

            let last = nodetree[nodetree.length - 1]
            if (last.findIndex != undefined) {
                let ret = this.updateParentIndex(nodetree, hs)
                if (ret) {
                    return ret
                }
                console.log("find")
            }

        }


    }


    fix(hs) {
        let { startMeta, endMeta } = hs
        this.replacementHS3(hs);
        this.replacementHS(hs)
        let { tree } = rebuildTree(hs.tree)
        this.searchByNodetree({ nodetree: tree, startMeta, endMeta })
        let all = this.hl.allhs().map(({ hs }) => {
            let { text, tree, id } = hs
            return { text, tree, id, trim: trimstring(text) }
        })
        let findhs = (text) => {
            let trim = trimstring(text)
            let ret = new Set()
            all.forEach((hs) => {
                if (trim == hs.trim) return true;
                if (hs.trim.indexOf(trim) != -1) {
                    ret.add(hs.id)
                }
            })
            return Array.from(ret)
        }
        let check2 = (a) => {
            let { children, innerText } = a
            if (children && children.length) {
                children.forEach(child => {
                    check2(child)
                })
                return
            }
            let ret = findhs(innerText)
            return ret

        }
        tree.forEach((a) => {
            check2(a)
        })
    }
    replacementHS(hs) {
        let { csspath, imgsrc } = hs;
        if (imgsrc) return hs;
        if (csspath == undefined) {
            csspath = {}
        }
        let ret = this.searchByNodetree(hs)
        if (ret) return ret

        let { tree } = rebuildTree(hs.tree)
        ret = this.searchByNodetree({ ...hs, ...{ nodetree: tree } })
        if (ret) return ret
        ret = this.replacementHS3(hs)
        if (ret) {
            return { ...hs, ...ret }
        }
        console.warn('not find ' + hs.id + '   ' + hs.text, hs)
        return hs
    }
    isOneElement(hs) {
        let { startMeta, endMeta } = hs;
        if (startMeta.parentTagName != endMeta.parentTagName) return false;
        if (startMeta.parentIndex != endMeta.parentIndex) return false;
        return true;
    }
    replacementHS3(hs) {
        let { endMeta } = hs;
        let prefix = this.isOneElement(hs) ? hs.text : hs.text.substring(hs.text.length - endMeta.textOffset)
        let prefixTrim = trimstring(prefix)
        let meta = { ...endMeta }
        let nodes = this.queryNodes[meta.parentTagName]
        if (nodes == undefined) {
            nodes = this.$root.querySelectorAll(meta.parentTagName)
            this.queryNodes[meta.parentTagName] = nodes
        }
        let isOneElement = this.isOneElement(hs)
        const checkParent = (parentElement, text) => {
            let begin, end, endMeta, startMeta;
            let nodetree = []
            let nodec
            if (parentElement && parentElement.tagName != "article".toUpperCase()) {
                let { children } = parentElement
                for (let j = 0; j < children.length; j++) {
                    nodec = undefined
                    let c = children[j]
                    if (c.classList.contains('hl-ignored')) {
                        continue
                    }
                    nodec = this.convertDom2Nodetree(c)
                    nodetree.push(nodec)
                    let t = trimstring(nodec.innerText)
                    if (t.length == 0) continue
                    let index = text.indexOf(t)
                    if (index != -1) {
                        if (begin == undefined) {
                            begin = index
                            startMeta = { ...nodec }
                        }
                        if (end != undefined) {
                            if (end + 1 != index) {
                                break
                            }
                        }
                        end = index + t.length - 1
                        if (end + 1 == text.length) {
                            endMeta = { ...nodec }
                            break
                        }
                    } else if (end != undefined) {
                        text = text.substring(end + 1)
                        if (t.indexOf(text) == 0) {
                            endMeta = { ...nodec }
                            endMeta.textOffset = t.length
                        }
                        break;
                    } else {
                        break;
                    }
                }
            }
            return { begin, end, endMeta, startMeta, nodetree }
        }
        let rc;
        for (let i = 0; i < nodes.length; i++) {
            let el = nodes[i]
            let { innerText } = el
            let yes = innerText && innerText.length
            if (yes == false) { continue }
            let includeT
            let include = el.innerText.indexOf(prefix) != -1
            if (include == false) {
                let { innerTextTrim } = el
                if (innerTextTrim == undefined) {
                    innerTextTrim = trimstring(el.innerText)
                    el.innerTextTrim = innerTextTrim
                }
                includeT = innerTextTrim.indexOf(prefixTrim) != -1
            }
            if (includeT || include) {
                if (isOneElement) {
                    let { startMeta, endMeta, text } = hs;
                    let xxx = el.innerText.substring(startMeta.textOffset, endMeta.textOffset)
                    startMeta = { ...startMeta, ...{ parentIndex: i } }
                    endMeta = { ...endMeta, ...{ parentIndex: i } }
                    rc = { startMeta, endMeta }
                    if (text == xxx) {
                        return rc
                    }
                    continue
                }
                let text = trimstring(hs.text)
                let { begin, endMeta, startMeta } = checkParent(el.parentElement, text)
                if (endMeta && startMeta) {
                    return { startMeta, endMeta }
                }
                let parent = el.parentElement
                while (begin > 0) {
                    parent = parent.previousElementSibling
                    text = text.substring(0, begin)
                    let a = checkParent(parent, text)
                    begin = a.begin
                    startMeta = a.startMeta
                    if (startMeta) {
                        return { startMeta, endMeta }
                    }
                }
            }
        }
        if (rc) { return rc }
        return undefined
    }

    replacementHS2(hs) {
        let { startMeta, endMeta, text } = hs;
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
            // try {
            //     let xxx = this.fixMeta(hs)
            //     if (xxx) {
            //         return xxx
            //     }
            // } catch (error) {
            //     console.error(error)
            // }
            console.warn('not find ' + hs.id + '   ' + hs.text, hs)
        }
        return hs
    }

    fixMeta = (hs) => {
        const { text } = hs
        let textTrimed = trimstring(text)
        let ptns = getHSText(hs);
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
}