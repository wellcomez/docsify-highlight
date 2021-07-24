/**
 * the HighlightRange Class（HRange）
 * It's a special object called HRange in Highlighter,
 * represents for a piece of chosen dom
 */
import HighlightSource from '../source/index';
import { removeSelection } from './selection';
import { getDomMeta, formatDomNode } from './dom';
export default class HighlightRange {
    HighlightRange(start, end, text, id, frozen) {
        if (frozen === void 0) { frozen = false; }
        if (start.$node.nodeType !== 3 || end.$node.nodeType !== 3) {
            // eventEmitter.emit(INTERNAL_ERROR_EVENT, {
            //     type: ERROR.RANGE_NODE_INVALID,
            // });
            return
        }
        this.start = formatDomNode(start);
        this.end = formatDomNode(end);
        this.text = text;
        this.frozen = frozen;
        this.id = id;
    }
    // fromSelection = function (idHook) {
    //     var range = getDomRange();
    //     if (!range) {
    //         return null;
    //     }
    //     var start = {
    //         $node: range.startContainer,
    //         offset: range.startOffset,
    //     };
    //     var end = {
    //         $node: range.endContainer,
    //         offset: range.endOffset,
    //     };
    //     var text = range.toString();
    //     var id = idHook.call(start, end, text);
    //     id = typeof id !== 'undefined' && id !== null ? id : uuid();
    //     return new HighlightRange(start, end, text, id);
    // };
    // serialize the HRange instance
    // so that you can save the returned object (e.g. use JSON.stringify on it and send to backend)
    serialize = function ($root, hooks) {
        var startMeta = getDomMeta(this.start.$node, this.start.offset, $root);
        var endMeta = getDomMeta(this.end.$node, this.end.offset, $root);
        var extra;
        if (!hooks.Serialize.RecordInfo.isEmpty()) {
            extra = hooks.Serialize.RecordInfo.call(this.start, this.end, $root);
        }
        this.frozen = true;
        return new HighlightSource(startMeta, endMeta, this.text, this.id, extra);
    };
    removeDomRange = removeSelection;
}
