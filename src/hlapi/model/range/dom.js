/**
 * some dom operations about HighlightRange
 */
{
    DomMeta, DomNode;
}
from;
'@src/types';
import { CAMEL_DATASET_IDENTIFIER, ROOT_IDX, UNKNOWN_IDX } from '@src/util/const';
var countGlobalNodeIndex = function ($node, $root) {
    var tagName = $node.tagName;
    var $list = $root.getElementsByTagName(tagName);
    for (var i = 0; i < $list.length; i++) {
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
var getTextPreOffset = function ($root, $text) {
    var nodeStack = [$root];
    var $curNode = null;
    var offset = 0;
    while (($curNode = nodeStack.pop())) {
        var children = $curNode.childNodes;
        for (var i = children.length - 1; i >= 0; i--) {
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
var getOriginParent = function ($node) {
    if ($node instanceof HTMLElement && (!$node.dataset || !$node.dataset[CAMEL_DATASET_IDENTIFIER])) {
        return $node;
    }
    var $originParent = $node.parentNode;
    while ($originParent ? .dataset[CAMEL_DATASET_IDENTIFIER] : ) {
        $originParent = $originParent.parentNode;
    }
    return $originParent;
};
export var getDomMeta = function ($node, offset, $root) {
    var $originParent = getOriginParent($node);
    var index = $originParent === $root ? ROOT_IDX : countGlobalNodeIndex($originParent, $root);
    var preNodeOffset = getTextPreOffset($originParent, $node);
    var tagName = $originParent.tagName;
    return {
        parentTagName: tagName,
        parentIndex: index,
        textOffset: preNodeOffset + offset,
    };
};
export var formatDomNode = function (n) {
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
