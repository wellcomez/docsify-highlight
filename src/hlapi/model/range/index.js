/**
 * the HighlightRange Class（HRange）
 * It's a special object called HRange in Highlighter,
 * represents for a piece of chosen dom
 */
 import HighlightSource from '../source/index';
 import { removeSelection } from './selection';
 import { getDomMeta, formatDomNode } from './dom'
class HighlightRange {
    constructor(start, end, text, id, frozen = false) {
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
    // static fromSelection(idHook) {
    //     const range = getDomRange();
    //     if (!range) {
    //         return null;
    //     }
    //     const start = {
    //         $node: range.startContainer,
    //         offset: range.startOffset,
    //     };
    //     const end = {
    //         $node: range.endContainer,
    //         offset: range.endOffset,
    //     };
    //     const text = range.toString();
    //     let id = idHook.call(start, end, text);
    //     id = typeof id !== 'undefined' && id !== null ? id : uuid();
    //     return new HighlightRange(start, end, text, id);
    // }
    // serialize the HRange instance
    // so that you can save the returned object (e.g. use JSON.stringify on it and send to backend)
    getMeta($root){
        const startMeta = getDomMeta(this.start.$node, this.start.offset, $root);
        const endMeta = getDomMeta(this.end.$node, this.end.offset, $root);
        return {startMeta,endMeta};
    }
    serialize($root) {
        const startMeta = getDomMeta(this.start.$node, this.start.offset, $root);
        const endMeta = getDomMeta(this.end.$node, this.end.offset, $root);
        let extra;
        // if (!hooks.Serialize.RecordInfo.isEmpty()) {
        //     extra = hooks.Serialize.RecordInfo.call(this.start, this.end, $root);
        // }
        this.frozen = true;
        return new HighlightSource(startMeta, endMeta, this.text, this.id, extra);
    }
}
HighlightRange.removeDomRange = removeSelection;
export default HighlightRange;
