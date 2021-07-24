import { UTILS } from './css_path'
// eslint-disable-next-line no-unused-vars
import {getSelectedNodes,HighlightRange} from './hlapi'
const regexpNoSpace = new RegExp("\\s", "g")
let trimstring = (s) => {
    // return s.replace(/\u3000|' '|\t/, '');
    let ret = s.replace(regexpNoSpace, '')
    return ret.replaceAll("\n", '')
}
const getPrevOrPrevParent = (parent) => {
    if (parent) {
        let ret = parent.previousSibling
        if (ret && notRoot(ret)) {
            if (isTextNode(ret) == false) {
                return getPrevOrPrevParent(ret)
            }
            return ret
        }
        return getPrevOrPrevParent(parent.parentNode)
    }
}

const findInTopElement = (node, text) => {
    if (node.nodeType == 3) {
        let t = trimstring(node.textContent)
        let index = text.lastIndexOf(t)
        if (index != -1 && index + t.length == text.length) {
            text = text.substring(0, index)
            return { node, text }
        } else {
            return { text, error: true }
        }
    }
    let rc = { text }
    if (isTextNode(node)) {
        let last = node.lastChild
        while (last) {
            let result = findInTopElement(last, text)
            text = result.text
            if (result.error) {
                let ignore = node.classList && node.classList.contains('hl-ignored')
                if (ignore == false) {
                    return result
                }
            }
            if (text.length == 0) return result
            rc = { ...result, ...{ error: false } }
            last = last.previousSibling
        }
    }
    return rc

}
const findInFirst = (node, text) => {
    if (node.nodeType == 3) {
        let t = trimstring(node.textContent)
        if (!t) {
            return { next: true }
        }
        let index = text.indexOf(t)
        if (index != -1) {
            return { node, textOffset: index, match: t }
        } else {
            return { error: true }
        }
    }
    let rc = { next: true }
    if (isTextNode(node)) {
        let last = node.firstChild
        while (last) {
            let ret = findInFirst(last, text)
            if (ret.node) {
                return ret
            }
            if (ret.next) {
                last = last.nextSibling
            } else {
                return ret
            }
        }
    }
    return rc
}

function searchFirstMatchNode(el, text) {
    let nextElement = el
    let parent = el.parentNode
    while (nextElement) {
        let result = findInFirst(nextElement, text);
        let { match, error } = result
        if (match) {
            return result
        }
        if (error) {
            let ignore = nextElement.classList && nextElement.classList.contains('hl-ignored')
            if (ignore == false)
                return result
        }
        nextElement = nextElement.nextSibling
    }
    if (parent) {
        return searchFirstMatchNode(parent.firstChild, text)
    } else {
        return { error: true }
    }
}

