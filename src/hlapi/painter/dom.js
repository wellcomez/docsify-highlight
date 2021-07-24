import { SplitType, SelectedNodeType } from '../types';
import { hasClass, addClass as addElementClass, isHighlightWrapNode, removeAllClass } from '../util/dom';
import { ID_DIVISION, getDefaultOptions, CAMEL_DATASET_IDENTIFIER, CAMEL_DATASET_IDENTIFIER_EXTRA, DATASET_IDENTIFIER, DATASET_SPLIT_TYPE, DATASET_IDENTIFIER_EXTRA, } from '../util/const';
import { unique } from '../util/tool';
/**
 * 支持的选择器类型
 *  - class: .title, .main-nav
 *  - id: #nav, #js-toggle-btn
 *  - tag: div, p, span
 */
var isMatchSelector = function ($node, selector) {
    if (!$node) {
        return false;
    }
    if (/^\./.test(selector)) {
        var className = selector.replace(/^\./, '');
        return $node && hasClass($node, className);
    }
    else if (/^#/.test(selector)) {
        var id = selector.replace(/^#/, '');
        return $node && $node.id === id;
    }
    var tagName = selector.toUpperCase();
    return $node && $node.tagName === tagName;
};
/**
 * If start node and end node is the same, don't need to tranvers the dom tree.
 */
var getNodesIfSameStartEnd = function ($startNode, startOffset, endOffset, exceptSelectors) {
    var $element = $startNode;
    var isExcepted = function ($e) { return exceptSelectors ? exceptSelectors.some(function (s) { return isMatchSelector($e, s); }) : false; };
    while ($element) {
        if ($element.nodeType === 1 && isExcepted($element)) {
            return [];
        }
        $element = $element.parentNode;
    }
    $startNode.splitText(startOffset);
    var passedNode = $startNode.nextSibling;
    passedNode.splitText(endOffset - startOffset);
    return [
        {
            $node: passedNode,
            type: SelectedNodeType.text,
            splitType: SplitType.both,
        },
    ];
};
/**
 * get all the dom nodes between the start and end node
 */
export var getSelectedNodes = function ($root, start, end, exceptSelectors) {
    var $startNode = start.$node;
    var $endNode = end.$node;
    var startOffset = start.offset;
    var endOffset = end.offset;
    // split current node when the start-node and end-node is the same
    if ($startNode === $endNode && $startNode instanceof Text) {
        return getNodesIfSameStartEnd($startNode, startOffset, endOffset, exceptSelectors);
    }
    var nodeStack = [$root];
    var selectedNodes = [];
    var isExcepted = function ($e) { return exceptSelectors ? exceptSelectors.some(function (s) { return isMatchSelector($e, s); }) : false; };
    var withinSelectedRange = false;
    var curNode = null;
    while ((curNode = nodeStack.pop())) {
        // do not traverse the excepted node
        if (curNode.nodeType === 1 && isExcepted(curNode)) {
            continue;
        }
        var children = curNode.childNodes;
        for (var i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }
        // only collect text nodes
        if (curNode === $startNode) {
            if (curNode.nodeType === 3) {
                curNode.splitText(startOffset);
                var node = curNode.nextSibling;
                selectedNodes.push({
                    $node: node,
                    type: SelectedNodeType.text,
                    splitType: SplitType.head,
                });
            }
            // meet the start-node (begin to traverse)
            withinSelectedRange = true;
        }
        else if (curNode === $endNode) {
            if (curNode.nodeType === 3) {
                let node = curNode;
                node.splitText(endOffset);
                selectedNodes.push({
                    $node: node,
                    type: SelectedNodeType.text,
                    splitType: SplitType.tail,
                });
            }
            // meet the end-node
            break;
        }
        // handle text nodes between the range
        else if (withinSelectedRange && curNode.nodeType === 3) {
            selectedNodes.push({
                $node: curNode,
                type: SelectedNodeType.text,
                splitType: SplitType.none,
            });
        }
    }
    return selectedNodes;
};
var addClass = function ($el, className) {
    var classNames = Array.isArray(className) ? className : [className];
    classNames = classNames.length === 0 ? [getDefaultOptions().style.className] : classNames;
    classNames.forEach(function (c) {
        addElementClass($el, c);
    });
    return $el;
};
var isNodeEmpty = function ($n) { return !$n || !$n.textContent; };
/**
 * Wrap a common wrapper.
 */
var wrapNewNode = function (selected, range, className, wrapTag) {
    var $wrap = document.createElement(wrapTag);
    addClass($wrap, className);
    $wrap.appendChild(selected.$node.cloneNode(false));
    selected.$node.parentNode.replaceChild($wrap, selected.$node);
    $wrap.setAttribute("data-" + DATASET_IDENTIFIER, range.id);
    $wrap.setAttribute("data-" + DATASET_SPLIT_TYPE, selected.splitType);
    $wrap.setAttribute("data-" + DATASET_IDENTIFIER_EXTRA, '');
    return $wrap;
};
/**
 * Split and wrapper each one.
 */
var wrapPartialNode = function (selected, range, className, wrapTag) {
    var $wrap = document.createElement(wrapTag);
    var $parent = selected.$node.parentNode;
    var $prev = selected.$node.previousSibling;
    var $next = selected.$node.nextSibling;
    var $fr = document.createDocumentFragment();
    var parentId = $parent.dataset[CAMEL_DATASET_IDENTIFIER];
    var parentExtraId = $parent.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
    var extraInfo = parentExtraId ? parentId + ID_DIVISION + parentExtraId : parentId;
    $wrap.setAttribute("data-" + DATASET_IDENTIFIER, range.id);
    $wrap.setAttribute("data-" + DATASET_IDENTIFIER_EXTRA, extraInfo);
    $wrap.appendChild(selected.$node.cloneNode(false));
    var headSplit = false;
    var tailSplit = false;
    var splitType;
    if ($prev) {
        var $span = $parent.cloneNode(false);
        $span.textContent = $prev.textContent;
        $fr.appendChild($span);
        headSplit = true;
    }
    var classNameList = [];
    if (Array.isArray(className)) {
        classNameList.push.apply(classNameList, className);
    }
    else {
        classNameList.push(className);
    }
    addClass($wrap, unique(classNameList));
    $fr.appendChild($wrap);
    if ($next) {
        let $span = $parent.cloneNode(false);
        $span.textContent = $next.textContent;
        $fr.appendChild($span);
        tailSplit = true;
    }
    if (headSplit && tailSplit) {
        splitType = SplitType.both;
    }
    else if (headSplit) {
        splitType = SplitType.head;
    }
    else if (tailSplit) {
        splitType = SplitType.tail;
    }
    else {
        splitType = SplitType.none;
    }
    $wrap.setAttribute("data-" + DATASET_SPLIT_TYPE, splitType);
    $parent.parentNode.replaceChild($fr, $parent);
    return $wrap;
};
/**
 * Just update id info (no wrapper updated).
 */
var wrapOverlapNode = function (selected, range, className) {
    var $parent = selected.$node.parentNode;
    var $wrap = $parent;
    removeAllClass($wrap);
    addClass($wrap, className);
    var dataset = $parent.dataset;
    var formerId = dataset[CAMEL_DATASET_IDENTIFIER];
    dataset[CAMEL_DATASET_IDENTIFIER] = range.id;
    dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = dataset[CAMEL_DATASET_IDENTIFIER_EXTRA]
        ? formerId + ID_DIVISION + dataset[CAMEL_DATASET_IDENTIFIER_EXTRA]
        : formerId;
    return $wrap;
};
/**
 * wrap a dom node with highlight wrapper
 *
 * Because of supporting the highlight-overlapping,
 * Highlighter can't just wrap all nodes in a simple way.
 * There are three types:
 *  - wrapping a whole new node (without any wrapper)
 *  - wrapping part of the node
 *  - wrapping the whole wrapped node
 */
export var wrapHighlight = function (selected, range, className, wrapTag) {
    var $parent = selected.$node.parentNode;
    var $prev = selected.$node.previousSibling;
    var $next = selected.$node.nextSibling;
    var $wrap;
    // text node, not in a highlight wrapper -> should be wrapped in a highlight wrapper
    if (!isHighlightWrapNode($parent)) {
        $wrap = wrapNewNode(selected, range, className, wrapTag);
    }
    // text node, in a highlight wrap -> should split the existing highlight wrapper
    else if (isHighlightWrapNode($parent) && (!isNodeEmpty($prev) || !isNodeEmpty($next))) {
        $wrap = wrapPartialNode(selected, range, className, wrapTag);
    }
    // completely overlap (with a highlight wrap) -> only add extra id info
    else {
        $wrap = wrapOverlapNode(selected, range, className);
    }
    return $wrap;
};
/**
 * merge the adjacent text nodes
 * .normalize() API has some bugs in IE11
 */
export var normalizeSiblingText = function ($s, isNext) {
    if (isNext === void 0) { isNext = true; }
    if (!$s || $s.nodeType !== 3) {
        return;
    }
    var $sibling = isNext ? $s.nextSibling : $s.previousSibling;
    if ($sibling.nodeType !== 3) {
        return;
    }
    var text = $sibling.nodeValue;
    $s.nodeValue = isNext ? $s.nodeValue + text : text + $s.nodeValue;
    $sibling.parentNode.removeChild($sibling);
};
