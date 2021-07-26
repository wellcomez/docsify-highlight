import HighlightRange from './model/range';
import HighlightSource from './model/source';
import uuid from './util/uuid';
import Painter from './painter';
import { getDefaultOptions } from './util/const';
import { EventType, CreateFrom } from './types';
import { isHighlightWrapNode, getHighlightById, getExtraHighlightId, getHighlightsByRoot, getHighlightId, } from './util/dom';
export {
    isHighlightWrapNode ,HighlightSource
}
export default class Highlighter2 {
    constructor(options) {
        this.getIdByDom = ($node) => getHighlightId($node, this.options.$root);
        this.getExtraIdByDom = ($node) => getExtraHighlightId($node, this.options.$root);
        this.getDoms = (id) => id
            ? getHighlightById(this.options.$root, id, this.options.wrapTag)
            : getHighlightsByRoot(this.options.$root, this.options.wrapTag);
        this.setOption = (options) => {
            this.options = Object.assign(Object.assign({}, this.options), options);
            this.painter = new Painter({
                $root: this.options.$root,
                wrapTag: this.options.wrapTag,
                className: this.options.style.className,
                exceptSelectors: this.options.exceptSelectors,
            }, this.hooks);
        };
        this.fromRange = (range) => {
            const start = {
                $node: range.startContainer,
                offset: range.startOffset,
            };
            const end = {
                $node: range.endContainer,
                offset: range.endOffset,
            };
            const text = range.toString();
            let id =  uuid()
            const hRange = new HighlightRange(start, end, text, id);
            if (!hRange) {
                // eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                //     type: ERROR.RANGE_INVALID,
                // });
                return null;
            }
            return this._highlightFromHRange(hRange);
        };
        this.fromStore = (start, end, text, id, extra) => {
            const hs = new HighlightSource(start, end, text, id, extra);
            try {
                let renderedSources = this._highlightFromHSource(hs);
                return {hs,renderedSources};
            }
            catch (err) {
                return {};
            }
        };
        this._highlightFromHRange = (range) => {
            const source = range.serialize(this.options.$root, this.hooks);
            const $wraps = this.painter.highlightRange(range);
            if ($wraps.length === 0) {
                // eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                //     type: ERROR.DOM_SELECTION_EMPTY,
                // });
                return null;
            }
            this.cache.save(source);
            this.emit(EventType.CREATE, { sources: [source], type: CreateFrom.INPUT }, this);
            return source;
        };
        this.options = getDefaultOptions();
        this.setOption(options);
    }
    _highlightFromHSource(sources = []) {
        const renderedSources = this.painter.highlightSource(sources);
        return renderedSources
        // this.emit(EventType.CREATE, { sources: renderedSources, type: CreateFrom.STORE }, this);
        // this.cache.save(sources);
    }
}
