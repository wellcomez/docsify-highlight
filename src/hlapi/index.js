{
    DomNode, DomMeta, HookMap, HighlighterOptions;
}
import EventEmitter from './util/event.emitter';
import HighlightRange from './model/range';
import HighlightSource from './model/source';
import uuid from './util/uuid';
import Hook from './util/hook';
import getInteraction from './util/interaction';
import Cache from './data/cache';
import Painter from './painter';
import { eventEmitter, getDefaultOptions, INTERNAL_ERROR_EVENT } from './util/const';
import { ERROR, EventType, CreateFrom } from './types';
import { addClass, removeClass, isHighlightWrapNode, getHighlightById, getExtraHighlightId, getHighlightsByRoot, getHighlightId, addEventListener, removeEventListener, } from './util/dom';
export default class Highlighter extends EventEmitter {
    constructor(options) {
        super();
        this.event = getInteraction();
        this.run = () => addEventListener(this.options.$root, this.event.PointerEnd, this._handleSelection);
        this.stop = () => {
            removeEventListener(this.options.$root, this.event.PointerEnd, this._handleSelection);
        };
        this.addClass = (className, id) => {
            this.getDoms(id).forEach($n => {
                addClass($n, className);
            });
        };
        this.removeClass = (className, id) => {
            this.getDoms(id).forEach($n => {
                removeClass($n, className);
            });
        };
        this.getIdByDom = ($node) => getHighlightId($node, this.options.$root);
        this.getExtraIdByDom = ($node) => getExtraHighlightId($node, this.options.$root);
        this.getDoms = (id) => id
            ? getHighlightById(this.options.$root, id, this.options.wrapTag)
            : getHighlightsByRoot(this.options.$root, this.options.wrapTag);
        this.dispose = () => {
            const $root = this.options.$root;
            removeEventListener($root, this.event.PointerOver, this._handleHighlightHover);
            removeEventListener($root, this.event.PointerEnd, this._handleSelection);
            removeEventListener($root, this.event.PointerTap, this._handleHighlightClick);
            this.removeAll();
        };
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
            let id = this.hooks.Render.UUID.call(start, end, text);
            id = typeof id !== 'undefined' && id !== null ? id : uuid();
            const hRange = new HighlightRange(start, end, text, id);
            if (!hRange) {
                eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                    type: ERROR.RANGE_INVALID,
                });
                return null;
            }
            return this._highlightFromHRange(hRange);
        };
        this.fromStore = (start, end, text, id, extra) => {
            const hs = new HighlightSource(start, end, text, id, extra);
            try {
                this._highlightFromHSource(hs);
                return hs;
            }
            catch (err) {
                eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                    type: ERROR.HIGHLIGHT_SOURCE_RECREATE,
                    error: err,
                    detail: hs,
                });
                return null;
            }
        };
        this._getHooks = () => ({
            Render: {
                UUID: new Hook('Render.UUID'),
                SelectedNodes: new Hook('Render.SelectedNodes'),
                WrapNode: new Hook('Render.WrapNode'),
            },
            Serialize: {
                Restore: new Hook('Serialize.Restore'),
                RecordInfo: new Hook('Serialize.RecordInfo'),
            },
            Remove: {
                UpdateNodes: new Hook('Remove.UpdateNodes'),
            },
        });
        this._highlightFromHRange = (range) => {
            const source = range.serialize(this.options.$root, this.hooks);
            const $wraps = this.painter.highlightRange(range);
            if ($wraps.length === 0) {
                eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                    type: ERROR.DOM_SELECTION_EMPTY,
                });
                return null;
            }
            this.cache.save(source);
            this.emit(EventType.CREATE, { sources: [source], type: CreateFrom.INPUT }, this);
            return source;
        };
        this._handleSelection = () => {
            const range = HighlightRange.fromSelection(this.hooks.Render.UUID);
            if (range) {
                this._highlightFromHRange(range);
                HighlightRange.removeDomRange();
            }
        };
        this._handleHighlightHover = (e) => {
            const $target = e.target;
            if (!isHighlightWrapNode($target)) {
                this._hoverId && this.emit(EventType.HOVER_OUT, { id: this._hoverId }, this, e);
                this._hoverId = null;
                return;
            }
            const id = getHighlightId($target, this.options.$root);
            // prevent trigger in the same highlight range
            if (this._hoverId === id) {
                return;
            }
            // hover another highlight range, need to trigger previous highlight hover out event
            if (this._hoverId) {
                this.emit(EventType.HOVER_OUT, { id: this._hoverId }, this, e);
            }
            this._hoverId = id;
            this.emit(EventType.HOVER, { id: this._hoverId }, this, e);
        };
        this._handleError = (type) => {
            if (this.options.verbose) {
                // eslint-disable-next-line no-console
                console.warn(type);
            }
        };
        this._handleHighlightClick = (e) => {
            const $target = e.target;
            if (isHighlightWrapNode($target)) {
                const id = getHighlightId($target, this.options.$root);
                this.emit(EventType.CLICK, { id }, this, e);
            }
        };
        this.options = getDefaultOptions();
        // initialize hooks
        this.hooks = this._getHooks();
        this.setOption(options);
        // initialize cache
        this.cache = new Cache();
        const $root = this.options.$root;
        // initialize event listener
        addEventListener($root, this.event.PointerOver, this._handleHighlightHover);
        // initialize event listener
        addEventListener($root, this.event.PointerTap, this._handleHighlightClick);
        eventEmitter.on(INTERNAL_ERROR_EVENT, this._handleError);
    }
    remove(id) {
        if (!id) {
            return;
        }
        const doseExist = this.painter.removeHighlight(id);
        this.cache.remove(id);
        // only emit REMOVE event when highlight exist
        if (doseExist) {
            this.emit(EventType.REMOVE, { ids: [id] }, this);
        }
    }
    removeAll() {
        this.painter.removeAllHighlight();
        const ids = this.cache.removeAll();
        this.emit(EventType.REMOVE, { ids }, this);
    }
    _highlightFromHSource(sources = []) {
        const renderedSources = this.painter.highlightSource(sources);
        this.emit(EventType.CREATE, { sources: renderedSources, type: CreateFrom.STORE }, this);
        this.cache.save(sources);
    }
}
Highlighter.event = EventType;
Highlighter.isHighlightWrapNode = isHighlightWrapNode;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
Highlighter.isHighlightSource = (d) => !!d.__isHighlightSource;