const completeSearch = (hs, begin, text) => {
    let { endMeta } = hs
    let first = false
    let text2search = text;
    let node2search = begin
    let beginElement = begin
    while (text2search.length) {
        const nextNode = (node) => {
            if (node.nextSibling) return node.nextSibling
            return nextNode(node.parentNode)
        }
        // eslint-disable-next-line no-unused-vars
        let { error, node } = searchFirstMatchNode(node2search, text2search)
        if (error) {
            if (first) {
                let s = trimstring(filteInnerText(node2search))
                let { sequence } = longestCommonSubstring(text2search, s)
                if (sequence) {
                    text2search = text2search.substring(text2search.lastIndexOf(sequence) + sequence.length)
                    node2search = nextNode(node2search)
                    first = false
                    if (notRoot(node2search) == false) break;
                    continue
                }
            }
            break;
        }
        let match = trimstring(node.textContent)
        text2search = text2search.substring(match.length)
        if (!text2search) {
            let el = node.parentElement
            while (el && notRoot(el)) {
                let { tagName } = el
                if (tagName == endMeta.parentTagName) {
                    return { beginElement, endElement: el }
                }
                el = el.parentElement
            }
            el = node.parentElement
            let { tagName } = el
            while (tagName == 'I') {
                if (el.parentElement) {
                    el = el.parentElement
                    tagName = el.tagName
                }
                else {
                    break
                }
            }
            return { beginElement, endElement: el }
        }
        node2search = nextNode(node)
        if (notRoot(node2search) == false) break;
    }
    console.log("completeSearch fail", hs.id, hs.text)
    return
}
const compareNodeText = (text2, el, prefixTrim) => {
    let parent = notRoot(el.parentNode) ? el.parentNode : el
    let preElement = parent
    let preContent = filteInnerText(preElement)
    let endElement = el
    preContent = trimstring(preContent)
    let bb = text2.lastIndexOf(preContent)
    let findTail
    if (bb == -1) {
        let { sequence } = longestCommonSubstring(text2, preContent)
        if (sequence) {
            findTail = sequence.lastIndexOf(prefixTrim) + prefixTrim.length == sequence.length
            if (findTail) {
                bb = text2.lastIndexOf((sequence))
            }
        }
    }
    if (bb == 0) {
        let { node } = findInFirst(preElement, text2)
        if (node) {
            return { beginElement: node, endElement }
        }
    }
    while (bb > 0) {
        text2 = text2.substring(0, bb)
        if (text2.length == 0) {
            break;
        }
        const find = (a) => {
            let index = -1
            let nextElement = getPrevOrPrevParent(a)
            if (!nextElement) return { index }
            let content = trimstring(filteInnerText(nextElement))
            if (content) {
                if (content.length > text2.length) {
                    if (content.lastIndexOf(text2) != 1) {
                        return { preElement: nextElement, index: 0 }
                    }
                    return { preElement: nextElement, index: -1 }
                } else {
                    let index = text2.lastIndexOf(content)
                    return { preElement: nextElement, index }
                }
            } else {
                return find(nextElement)
            }
        }
        let result = find(preElement)
        bb = result.index
        preElement = result.preElement
        if (bb == 0) {
            let ret = findInTopElement(preElement, text2)
            if (ret.node) {
                return { beginElement: ret.node, endElement }
            }
        }
    }
    return undefined
}
const isTextNode = (node) => {
    let { nodeType } = node;
    let yes = nodeType == 1 || nodeType == 3
    if (yes) {
        if (node.classList && node.classList.contains('notemarker')) {
            yes = false
        }
    }
    return yes
}
const commonInnerText = (node) => {
    let { innerText, nodeValue } = node;
    if (innerText == undefined) {
        innerText = nodeValue;
        if (innerText) {
            innerText = innerText.replaceAll("\n", '');
        }
    }
    if (innerText)
        return innerText;
    return '';
}
const filteInnerText = (node) => {
    const nodetext = (node) => {
        if (isTextNode(node) == false) { return "" }
        if (node.childNodes.length) {
            return undefined;
        }
        return commonInnerText(node)
    }
    let ret = nodetext(node)
    if (ret != undefined) return ret
    ret = ''
    for (let i = 0; i < node.childNodes.length; i++) {
        let a = node.childNodes[i]
        if (isTextNode(a) == false) continue
        let t = filteInnerText(a)
        if (t) {
            ret += t
        }
    }
    return ret
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
                    let text2 = ''
                    let innerText2 = ''
                    children = children.map((a) => {
                        let { tagName, text, innerText } = a;
                        if (innerText) {
                            innerText2 += (innerText)
                        }
                        if (tagName == "I") {
                            if (text.length)
                                text2 += (trimstring(text))
                            return undefined
                        }
                        return a;
                    }).filter((a) => a != undefined);
                    if (children.length == 0)
                        children = undefined
                    if (text2) {
                        text = text2
                    }
                    if (innerText2) {
                        innerText = innerText2
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
        let innerText = '';
        tree.map((node) => {
            let { innerText } = node
            return innerText
        }).filter((a) => a != undefined).forEach((a) => {
            innerText += a
        })

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
    // getMetaElement(meta) {
    //     let nodes = this.$root.querySelectorAll(meta.parentTagName)
    //     try {
    //         return nodes[meta.parentIndex]
    //     } catch (error) {
    //         return
    //     }
    // }
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
        let { nodeType, } = a;
        let element = a

        let innerText = filteInnerText(a)

        let parentTagName = a.tagName;
        if (nodeType == 3) {
            element = a.parentElement;
            parentTagName = element.tagName;
        }
        while (parentTagName == 'I') {
            element = element.parentElement
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
        let elText = commonInnerText(el)
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
    searchByNodetree2(hs) {
        let { nodetree } = hs
        if (nodetree && nodetree.length) {
            let result = [nodetree[0]]
            nodetree = result.filter((a) => a.innerText)
        }
        let text = trimstring(hs.text)
        if (nodetree && nodetree.length) {
            let beginIdx
            nodetree.filter((a) => {
                let { trim } = a
                if (trim == undefined) {
                    trim = trimstring(a.innerText)
                    a.trim = trim;
                }
                return a.trim
            })
            if (beginIdx != undefined) {
                nodetree = nodetree.slice(beginIdx)
            }
            let beginMeta = nodetree[0]
            beginMeta = this._searchNode(beginMeta)
            if (beginMeta.findel === undefined) {
                beginMeta.parentIndex = undefined;
                beginMeta = this._searchNode(beginMeta)
            }
            let { findel } = beginMeta
            let compareResult = completeSearch(hs, findel, text)
            if (compareResult) {
                let { endElement, beginElement } = compareResult
                let endMeta = this.getMeta(endElement)
                let startMeta = this.getMeta(beginElement)
                let ret = this.updateParentIndex([startMeta, endMeta], hs)
                if (ret) return ret
                return { startMeta, endMeta }
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
            let innerText = commonInnerText(node.$node)
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
            let innerText = commonInnerText(node)
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
            rebuildTree(hs)
            // this.searchByNodetree2(nodetree ? hs : { ...hs, nodetree: rebuildTree(hs) })
            ret = this.replacementHS3(hs)
            if (ret) {
                return { ...hs, ...ret }
            }
            if (nodetree) {
                ret = this.searchByNodetree2(hs)
            } else {
                let { tree } = rebuildTree(hs)
                ret = this.searchByNodetree2({ ...hs, ...{ nodetree: tree } })
            }
            if (ret) return ret
            console.warn('not find ' + hs.id + '   ' + hs.text, hs)
        }
        return hs
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
                filterText = node.nodeValue;
            }
        }
        filterText = trimstring(filterText).replaceAll("\n", '')
        node.filterText = filterText
        return filterText
    }

    cancheck = (parentElement) => { return parentElement && parentElement.tagName != "article".toUpperCase() }
    replacementHS3(hs) {
        const OneElement = (hs) => {
            let { startMeta, endMeta } = hs;
            if (startMeta.parentTagName != endMeta.parentTagName) return false;
            if (startMeta.parentIndex != endMeta.parentIndex) return false;
            return true;
        }

        let { endMeta } = hs;
        let prefix = OneElement(hs) ? hs.text : hs.text.substring(hs.text.length - endMeta.textOffset)
        let prefixTrim = trimstring(prefix)
        let meta = { ...endMeta }
        let nodes = this.queryNodes[meta.parentTagName]
        if (nodes == undefined) {
            nodes = this.$root.querySelectorAll(meta.parentTagName)
            this.queryNodes[meta.parentTagName] = nodes
        }
        let isOneElement = OneElement(hs)

        let rc;
        let left = false;
        let offset = 0;
        for (let cout = 0; cout < nodes.length; cout++) {
            offset = parseInt(cout / 2)
            if (left) {
                offset = -offset
                if (offset == 0 && left) {
                    left = !left
                    continue
                }
            }
            left = !left
            const i = meta.parentIndex + offset
            let el = nodes[i]
            if (el == undefined) continue
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
                let compareResult = compareNodeText(text, el, prefixTrim)
                if (compareResult) {
                    let { endElement, beginElement } = compareResult
                    let endMeta = this.getMeta(endElement)
                    let startMeta = this.getMeta(beginElement)
                    let ret = this.updateParentIndex([startMeta, endMeta], hs)
                    if (ret) return ret
                    return { startMeta, endMeta }

                }
            }
        }
        if (rc) { return rc }
        return undefined
    }
    getMeta = (el) => {
        if (el.nodeType == 3) {
            el = el.parentElement
        }
        let parentTagName = el.tagName
        if (parentTagName == "I" && (el.classList && el.classList.contains('docsify-highlighter'))) {
            el = el.parentElement
            parentTagName = el.tagName
        }
        return { parentTagName, ...this.getParentIndex({ parentTagName }, el) }
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