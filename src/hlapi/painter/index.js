/**
 * Painter object is designed for some painting work about higlighting,
 * including rendering, cleaning...
 * No need to instantiate repeatly. A Highlighter instance will bind a Painter instance.
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
from;
'@src/model/range';
{
    PainterOptions, HookMap;
}
from;
'@src/types';
import HighlightSource from '@src/model/source';
import { wrapHighlight, getSelectedNodes, normalizeSiblingText } from '@src/painter/dom';
import { getHighlightsByRoot, forEach, addClass, removeAllClass } from '@src/util/dom';
import { ERROR } from '@src/types';
import { initDefaultStylesheet } from '@src/painter/style';
import { ID_DIVISION, eventEmitter, DATASET_IDENTIFIER, INTERNAL_ERROR_EVENT, CAMEL_DATASET_IDENTIFIER, CAMEL_DATASET_IDENTIFIER_EXTRA, } from '@src/util/const';
var Painter = /** @class */ (function () {
    function Painter(options, hooks) {
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
    Painter.prototype.highlightRange = function (range) {
        var _this = this;
        if (!range.frozen) {
            throw ERROR.HIGHLIGHT_RANGE_FROZEN;
        }
        var _a = this.options, $root = _a.$root, className = _a.className, exceptSelectors = _a.exceptSelectors;
        var hooks = this.hooks;
        var $selectedNodes = getSelectedNodes($root, range.start, range.end, exceptSelectors);
        if (!hooks.Render.SelectedNodes.isEmpty()) {
            $selectedNodes = hooks.Render.SelectedNodes.call(range.id, $selectedNodes) || [];
        }
        return $selectedNodes.map(function (n) {
            var $node = wrapHighlight(n, range, className, _this.options.wrapTag);
            if (!hooks.Render.WrapNode.isEmpty()) {
                $node = hooks.Render.WrapNode.call(range.id, $node);
            }
            return $node;
        });
    };
    Painter.prototype.highlightSource = function (sources) {
        var _this = this;
        var list = Array.isArray(sources) ? sources : [sources];
        var renderedSources = [];
        list.forEach(function (s) {
            if (!(s instanceof HighlightSource)) {
                eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                    type: ERROR.SOURCE_TYPE_ERROR,
                });
                return;
            }
            var range = s.deSerialize(_this.options.$root, _this.hooks);
            var $nodes = _this.highlightRange(range);
            if ($nodes.length > 0) {
                renderedSources.push(s);
            }
            else {
                eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                    type: ERROR.HIGHLIGHT_SOURCE_NONE_RENDER,
                    detail: s,
                });
            }
        });
        return renderedSources;
    };
    /* ============================================================== */
    /* =========================== clean =========================== */
    // id: target id - highlight with this id should be clean
    // if there is no highlight for this id, it will return false, vice versa
    Painter.prototype.removeHighlight = function (id) {
        // whether extra ids contains the target id
        var reg = new RegExp("(" + id + "\\" + ID_DIVISION + "|\\" + ID_DIVISION + "?" + id + "$)");
        var hooks = this.hooks;
        var wrapTag = this.options.wrapTag;
        var $spans = document.querySelectorAll(wrapTag + "[data-" + DATASET_IDENTIFIER + "]");
        // nodes to remove
        var $toRemove = [];
        // nodes to update main id
        var $idToUpdate = [];
        // nodes to update extra id
        var $extraToUpdate = [];
        for (var _i = 0, $spans_1 = $spans; _i < $spans_1.length; _i++) {
            var $s = $spans_1[_i];
            var spanId = $s.dataset[CAMEL_DATASET_IDENTIFIER];
            var spanExtraIds = $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
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
        $toRemove.forEach(function ($s) {
            var $parent = $s.parentNode;
            var $fr = document.createDocumentFragment();
            forEach($s.childNodes, function ($c) { return $fr.appendChild($c.cloneNode(false)); });
            var $prev = $s.previousSibling;
            var $next = $s.nextSibling;
            $parent.replaceChild($fr, $s);
            // there are bugs in IE11, so use a more reliable function
            normalizeSiblingText($prev, true);
            normalizeSiblingText($next, false);
            hooks.Remove.UpdateNodes.call(id, $s, 'remove');
        });
        $idToUpdate.forEach(function ($s) {
            var dataset = $s.dataset;
            var ids = dataset[CAMEL_DATASET_IDENTIFIER_EXTRA].split(ID_DIVISION);
            var newId = ids.shift();
            // find overlapped wrapper associated with "extra id"
            var $overlapSpan = document.querySelector(wrapTag + "[data-" + DATASET_IDENTIFIER + "=\"" + newId + "\"]");
            if ($overlapSpan) {
                // empty the current class list
                removeAllClass($s);
                // retain the class list of the overlapped wrapper which associated with "extra id"
                addClass($s, __spreadArrays($overlapSpan.classList));
            }
            dataset[CAMEL_DATASET_IDENTIFIER] = newId;
            dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = ids.join(ID_DIVISION);
            hooks.Remove.UpdateNodes.call(id, $s, 'id-update');
        });
        $extraToUpdate.forEach(function ($s) {
            var extraIds = $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
            $s.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA] = extraIds.replace(reg, '');
            hooks.Remove.UpdateNodes.call(id, $s, 'extra-update');
        });
        return $toRemove.length + $idToUpdate.length + $extraToUpdate.length !== 0;
    };
    Painter.prototype.removeAllHighlight = function () {
        var _a = this.options, wrapTag = _a.wrapTag, $root = _a.$root;
        var $spans = getHighlightsByRoot($root, wrapTag);
        $spans.forEach(function ($s) {
            var $parent = $s.parentNode;
            var $fr = document.createDocumentFragment();
            forEach($s.childNodes, function ($c) { return $fr.appendChild($c.cloneNode(false)); });
            $parent.replaceChild($fr, $s);
        });
    };
    return Painter;
}());
export default Painter;
