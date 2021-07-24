{
    DomNode;
}
from;
'@src//types';
from;
'@src/model/source/index';
import { ROOT_IDX } from '@src/util/const';
/**
 * Because of supporting highlighting a same area (range overlapping),
 * Highlighter will calculate which text-node and how much offset it actually be,
 * based on the origin website dom node and the text offset.
 *
 * @param {Node} $parent element node in the origin website dom tree
 * @param {number} offset text offset in the origin website dom tree
 * @return {DomNode} DOM a dom info object
 */
export var getTextChildByOffset = function ($parent, offset) {
    var nodeStack = [$parent];
    var $curNode = null;
    var curOffset = 0;
    var startOffset = 0;
    while (($curNode = nodeStack.pop())) {
        var children = $curNode.childNodes;
        for (var i = children.length - 1; i >= 0; i--) {
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
/**
 * get start and end parent element from meta info
 *
 * @param {HighlightSource} hs
 * @param {HTMLElement | Document} $root root element, default document
 * @return {Object}
 */
export var queryElementNode = function (hs, $root) {
    var start = hs.startMeta.parentIndex === ROOT_IDX
        ? $root
        : $root.getElementsByTagName(hs.startMeta.parentTagName)[hs.startMeta.parentIndex];
    var end = hs.endMeta.parentIndex === ROOT_IDX
        ? $root
        : $root.getElementsByTagName(hs.endMeta.parentTagName)[hs.endMeta.parentIndex];
    return { start: start, end: end };
};
