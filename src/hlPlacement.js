import { UTILS } from './css_path'
import Highlighter2 from './hlapi/index';
const regexpNoSpace = new RegExp("\\s", "g")


export const trimElement = (el) => {
    let { innerTextTrim } = el
    if (innerTextTrim == undefined) {
        innerTextTrim = trimstring(el.textContent)
        el.innerTextTrim = innerTextTrim
    }
    return innerTextTrim
}
const getKK = (k, textContent) => {
    let blankPoint = Array.from(textContent.matchAll(regexpNoSpace))
    if (blankPoint.length == 0) return k
    blankPoint = blankPoint.map((a) => {
        return a.index
    })
    // eslint-disable-next-line no-unused-vars
    for (let i = 0; i < blankPoint.length; i++) {
        let b = blankPoint[i]
        let kk = k + i
        if (kk <= b) {
            return kk;
        }
    }
    return k + blankPoint.length
}

export let trimstring = (s) => {
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

const shouldIgnore = (node) => node.classList && node.classList.contains('notemarker') ? true : false
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
export let getNodeMatchTextBackword = (el, text,) => {
    let selectedNodes = []
    let left = trimstring(text)
    // let trimBegin = 0
    let stack = [el]
    let beginOffset;
    let findtext = ''
    let checkedIgnore = false
    let endIndex = {}, beginIndex = {}
    while (left.length && stack.length) {
        let curNode = stack.pop()
        if (!curNode) {
            continue
        }
        if (shouldIgnore(curNode) == false) {
            if (curNode.nodeType == 3) {
                let trimContent = trimstring(curNode.textContent)
                if (trimContent) {
                    let index = left.lastIndexOf(trimContent)
                    let match = index != -1
                    if (!match) {
                        if (trimContent.length >= left.length) {
                            index = trimContent.indexOf(left)
                            if (index != -1) {
                                beginOffset = index
                                index = 0
                                trimContent = left
                                match = true
                            }
                            if (match == false && checkedIgnore) {
                                selectedNodes = []
                                break
                            }
                        } else {
                            if (selectedNodes.length == 0) {
                                let { sequence } = longestCommonSubstring(left, trimContent)
                                if (sequence) {
                                    index = left.lastIndexOf(sequence)
                                    if (index != -1) {
                                        match = index + sequence.length == left.length
                                        if (match) {
                                            trimContent = sequence
                                        }
                                    }
                                }
                            }
                            if (!match && checkedIgnore) {
                                let parentNode = curNode.parentNode
                                let ignored = hlIngoreElement(parentNode)
                                if (ignored == false) {
                                    if (selectedNodes.length)
                                        console.warn("getMatchedNodes=" + selectedNodes.length, " left=" + left, " s:" + trimContent)
                                    selectedNodes = []
                                    break
                                }
                            }
                        }
                    }
                    if (match) {
                        if (selectedNodes.length == 0) {
                            let textOffset = getKK(trimContent.length, curNode.textContent)
                            endIndex = { ...endIndex, index, curNode, textOffset }
                        }
                        left = left.substring(0, index)
                        if (!left) {
                            let textOffset = getKK(trimstring(curNode.textContent).indexOf(trimContent), curNode.textContent)
                            beginIndex = { ...beginIndex, index, curNode, textOffset }
                        }
                        findtext = trimContent + findtext
                        selectedNodes.push(curNode)
                    }
                }
            } else {
                let { childNodes } = curNode
                for (let i = 0; i < childNodes.length; i++) {
                    stack.push(childNodes[i])
                }
            }
        }
        if (stack.length == 0) {
            let copy = (parentNode, curNode) => {
                let { childNodes } = parentNode;
                for (let i = 0; i < childNodes.length; i++) {
                    let c = childNodes[i]
                    if (c == curNode) break
                    stack.push(c)
                }
                return stack.length != 0
            }
            let parentNode = curNode.parentNode
            while (parentNode) {
                let ret = copy(parentNode, curNode)
                if (ret) {
                    break
                }
                curNode = parentNode
                parentNode = parentNode.parentNode
            }
        }
    }
    if (left) return undefined
    if (selectedNodes.length) {
        let beginElement = selectedNodes[selectedNodes.length - 1]
        let endElement = selectedNodes[0]
        return { findtext, selectedNodes, beginOffset, beginElement, endElement, beginIndex, endIndex }
    }
}
export let getNodeMatchTextForward = (el, text,) => {
    let pushChildNodes = (curNode, stack) => {
        let childNodes = curNode.childNodes
        for (let i = childNodes.length - 1; i >= 0; i--) {
            stack.push(childNodes[i])
        }
    }
    let endIndex = {}, beginIndex = {}
    let selectedNodes = []
    let left = trimstring(text)
    let trimBegin = 0
    let stack = [el]
    let matchIndex;
    let checkedIgnore = false
    let findtext = ''
    while (trimBegin < left.length && stack.length) {
        let curNode = stack.pop()
        if (!curNode) {
            continue
        }
        if (shouldIgnore(curNode) == false) {
            if (curNode.nodeType == 3) {
                let trimContent = trimstring(curNode.textContent)
                if (trimContent) {
                    let index = left.indexOf(trimContent, trimBegin)
                    let match = index != -1
                    if (!match) {
                        if (trimContent.length > left.length - trimBegin) {
                            index = trimContent.indexOf(left.substring(trimBegin))
                            if (index == 0) {
                                trimBegin = left.length
                                selectedNodes.push(curNode)
                                break
                            }
                            if (checkedIgnore) {
                                selectedNodes = []
                                break
                            }
                        } else {
                            if (selectedNodes.length == 0) {
                                let { sequence } = longestCommonSubstring(left, trimContent)
                                if (sequence) {
                                    index = left.indexOf(sequence)
                                    trimContent = sequence
                                    match = true;
                                }
                            }
                            if (!match && checkedIgnore) {
                                let parentNode = curNode.parentNode
                                let ignored = hlIngoreElement(parentNode)
                                if (ignored == false) {
                                    if (selectedNodes.length)
                                        console.warn("getMatchedNodes=" + selectedNodes.length, " left=" + left.substring(trimBegin), " begin:" + trimBegin, " s:" + trimContent)
                                    selectedNodes = []
                                    break
                                }
                            }
                        }
                    }
                    if (match) {
                        if (selectedNodes.length == 0) {
                            let textOffset = getKK(trimstring(curNode.textContent).indexOf(trimContent), curNode.textContent)
                            beginIndex.textOffset = textOffset
                            trimBegin = index
                            matchIndex = index
                        } else {
                            if (index != trimBegin) {
                                return
                            }
                        }
                        findtext += trimContent
                        trimBegin += trimContent.length
                        selectedNodes.push(curNode)
                    }
                }
            } else {
                pushChildNodes(curNode, stack)
                continue
            }
        }
        if (stack.length == 0) {
            let copy = (parentNode, curNode) => {
                let { childNodes } = parentNode;
                for (let i = childNodes.length - 1; i >= 0; i--) {
                    let c = childNodes[i]
                    if (c == curNode) break
                    stack.push(c)
                }
                return stack.length != 0
            }
            let parentNode = curNode.parentNode
            while (parentNode) {
                let ret = copy(parentNode, curNode)
                if (ret) {
                    break
                }
                curNode = parentNode
                parentNode = parentNode.parentNode
            }
            if (!stack.length) {
                selectedNodes = []
            }
        }
    }
    if (trimBegin < left.length) return undefined
    if (selectedNodes.length) {
        let endElement = selectedNodes[selectedNodes.length - 1]
        let beginElement = selectedNodes[0]
        return { selectedNodes, matchIndex, beginElement, endElement, findtext, beginIndex, endIndex }
    }
    return
}
export const getMetaNode = (root, { parentTagName, parentIndex, textOffset }) => {
    let node = root.querySelectorAll(parentTagName)[parentIndex]
    return getTextChildByOffset(node, textOffset)
}


export function hlIngoreElement(node) {
    return node && node.classList && node.classList.contains('hl-ignored') ? true : false;
}
const OneElement = (hs) => {
    let { startMeta, endMeta } = hs;
    if (startMeta.parentTagName != endMeta.parentTagName) return false;
    if (startMeta.parentIndex != endMeta.parentIndex) return false;
    return true;
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
class loop {
    constructor(parentIndex) {
        this.left = false
        this.parentIndex = parentIndex
    }
    geti(cout) {
        let { left, parentIndex } = this
        let offset = parseInt(cout / 2)
        if (left) {
            offset = -offset
            if (offset == 0 && left) {
                left = !left
            }
        } else {
            left = !left
        }
        const i = parentIndex + offset
        this.left = left
        return i
    }
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
            nodetree = []
        } else {
            if (startMeta && endMeta) {
                console.log(startMeta, nodetree[0])
                console.log(endMeta, nodetree[nodetree.length - 1])
            }
        }
        return { nodetree, ...csspath };
    }
    searchFromStartMeta(hs) {
        let { nodetree } = hs
        if (!nodetree) {
            return undefined
        }
        if (!nodetree.length) { return undefined }
        let text = trimstring(hs.text)
        nodetree = nodetree.filter((a) => a.innerText).map((a) => { return { ...a, trim: trimstring(a.innerText) } })
        let { parentTagName, parentIndex } = hs.startMeta
        let nodes = this.$root.querySelectorAll(parentTagName)
        let firstText = trimstring(nodetree[0].innerText)
        if (text.indexOf(firstText) != 0) {
            let matched = nodetree.find((a) => text.indexOf(a.trim) != -1)
            if (matched) {
                firstText = matched.trim
            }
        }
        let _loop = new loop(parentIndex)
        for (let cout = 0; cout < nodes.length; cout++) {
            const i = _loop.geti(cout)
            let el = nodes[i]
            if (el == undefined) continue
            let elText = trimstring(el.textContent).replaceAll("\n", "")
            if (elText.indexOf(firstText) != -1) {
                // eslint-disable-next-line no-unused-vars
                let result = getNodeMatchTextForward(el, text)
                if (result) {
                    let left = text.substring(0, result.matchIndex)
                    if (left) {
                        let prev = getPrevOrPrevParent(el)
                        if (prev) {
                            let back = getNodeMatchTextBackword(prev, left)
                            if (back && back.beginElement) {
                                let beginElement = back.beginElement
                                result = { ...result, beginElement }
                            }
                        }
                    }
                    let bbb = this.converTextNode2Meta(result, text, hs);
                    let { beginElement, endElement } = result
                    let { startMeta, endMeta } = bbb;
                    if (!endMeta)
                        endMeta = this.getMeta(endElement)
                    if (!startMeta)
                        startMeta = this.getMeta(beginElement)
                    let ret = this.updateParentIndex([startMeta, endMeta], hs)
                    if (ret) return ret
                    return { ...hs, startMeta, endMeta }
                }
            }
        }
    }

    converTextNode2Meta({ beginElement, endElement, beginIndex, endIndex }, text, hs) {
        let { $root } = this;
        let a = new Highlighter2({
            $root,
            wrapTag: 'i',
            exceptSelectors: ['.html-drawer', '.my-remove-tip', '.op-panel', '.charpterhtml'],
            style: {
                className: 'docsify-highlighter'
            }
        });
        let bbb = {};
        try {
            let range = document.createRange();
            let offset = beginIndex.textOffset
            range.setStart(beginElement, offset);
            offset = endIndex.textOffset
            range.setEnd(endElement, offset);
            bbb = a.converRange2Source(range);
        } catch (error) {
            console.error(error, hs.id);
        }
        return bbb;
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
        // let { nodetree } = hs;
        // if (nodetree == undefined) {
        //     nodetree = rebuildTree(hs).tree
        // }
        // let ret = []
        let { text } = hs
        text = trimstring(text)
        let nodeText = ''
        const concatNode = (text, begin = 0) => {
            let left = text
            let first = true
            for (let i = begin; i < selectedNodes.length; i++) {
                let node = selectedNodes[i]
                let a = trimElement(node.$node)
                if (!a) continue
                // nodeText = nodeText + a
                let index = left.indexOf(a)
                if (index != -1) {
                    if (first) {
                        begin = i
                        first = false
                        nodeText += a;
                        left = left.substring(index + a.length)
                    } else {
                        if (index == 0) {
                            nodeText += a;
                            left = left.substring(index + a.length)
                            if (left.length == 0) {
                                let ret = selectedNodes.slice(0, i)
                                return { begin, ret, nodeText }
                            }
                        }
                    }
                }
            }
            return { begin, nodeText }
        }
        let searchBegin = 0
        while (searchBegin < text.length) {
            // eslint-disable-next-line no-unused-vars
            let { ret, begin, nodeText } = concatNode(text, searchBegin)
            if (ret) return ret
            if (begin == searchBegin) return []
            searchBegin = begin
        }
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
            let notetreefirst = this.chooseNodeTree(hs)
            let backSearch = this.searchFromEndMeta.bind(this)
            let forwardFn = this.searchFromStartMeta.bind(this)
            let callList = notetreefirst ? [forwardFn, backSearch] : [backSearch, forwardFn]
            for (let i = 0; i < callList.length; i++) {
                let ret = callList[i](hs)
                if (ret) {
                    return { ...hs, ...ret }
                }
                // console.error(callList[i] == backSearch ? 'replacementHS3 fail' : "searchByNodetree2 fail", hs.id)
            }
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
    chooseNodeTree(hs) {
        let { endMeta } = hs;
        let prefix = OneElement(hs) ? hs.text : hs.text.substring(hs.text.length - endMeta.textOffset)
        let prefixTrim = trimstring(prefix)


        let { nodetree } = hs
        if (nodetree && nodetree instanceof Array && nodetree.length) {
            nodetree = nodetree.filter((a) => a.innerText).map((a) => { return { ...a, trim: trimstring(a.innerText) } })
            let firstText = trimstring(nodetree[0].innerText)
            return firstText.length > prefixTrim.length
        }
        return false

    }
    searchFromEndMeta(hs) {
        let { endMeta } = hs;
        let prefix = OneElement(hs) ? hs.text : hs.text.substring(hs.text.length - endMeta.textOffset)
        let prefixTrim = trimstring(prefix)
        let meta = { ...endMeta }
        let nodes = this.queryNodes[meta.parentTagName]
        if (nodes == undefined) {
            nodes = this.$root.querySelectorAll(meta.parentTagName)
            this.queryNodes[meta.parentTagName] = nodes
        }
        // let isOneElement = OneElement(hs)

        let rc;
        let text = trimstring(hs.text)
        let _loop = new loop(meta.parentIndex)
        for (let cout = 0; cout < nodes.length; cout++) {
            const i = _loop.geti(cout)
            let el = nodes[i]
            if (el == undefined) continue
            let include = trimElement(el).indexOf(prefixTrim) != -1
            // let include = this.findElementText(el, prefix) != -1
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
                // eslint-disable-next-line no-unused-vars
                let a = getNodeMatchTextBackword(el, text)
                if (a) {
                    let { beginElement, endElement } = a
                    let bbb = this.converTextNode2Meta(a, text, hs)
                    let { startMeta, endMeta } = bbb;
                    if (!endMeta)
                        endMeta = this.getMeta(endElement)
                    if (!startMeta)
                        startMeta = this.getMeta(beginElement)
                    let ret = this.updateParentIndex([startMeta, endMeta], hs)
                    if (ret) return ret
                    return { ...hs, startMeta, endMeta }
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
