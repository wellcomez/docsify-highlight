/**
 * Painter object is designed for some painting work about higlighting,
 * including rendering, cleaning...
 * No need to instantiate repeatly. A Highlighter instance will bind a Painter instance.
 */
import HighlightSource from '../model/source';
// eslint-disable-next-line no-unused-vars
import { wrapHighlight, getSelectedNodes, normalizeSiblingText } from '../painter/dom';
import { getHighlightsByRoot, forEach, addClass, removeAllClass } from '../util/dom';
import { ERROR } from '../types';
import { initDefaultStylesheet } from '../painter/style';
import { ID_DIVISION,  DATASET_IDENTIFIER, CAMEL_DATASET_IDENTIFIER, CAMEL_DATASET_IDENTIFIER_EXTRA, } from '../util/const';
export default class Painter {
    constructor(options, hooks) {
        this.options = {
            $root: options.$root,
            wrapTag: options.wrapTag,
            exceptSelectors: options.exceptSelectors,
            className: options.className,
        };
        this.hooks = hooks;
        initDefaultStylesheet();
    }
    /* =========================== render =========================== */
    highlightRange(range) {
        if (!range.frozen) {
            throw ERROR.HIGHLIGHT_RANGE_FROZEN;
        }
        const { $root, exceptSelectors } = this.options;
        // const hooks = this.hooks;
        let $selectedNodes = getSelectedNodes($root, range.start, range.end, exceptSelectors);
        // // if (!hooks.Render.SelectedNodes.isEmpty()) {
        // //     $selectedNodes = hooks.Render.SelectedNodes.call(range.id, $selectedNodes) || [];
        // }
        // return $selectedNodes.map(n => {
        //     let $node = wrapHighlight(n, range, className, this.options.wrapTag);
        //     // if (!hooks.Render.WrapNode.isEmpty()) {
        //     //     $node = hooks.Render.WrapNode.call(range.id, $node);
        //     // }
        //     return $node;
        // });
        return $selectedNodes
    }
    highlightSource(sources) {
        const list = Array.isArray(sources) ? sources : [sources];
        const renderedSources = [];
        list.forEach(s => {
            if (!(s instanceof HighlightSource)) {
                // eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                //     type: ERROR.SOURCE_TYPE_ERROR,
                // });
                return;
            }
            const range = s.deSerialize(this.options.$root, this.hooks);
            const $nodes = this.highlightRange(range);
            if ($nodes.length > 0) {
                renderedSources.push(s);
            }
            else {
                // eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                //     type: ERROR.HIGHLIGHT_SOURCE_NONE_RENDER,
                //     detail: s,
                // });
            }
        });
        return renderedSources;
    }
    /* ============================================================== */
    /* =========================== clean =========================== */
    // id: target id - highlight with this id should be clean
    // if there is no highlight for this id, it will return false, vice versa
    removeHighlight(id) {
        // whether extra ids contains the target id
        const reg = new RegExp(`(${id}\\${ID_DIVISION}|\\${ID_DIVISION}?${id}$)`);
        const hooks = this.hooks;
        const wrapTag = this.options.wrapTag;
        const $spans = document.querySelectorAll(`${wrapTag}[data-${DATASET_IDENTIFIER}]`);
        // nodes to remove
        const $toRemove = [];
        // nodes to update main id
        const $idToUpdate = [];
        // nodes to update extra id
        const $extraToUpdate = [];
        for (const $s of $spans) {
            const spanId = $s.dataset[CAMEL_DATASET_IDENTIFIER];
            const spanExtraIds = $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
            // main id is the target id and no extra ids --> to remove
            if (spanId === id && !spanExtraIds) {
                $toRemove.push($s);
            }
            // main id is the target id but there is some extra ids -> update main id & extra id
            else if (spanId === id) {
                $idToUpdate.push($s);
            }
            // main id isn't the target id but extra ids contains it -> just remove it from extra id
            else if (spanId !== id && reg.test(spanExtraIds)) {
                $extraToUpdate.push($s);
            }
        }
        $toRemove.forEach($s => {
            const $parent = $s.parentNode;
            const $fr = document.createDocumentFragment();
            forEach($s.childNodes, ($c) => $fr.appendChild($c.cloneNode(false)));
            const $prev = $s.previousSibling;
            const $next = $s.nextSibling;
            $parent.replaceChild($fr, $s);
            // there are bugs in IE11, so use a more reliable function
            normalizeSiblingText($prev, true);
            normalizeSiblingText($next, false);
            hooks.Remove.UpdateNodes.call(id, $s, 'remove');
        });
        $idToUpdate.forEach($s => {
            const dataset = $s.dataset;
            const ids = dataset[CAMEL_DATASET_IDENTIFIER_EXTRA].split(ID_DIVISION);
            const newId = ids.shift();
            // find overlapped wrapper associated with "extra id"
            const $overlapSpan = document.querySelector(`${wrapTag}[data-${DATASET_IDENTIFIER}="${newId}"]`);
            if ($overlapSpan) {
                // empty the current class list
                removeAllClass($s);
                // retain the class list of the overlapped wrapper which associated with "extra id"
                addClass($s, [...$overlapSpan.classList]);
            }
            dataset[CAMEL_DATASET_IDENTIFIER] = newId;
            dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = ids.join(ID_DIVISION);
            hooks.Remove.UpdateNodes.call(id, $s, 'id-update');
        });
        $extraToUpdate.forEach($s => {
            const extraIds = $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
            $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = extraIds.replace(reg, '');
            hooks.Remove.UpdateNodes.call(id, $s, 'extra-update');
        });
        return $toRemove.length + $idToUpdate.length + $extraToUpdate.length !== 0;
    }
    removeAllHighlight() {
        const { wrapTag, $root } = this.options;
        const $spans = getHighlightsByRoot($root, wrapTag);
        $spans.forEach($s => {
            const $parent = $s.parentNode;
            const $fr = document.createDocumentFragment();
            forEach($s.childNodes, ($c) => $fr.appendChild($c.cloneNode(false)));
            $parent.replaceChild($fr, $s);
        });
    }
}
