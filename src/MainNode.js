export class SubNode {
    constructor(el) {
        let { highlightId, highlightIdExtra, highlightSplitType } = el.dataset ? el.dataset : {}
        this.el = el
        this.text = el.textContent
        this.highlightId = highlightId && highlightId.length ? highlightId : undefined
        this.highlightIdExtra = highlightIdExtra && highlightIdExtra.length ? highlightIdExtra : undefined
        this.highlightSplitType = highlightSplitType
    }
    changeID({ id, extra }) {
        if (id != undefined)
            this.el.dataset.highlightId = id;
        if (extra != undefined)
            this.el.dataset.highlightIdExtra = extra;
    }

}
export const main_node_contain = 1
export const main_node_overlap = 2
export const main_node_before = 3
export const main_node_after = 4
export let isBeforeB = (node, othernode) => {
    let cmp = node.compareDocumentPosition(othernode)
    if (cmp & Node.DOCUMENT_POSITION_FOLLOWING) {
        return true
    }
    return false
}

export let cmpNodePosition = (node, othernode) => {
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
export class MainNode {
    constructor(id, { highlighter, store }) {
        this.highlighter = highlighter;
        this.store = store;
        this.id = id;
        this.nodes = highlighter.getDoms(id).sort(cmpNodePosition);
        this.existIds = this.nodes.reduce((ret, node) => {
            try {
                const extra = highlighter.getExtraIdByDom(node)
                ret = ret.concat(extra);
                return ret;
            } catch (error) {
                return ret
            }
        }, []);
        this.existIds = Array.from(new Set(this.existIds));
        this.text = this.getNodeText(this.nodes);
    }
    childIdList() {
        let { id } = this;
        return this.highlighter.getDoms(id).reduce((ret, node) => {
            let sub = new SubNode(node);
            if (sub.highlightId != id) {
                ret.push(sub.highlightId);
            }
            return ret;
        }, []);
    }
    parentIdList() {
        let main = this.findMainNode();
        if (main) {
            try {
                let extra = this.highlighter.getExtraIdByDom(main);
                return extra;
            } catch (e) { return [] }
        }
        return [];
    }
    getNodeText(nodes) {
        return nodes.reduce((ret, node) => {
            return ret + node.textContent;
        }, "");
    }
    subFirst() { return this.nodes[0]; }
    subLast() { return this.nodes[this.nodes.length - 1]; }
    findMainNode() {
        let nodes = this.highlighter.getDoms(this.id);
        return nodes.find((node) => {
            let n = new SubNode(node);
            if (n.highlightId == this.id) { return true; }
            return false;
        });
    }
    checkOverLap(b) {
        let bNodes = b.nodes;
        let ret = [];
        for (let i = 0; i < bNodes.length; i++) {
            let b = bNodes[i];
            if (this.nodes.indexOf(b) != -1) {
                ret.push(b);
            }
            if (ret.length) {
                break;
            }
        }
        return ret;
    }
    cmpNodeHeadBefore(b) {
        let a1 = this.subFirst();
        let b1 = b.subFirst();
        return isBeforeB(a1, b1);
    }
    createNewMeta(hlPlacement, hs) {
        if (this.splitnode) {
            let { splitnode } = this;
            let beginElement = splitnode[0].firstChild;
            let endElement = splitnode[splitnode.length - 1].firstChild;
            let beginIndex = { textOffset: 0 };
            let endIndex = { textOffset: endElement.textContent.length };
            // let endIndex = beginIndex
            let a = { beginElement, endElement, beginIndex, endIndex };
            let ret = hlPlacement.converTextNode2Meta(a, text, hs);
            let text = this.splitnode.map((a) => a.textContent).join('');
            let nodetree = undefined;
            ret = { ...ret, text, nodetree };
            ret.id = hs.id;
            return ret;
        }
        return undefined;
    }
    sliceByNewNode(newNode) {
        let overlap = this.checkOverLap(newNode);
        if (overlap.length == 0)
            return undefined;
        let before = this.cmpNodeHeadBefore(newNode);
        if (before) {
            let index = this.nodes.indexOf(overlap[0]);
            this.splitnode = this.nodes.slice(0, index);
        } else {
            let index = this.nodes.indexOf(overlap[overlap.length - 1]);
            this.splitnode = this.nodes.slice(index);
        }
        if (this.splitnode) {
            this.sliceText = this.getNodeText(this.splitnode);
        }
        return this.splitnode;
    }
    cmpNodePosition(b) {
        let a1 = this.subFirst();
        let a2 = this.subLast();
        let b1 = b.subFirst();
        let b2 = b.subLast();

        if (isBeforeB(a2, b1))
            return main_node_before;
        if (isBeforeB(b2, a1))
            return main_node_after;

        if (isBeforeB(a1, b1) && isBeforeB(b2, a2)) {
            return main_node_contain;
        }
        return main_node_overlap;
    }
}

// offsetHeight: 40
// offsetLeft: 15
// offsetParent: article#main.markdown-section
// offsetTop: 30
// offsetWidth: 68
export const getPosition = ($node) => {
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