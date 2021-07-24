import { CAMEL_DATASET_IDENTIFIER, ROOT_IDX, UNKNOWN_IDX } from '../../util/const';
const countGlobalNodeIndex = ($node, $root) => {
    const tagName = $node.tagName;
    const $list = $root.getElementsByTagName(tagName);
    for (let i = 0; i < $list.length; i++) {
        if ($node === $list[i]) {
            return i;
        }
    }
    return UNKNOWN_IDX;
};
/**
 * text total length in all predecessors (text nodes) in the root node
 * (without offset in current node)
 */
const getTextPreOffset = ($root, $text) => {
    const nodeStack = [$root];
    let $curNode = null;
    let offset = 0;
    while (($curNode = nodeStack.pop())) {
        const children = $curNode.childNodes;
        for (let i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }
        if ($curNode.nodeType === 3 && $curNode !== $text) {
            offset += $curNode.textContent.length;
        }
        else if ($curNode.nodeType === 3) {
            break;
        }
    }
    return offset;
};
/**
 * find the original dom parent node (none highlight dom)
 */
const getOriginParent = ($node) => {
    if ($node instanceof HTMLElement && (!$node.dataset || !$node.dataset[CAMEL_DATASET_IDENTIFIER])) {
        return $node;
    }
    let $originParent = $node.parentNode;
    while ($originParent ? $originParent.dataset[CAMEL_DATASET_IDENTIFIER] : false) {
        $originParent = $originParent.parentNode;
    }
    return $originParent;
};
export const getDomMeta = ($node, offset, $root) => {
    const $originParent = getOriginParent($node);
    const index = $originParent === $root ? ROOT_IDX : countGlobalNodeIndex($originParent, $root);
    const preNodeOffset = getTextPreOffset($originParent, $node);
    const tagName = $originParent.tagName;
    return {
        parentTagName: tagName,
        parentIndex: index,
        textOffset: preNodeOffset + offset,
    };
};
export const formatDomNode = (n) => {
    if (
    // Text
    n.$node.nodeType === 3 ||
        // CDATASection
        n.$node.nodeType === 4 ||
        // Comment
        n.$node.nodeType === 8) {
        return n;
    }
    return {
        $node: n.$node.childNodes[n.offset],
        offset: 0,
    };
};
