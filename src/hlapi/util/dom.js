import { ID_DIVISION, DATASET_IDENTIFIER, CAMEL_DATASET_IDENTIFIER, CAMEL_DATASET_IDENTIFIER_EXTRA, } from './const';
/**
 * whether a wrapper node
 */
export const isHighlightWrapNode = ($node) => !!$node.dataset && !!$node.dataset[CAMEL_DATASET_IDENTIFIER];
/**
 * ===================================================================================
 * below methods (getHighlightId/getExtraHighlightId)
 * will check whether the node is inside a wrapper iteratively util reach the root node
 * if the node is not inside the root, the id must be empty
 * ====================================================================================
 */
const findAncestorWrapperInRoot = ($node, $root) => {
    let isInsideRoot = false;
    let $wrapper = null;
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
export const getHighlightId = ($node, $root) => {
    $node = findAncestorWrapperInRoot($node, $root);
    if (!$node) {
        return '';
    }
    return $node.dataset[CAMEL_DATASET_IDENTIFIER];
};
/**
 * get extra highlight id by a node
 */
export const getExtraHighlightId = ($node, $root) => {
    $node = findAncestorWrapperInRoot($node, $root);
    if (!$node) {
        return [];
    }
    return $node.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA].split(ID_DIVISION).filter(i => i);
};
/**
 * get all highlight wrapping nodes nodes from a root node
 */
export const getHighlightsByRoot = ($roots, wrapTag) => {
    if (!Array.isArray($roots)) {
        $roots = [$roots];
    }
    const $wraps = [];
    for (const $r of $roots) {
        const $list = $r.querySelectorAll(`${wrapTag}[data-${DATASET_IDENTIFIER}]`);
        // eslint-disable-next-line prefer-spread
        $wraps.push.apply($wraps, $list);
    }
    return $wraps;
};
/**
 * get all highlight wrapping nodes by highlight id from a root node
 */
export const getHighlightById = ($root, id, wrapTag) => {
    const $highlights = [];
    const reg = new RegExp(`(${id}\\${ID_DIVISION}|\\${ID_DIVISION}?${id}$)`);
    const $list = $root.querySelectorAll(`${wrapTag}[data-${DATASET_IDENTIFIER}]`);
    for (const $l of $list) {
        const $n = $l;
        const nid = $n.dataset[CAMEL_DATASET_IDENTIFIER];
        if (nid === id) {
            $highlights.push($n);
            continue;
        }
        const extraId = $n.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
        if (reg.test(extraId)) {
            $highlights.push($n);
            continue;
        }
    }
    return $highlights;
};
export const forEach = ($nodes, cb) => {
    for (let i = 0; i < $nodes.length; i++) {
        cb($nodes[i], i, $nodes);
    }
};
export const removeEventListener = ($el, evt, fn) => {
    $el.removeEventListener(evt, fn);
};
/**
 * maybe be need some polyfill methods later
 * provide unified dom methods for compatibility
 */
export const addEventListener = ($el, evt, fn) => {
    $el.addEventListener(evt, fn);
    return () => {
        removeEventListener($el, evt, fn);
    };
};
export const addClass = ($el, className) => {
    if (!Array.isArray(className)) {
        className = [className];
    }
    $el.classList.add(...className);
};
export const removeClass = ($el, className) => {
    $el.classList.remove(className);
};
export const removeAllClass = ($el) => {
    $el.className = '';
};
export const hasClass = ($el, className) => $el.classList.contains(className);
