import { UTILS } from './css_path'
let trimstring = (s) => {
    return s.replace(/\u3000| |\t/g, '');
}
const notRoot = (parentElement) => parentElement && parentElement.tagName != "article".toUpperCase()

export const getTextChildByOffset = ($parent, offset) => {
    const nodeStack = [$parent];

    let $curNode = null;
    let curOffset = 0;
    let startOffset = 0;

    while (($curNode = nodeStack.pop())) {
        const children = $curNode.childNodes;

        for (let i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }

        if ($curNode.nodeType === 3) {
            startOffset = offset - curOffset;
            curOffset += $curNode.textContent.length;

            if (curOffset >= offset) {
                break;
            }
        }
    }

    if (!$curNode) {
        $curNode = $parent;
    }

    return {
        $node: $curNode,
        offset: startOffset,
    };
};

export const getMetaNode = (root, { parentTagName, parentIndex, textOffset }) => {
    let node = root.querySelectorAll(parentTagName)[parentIndex]
    return getTextChildByOffset(node, textOffset)
}

function longestCommonSubstring(str1, str2) {
    if (!str1 || !str2) {
        return {
            length: 0,
            sequence: '',
            offset: 0
        }
    }

    var sequence = ''
    var str1Length = str1.length
    var str2Length = str2.length
    var num = new Array(str1Length)
    var maxlen = 0
    var lastSubsBegin = 0

    for (var i = 0; i < str1Length; i++) {
        var subArray = new Array(str2Length)
        for (var j = 0; j < str2Length; j++) { subArray[j] = 0 }
        num[i] = subArray
    }
    var thisSubsBegin = null
    for (i = 0; i < str1Length; i++) {
        for (j = 0; j < str2Length; j++) {
            if (str1[i] !== str2[j]) { num[i][j] = 0 } else {
                if ((i === 0) || (j === 0)) { num[i][j] = 1 } else { num[i][j] = 1 + num[i - 1][j - 1] }

                if (num[i][j] > maxlen) {
                    maxlen = num[i][j]
                    thisSubsBegin = i - num[i][j] + 1
                    if (lastSubsBegin === thisSubsBegin) { // if the current LCS is the same as the last time this block ran
                        sequence += str1[i]
                    } else { // this block resets the string builder if a different LCS is found
                        lastSubsBegin = thisSubsBegin
                        sequence = '' // clear it
                        sequence += str1.substr(lastSubsBegin, (i + 1) - lastSubsBegin)
                    }
                }
            }
        }
    }
    return {
        length: maxlen,
        sequence: sequence,
        offset: thisSubsBegin
    }
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
export let rebuildTree = ({ tree, startMeta, endMeta }) => {
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
            innerText = innerText ? { innerText } : undefined
            children = children && children.length ? { children } : {}
            if (innerText == undefined) {
                return undefined
            }
            return { ...text, ...children, tagName, ...innerText, parentTagName: tagName }
        }
        tree = tree.nodes.map(convert).filter((a) => a != undefined)
        let { innerText } = tree.map((node) => {
            let { innerText } = node
            return innerText
        }).filter((a) => a != undefined).join("")
        tree.forEach((a, idx) => {
            if (idx == 0) {
                if (startMeta.parentTagName != a.parentTagName && a.parentTagName == 'I') {
                    a.parentTagName = startMeta.parentTagName;
                }
            } else if (idx == tree.length - 1) {
                if (endMeta.parentTagName != a.parentTagName && a.parentTagName == 'I') {
                    a.parentTagName = endMeta.parentTagName;
                }
            }
        })
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
        let { innerText, nodeType, wholeText } = a;
        if (innerText == undefined) {
            innerText = wholeText
            if (innerText) {
                innerText = innerText.replaceAll("\n", '')
            }
        }
        let parentTagName = a.tagName;
        if (a.tagName == 'I' || nodeType == 3) {
            element = a.parentElement;
            parentTagName = element.tagName;
        }
        let { id } = element;
        if ((id && id.length) == false) {
            id = undefined;
        }
        let { parentIndex } = parentTagName ? this.getParentIndex({ parentTagName }, element) : {};
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
    findElementText(el, text) {
        let { innerText: elText, wholeText } = el
        if (elText == undefined) {
            elText = wholeText.replaceAll("\n", '')
        }
        let index = elText.indexOf(text)
        if (index != -1)
            return index
        let { innerTextTrim } = el
        if (innerTextTrim == undefined) {
            innerTextTrim = trimstring(elText)
            el.innerTextTrim = innerTextTrim
        }
        let trim = trimstring(text)
        index = innerTextTrim.indexOf(trim)
        if (index != -1) {
            let ccc = new Set(['\u3000', ' ', '\t'])
            let firstChart = trim[0];
            let index = elText.indexOf(firstChart)
            while (index != -1 && index < elText.length) {
                let k = 0, i = index
                for (i = index, k = 0; i < elText.length && k < trim.length; i++) {
                    let c = elText[i]
                    if (ccc.has(c)) continue
                    let d = trim[k]
                    if (d == c) { k++; continue }
                }
                if (k == trim.length) {
                    return index;
                } else {
                    elText = elText.substr(i);
                    index = elText.indexOf(firstChart)
                }
            }
        }
        return -1
    }
    _indexOfNodes(nodes, node) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] == node) { return i }
        }
        return undefined
    }
    _searchNode = (meta, root) => {
        let { parentTagName, innerText, prevElement, parentIndex } = meta

        const getTagNodes = (parentTagName) => {
            let nodes = parentTagName != "I" ? this.queryNodes[parentTagName] : undefined
            if (nodes == undefined) {
                nodes = this.$root.querySelectorAll(parentTagName)
                this.queryNodes[parentTagName] = nodes
            }
            return nodes
        }
        let nullRet = { findel: undefined, findIndex: undefined }
        const _check = (el, i = 0) => {
            let index = this.findElementText(el, innerText)
            if (index != -1) {
                if (prevElement && prevElement != el) {
                    let cmp = prevElement.compareDocumentPosition(el)
                    if ((cmp & (Node.DOCUMENT_POSITION_CONTAINS + Node.DOCUMENT_POSITION_FOLLOWING)) == false) {
                        return
                    }
                }
                let parentIndex = i
                let findIndex = i;
                let findel = el
                return { parentIndex, findIndex, findel }
            }
        }
        if (root) {
            let subNodes = root.nodeType != 3 ? root.querySelectorAll(parentTagName) : []
            for (let i = 0; i < subNodes.length; i++) {
                let el = subNodes[i]
                let out = _check(el, i)
                if (out) {
                    let ret = { ...meta, ...out }
                    let nodes = getTagNodes(parentTagName)
                    ret.parentIndex = this._indexOfNodes(nodes, ret.findel)
                    return ret
                }
            }
            try {
                let out = _check(root)
                if (out) {
                    out = { ...meta, ...out }
                    let nodes = getTagNodes(root.tagName)
                    out.parentTagName = root.tagName
                    out.parentIndex = this._indexOfNodes(nodes, out.findel)
                    out.findIndex = out.parentIndex
                    return out
                }
            } catch (error) {
                console.error(error)
            }
            return { ...meta, ...nullRet }
        }
        let nodes = getTagNodes(parentTagName)
        let idx = meta.findIndex
        if (idx == undefined) {
            idx = parentIndex
            if (idx == undefined) {
                idx = 0
            }
        } else {
            idx = idx + 1
        }
        let ret
        for (let i = idx; i < nodes.length; i++) {
            let el = nodes[i]
            ret = _check(el, i)
            if (ret) {
                return { ...meta, ...ret }
            }
        }
        return { ...meta, ...nullRet }
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
            if (sameNodeTreeElement(c, b)) {
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
    searchByNodetree(hs) {
        const rc_ok = 1
        const rc_wrong = -1
        const rc_no_found = 0
        const findBrother = (next, findel, ingoreFirst) => {
            let slide = findel
            let rc = rc_no_found
            while (slide) {
                let a = this._searchNode(next, slide)
                if (a.findIndex != undefined) {
                    // nodetree[i] = next = a
                    rc = rc_ok
                    return { rc, next: a }
                }
                let filter = this.filterText(slide)
                if (filter) {
                    if (ingoreFirst) {
                        ingoreFirst = false
                    } else {
                        rc = rc_wrong
                        return { rc, next }
                    }
                }
                slide = slide.nextSibling;
            }
            return { rc, next }
        }
        const findNextParent = (el) => {
            let { parentElement } = el;
            if (parentElement) {
                if (notRoot(parentElement)) {
                    let ret = parentElement.nextSibling
                    if (ret) return ret;
                    return findNextParent(parentElement)
                }
            }
        }
        let { nodetree } = hs
        if (nodetree && nodetree.length) {
            let result = [nodetree[0]]
            for (let i = 1, len = nodetree.length; i < len; i++) {
                sameNodeTreeElement(nodetree[i], nodetree[i - 1]) == false && result.push(nodetree[i])
            }
            nodetree = result.filter((a) => a.innerText && a.innerText.length)
        }
        if (nodetree && nodetree.length) {
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
            let { startMeta, endMeta } = hs
            let beginMeta = nodetree[0]
            let nodetreeOrig = nodetree.map((a) => a)
            nodetree[0] = beginMeta = this._searchNode(beginMeta)
            if (beginMeta.findIndex === undefined) {
                beginMeta.parentIndex = undefined;
                nodetree[0] = beginMeta = this._searchNode(beginMeta)
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
            let i = 1

            while (i < nodetree.length) {
                let { findIndex, findel } = beginMeta
                if (findIndex == undefined) break;
                let next = nodetree[i]
                next.prevElement = beginMeta.findel
                if (findel) {
                    let ret = findBrother(next, findel, true)
                    let rc = ret.rc
                    next = ret.next
                    if (rc == rc_no_found) {
                        let nextElement = findel
                        nextElement = findNextParent(nextElement)
                        while (nextElement) {
                            let ret = findBrother(next, nextElement)
                            rc = ret.rc
                            next = ret.next
                            if (rc == rc_no_found) {
                                nextElement = findNextParent(nextElement)
                            }
                            break
                        }
                    }
                }
                if (next.findIndex != undefined) {
                    nodetree[i] = next
                    beginMeta = { ...next }
                    beginMeta.prevElement = undefined
                    i = i + 1
                } else {
                    beginMeta = nodetree[0]
                    nodetree = nodetreeOrig.map((a) => a)
                    nodetree[0] = beginMeta = this._searchNode(beginMeta)
                    i = 1
                    continue
                }
            }

            let last = nodetree[nodetree.length - 1]
            if (last.findIndex != undefined) {
                let rr = this.updateParentIndex(nodetree, hs)
                if (rr) {
                    return rr
                }
                // console.log("find")
            }

        }


    }
    getMetaNode(rr) {
        let { startMeta, endMeta } = rr
        let a = getMetaNode(this.$root, startMeta)
        let b = getMetaNode(this.$root, endMeta)
        console.log(a, b)
    }
    // eslint-disable-next-line no-unused-vars
    filterSelectedNotes(selectedNodes, hs) {
        // return []
        // }
        // filterSelectedNotes2(selectedNodes, hs) {
        let { nodetree } = hs;
        if (nodetree == undefined) {
            nodetree = rebuildTree(hs).tree
        }
        let ret = []
        let { text } = hs
        text = trimstring(text)
        let nodeText = ''
        selectedNodes.forEach((node) => {
            let { innerText, wholeText } = node.$node;
            if (innerText == undefined) {
                innerText = wholeText
            }
            let a = trimstring(innerText).replaceAll("\n", '')
            if (a.length) {
                nodeText = nodeText + a
                // let lcs = longestCommonSubstring(nodeText, text)
                // let { sequence } = lcs
                // sequence
            }
            // console.log(sequence, lcs)
        })
        selectedNodes.forEach((node) => {
            let { innerText, wholeText } = node.$node;
            if (innerText == undefined) {
                innerText = wholeText
            }
            let a = trimstring(innerText).replaceAll("\n", '')
            if (text == undefined || text.length == 0) return;
            if (a.length) {
                let index = text.indexOf(a)
                if (index == 0) {
                    text = text.substr(a.length)
                    ret.push(node)
                    return
                } else {
                    if (ret.length) {
                        text = undefined
                    } else {
                        let lcs = longestCommonSubstring(text, a)
                        let { sequence } = lcs
                        if (sequence && sequence.length) {
                            let textOffset = text.indexOf(sequence) + sequence.length
                            text = text.substr(textOffset)
                            ret.push(node)
                            return
                        }
                    }
                }
            }
            if (ret.length) {
                ret.push(node)
            }
        })
        if (text != undefined)
            return ret
        return []
    }

    fix(hs) {
        // let { startMeta, endMeta } = hs
        // this.replacementHS3(hs);
        let old = { ...hs }
        let ret = this.replacementHS(hs)
        console.log(ret, old)
        return ret

    }
    replacementHS(hs) {
        if (this.hl.store.title == hs.title) {
            let { imgsrc } = hs;
            if (imgsrc) return hs;
            let { nodetree } = hs
            let ret
            if (nodetree) {
                ret = this.searchByNodetree(hs)
            } else {
                let { tree } = rebuildTree(hs)
                ret = this.searchByNodetree({ ...hs, ...{ nodetree: tree } })
            }
            if (ret) return ret

            ret = this.replacementHS3(hs)
            if (ret) {
                return { ...hs, ...ret }
            }
            console.warn('not find ' + hs.id + '   ' + hs.text, hs)
        }
        return hs
    }
    isOneElement(hs) {
        let { startMeta, endMeta } = hs;
        if (startMeta.parentTagName != endMeta.parentTagName) return false;
        if (startMeta.parentIndex != endMeta.parentIndex) return false;
        return true;
    }



    filterText(node, cls = 'hl-ignored') {
        let { filterText } = node;
        if (filterText == "" || filterText) {
            return filterText;
        }
        let ret = node.innerText
        if (node.classList && node.classList.contains(cls)) {
            filterText = ""
        } else {
            if (ret || ret == "") {
                let a = node.querySelectorAll('.' + cls)
                for (let i = 0; i < a.length; i++) {
                    let c = a[i]
                    ret = ret.replaceAll(c.innerText, '')
                }
                filterText = ret
            } else {
                filterText = node.wholeText;
            }
        }
        filterText = trimstring(filterText).replaceAll("\n", '')
        node.filterText = filterText
        return filterText
    }
    isTextNode(node) { let { nodeType } = node; return nodeType == 1 || nodeType == 3 }
    cancheck = (parentElement) => { return parentElement && parentElement.tagName != "article".toUpperCase() }
    checkParent = (parentElement, text, findstart = false) => {
        let begin, end, next = 0, endMeta, startMeta;
        let parentElementText = parentElement.innerText
        if (parentElementText == undefined) {
            parentElementText = parentElement.wholeText.replaceAll("\n", '')
        }
        let nodetree = []
        let nodec
        if (this.cancheck(parentElement)) {
            let { childNodes } = parentElement
            childNodes = Array.prototype.slice.call(childNodes);
            let children = childNodes.filter((a) => this.isTextNode(a))
            if (children.length == 0) {
                children = [parentElement]
            }
            const setEndMeta = (endMeta, node, lastchar) => {
                let { textOffset } = endMeta
                let nodec = this.convertDom2Nodetree(node)
                if (textOffset != undefined || textOffset == -1) {
                    if (node.nodeType == 3) {
                        let lcs = longestCommonSubstring(nodec.innerText, parentElementText)
                        let { sequence } = lcs
                        textOffset = parentElementText.indexOf(sequence) + sequence.length - 1
                        if (textOffset == undefined || textOffset == -1) {
                            console.error(nodec, text)
                            textOffset = 0
                        } else {
                            textOffset = textOffset + sequence.length - 1
                        }
                    } else {
                        textOffset = nodec.innerText.lastIndexOf(lastchar)
                        if (textOffset == -1) {
                            textOffset = nodec.innerText.length - 1
                        }
                    }
                }
                if (textOffset == -1)
                    console.error(endMeta, node, parentElement)
                endMeta.textOffset = textOffset
                return endMeta
            }

            const setStartMeta = (endMeta, node, firstChar) => {
                let { textOffset } = endMeta
                if (textOffset != undefined || textOffset == -1) {
                    let nodec = this.convertDom2Nodetree(node)
                    if (node.nodeType == 3) {
                        let lcs = longestCommonSubstring(nodec.innerText, parentElementText)
                        let { sequence } = lcs
                        if (sequence.length) {
                            textOffset = parentElementText.indexOf(sequence);
                        } else {
                            textOffset = 0
                        }
                    } else {
                        textOffset = nodec.innerText.indexOf(firstChar)
                    }
                }
                if (textOffset == -1)
                    console.error(endMeta, node, parentElement)
                endMeta.textOffset = textOffset
                return endMeta
            }
            for (let j = 0; j < children.length; j++) {
                nodec = undefined
                let c = children[j]
                let ignored = c.classList && c.classList.contains('hl-ignored')
                nodec = this.convertDom2Nodetree(c)
                nodetree.push(nodec)
                let t = trimstring(nodec.innerText)
                if (t.length == 0) continue
                let index = text.substring(next).indexOf(t) + next
                if (index != -1) {
                    if (begin == undefined) {
                        begin = index
                        startMeta = setStartMeta({ ...nodec }, c, t[0])
                    }
                    if (end != undefined) {
                        if (next != index) {
                            if (findstart == true) {
                                break
                            } else {
                                if (ignored == false) {
                                    begin = undefined, end = undefined, endMeta = undefined, startMeta = undefined
                                    continue
                                } else {
                                    break
                                }
                            }
                        }
                    }
                    end = index + t.length - 1
                    next = end + 1
                    if (next == text.length) {
                        endMeta = setEndMeta({ ...nodec }, c, text[text.length - 1])
                        break
                    }
                } else if (end != undefined) {
                    text = text.substring(next)
                    if (t.indexOf(text) == 0) {
                        endMeta = setEndMeta({ ...nodec }, c, t[t.length - 1])
                    }
                    break;
                } else {
                    if (begin == undefined) {
                        let lcs = longestCommonSubstring(t, text)
                        // { length: 9, sequence: ' common s', offset: 7 }
                        let { sequence } = lcs
                        if (sequence) {
                            begin = text.indexOf(sequence)
                        }
                        if (begin != -1) {
                            end = begin + sequence.length - 1
                            if (begin == 0)
                                startMeta = setStartMeta({ ...nodec, textOffset: begin }, c, sequence[0])
                            endMeta = { ...nodec, textOffset: end }
                            // setEndMeta(endMeta,c)
                        }
                    }
                    break;
                }
            }
        }
        return { begin, end, endMeta, startMeta, nodetree }
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

        let rc;
        for (let cout = 0; cout < nodes.length; cout++) {
            const i = (meta.parentIndex + cout) % nodes.length
            let el = nodes[i]
            let { innerText } = el
            let yes = innerText && innerText.length
            if (yes == false) { continue }

            let include = this.findElementText(el, prefix) != -1
            if (include == false) {
                if (el.tagName.toUpperCase() == 'P' && el.querySelector(".hl-ignored")) {
                    let filterText = this.filterText(el)
                    if (filterText) {
                        filterText = trimstring(filterText)
                        include = filterText.indexOf(prefixTrim) != -1;
                    }
                }
            }
            if (include) {
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
                let parent = notRoot(el.parentNode) ? el.parentNode : el
                let { begin, endMeta, startMeta } = this.checkParent(parent, text)
                if (endMeta) {
                    if (startMeta && begin == 0) {
                        let ret = this.updateParentIndex([startMeta, endMeta], hs)
                        if (ret) return ret
                    }
                    const getPrevOrPrevParent = (parent) => {
                        if (parent) {
                            let ret = parent.previousSibling
                            if (ret&&notRoot(ret)) 
                            {
                                if(this.isTextNode(ret)==false){
                                    return getPrevOrPrevParent(ret)
                                }
                                return ret
                            }
                            return getPrevOrPrevParent(parent.parentNode)
                        }
                    }
                    parent = getPrevOrPrevParent(parent)
                    while (parent) {
                        text = text.substring(0, begin)
                        let a = this.checkParent(parent, text, true)
                        begin = a.begin
                        if (a.startMeta) {
                            startMeta = a.startMeta
                        }
                        if (begin == 0) {
                            break
                        }
                        parent = getPrevOrPrevParent(parent)
                    }
                    if (startMeta) {
                        let ret = this.updateParentIndex([startMeta, endMeta], hs)
                        if (ret) return ret
                        return { startMeta, endMeta }
                    }
                }
            }
        }
        if (rc) { return rc }
        return undefined
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

function sameNodeTreeElement(c, b) {
    if (c.parentTagName == 'I') return false
    if (c.parentIndex == undefined) return false
    return c.parentIndex == b.parentIndex && c.parentTagName == b.parentTagName && c.textOffset == b.textOffset;
}
