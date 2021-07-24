import { ID_DIVISION, DATASET_IDENTIFIER, CAMEL_DATASET_IDENTIFIER, CAMEL_DATASET_IDENTIFIER_EXTRA, } from './const';
/**
 * whether a wrapper node
 */
export var isHighlightWrapNode = function ($node) {
    return !!$node.dataset && !!$node.dataset[CAMEL_DATASET_IDENTIFIER];
};
/**
 * ===================================================================================
 * below methods (getHighlightId/getExtraHighlightId)
 * will check whether the node is inside a wrapper iteratively util reach the root node
 * if the node is not inside the root, the id must be empty
 * ====================================================================================
 */
var findAncestorWrapperInRoot = function ($node, $root) {
    var isInsideRoot = false;
    var $wrapper = null;
    while ($node) {
        if (isHighlightWrapNode($node)) {
            $wrapper = $node;
        }
        if ($node === $root) {
            isInsideRoot = true;
            break;
        }
        $node = $node.parentNode;
    }
    return isInsideRoot ? $wrapper : null;
};
/**
 * get highlight id by a node
 */
export var getHighlightId = function ($node, $root) {
    $node = findAncestorWrapperInRoot($node, $root);
    if (!$node) {
        return '';
    }
    return $node.dataset[CAMEL_DATASET_IDENTIFIER];
};
/**
 * get extra highlight id by a node
 */
export var getExtraHighlightId = function ($node, $root) {
    $node = findAncestorWrapperInRoot($node, $root);
    if (!$node) {
        return [];
    }
    return $node.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA].split(ID_DIVISION).filter(function (i) { return i; });
};
/**
 * get all highlight wrapping nodes nodes from a root node
 */
export var getHighlightsByRoot = function ($roots, wrapTag) {
    if (!Array.isArray($roots)) {
        $roots = [$roots];
    }
    var $wraps = [];
    for (var _i = 0, $roots_1 = $roots; _i < $roots_1.length; _i++) {
        var $r = $roots_1[_i];
        var $list = $r.querySelectorAll(wrapTag + "[data-" + DATASET_IDENTIFIER + "]");
        // eslint-disable-next-line prefer-spread
        $wraps.push.apply($wraps, $list);
    }
    return $wraps;
};
/**
 * get all highlight wrapping nodes by highlight id from a root node
 */
export var getHighlightById = function ($root, id, wrapTag) {
    var $highlights = [];
    var reg = new RegExp("(" + id + "\\" + ID_DIVISION + "|\\" + ID_DIVISION + "?" + id + "$)");
    var $list = $root.querySelectorAll(wrapTag + "[data-" + DATASET_IDENTIFIER + "]");
    for (var _i = 0, $list_1 = $list; _i < $list_1.length; _i++) {
        var $l = $list_1[_i];
        var $n = $l;
        var nid = $n.dataset[CAMEL_DATASET_IDENTIFIER];
        if (nid === id) {
            $highlights.push($n);
            continue;
        }
        var extraId = $n.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
        if (reg.test(extraId)) {
            $highlights.push($n);
            continue;
        }
    }
    return $highlights;
};
export var forEach = function ($nodes, cb) {
    for (var i = 0; i < $nodes.length; i++) {
        cb($nodes[i], i, $nodes);
    }
};
export var removeEventListener = function ($el, evt, fn) {
    $el.removeEventListener(evt, fn);
};
/**
 * maybe be need some polyfill methods later
 * provide unified dom methods for compatibility
 */
export var addEventListener = function ($el, evt, fn) {
    $el.addEventListener(evt, fn);
    return function () {
        removeEventListener($el, evt, fn);
    };
};
export var addClass = function ($el, className) {
    var _a;
    if (!Array.isArray(className)) {
        className = [className];
    }
    (_a = $el.classList).add.apply(_a, className);
};
export var removeClass = function ($el, className) {
    $el.classList.remove(className);
};
export var removeAllClass = function ($el) {
    $el.className = '';
};
export var hasClass = function ($el, className) { return $el.classList.contains(className); };
