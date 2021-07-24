/**
 * HighlightSource Class (HSource)
 * This Object can be deSerialized to HRange.
 * Also it has the ability for persistence.
 */
import HighlightRange from '../range/index';
import { queryElementNode, getTextChildByOffset } from './dom';
export default class HighlightSource  {
    HighlightSource(startMeta, endMeta, text, id, extra) {
        this.startMeta = startMeta;
        this.endMeta = endMeta;
        this.text = text;
        this.id = id;
        this.__isHighlightSource = {};
        if (extra) {
            this.extra = extra;
        }
    }
    deSerialize = function ($root, hooks) {
        var _a = queryElementNode(this, $root), start = _a.start, end = _a.end;
        var startInfo = getTextChildByOffset(start, this.startMeta.textOffset);
        var endInfo = getTextChildByOffset(end, this.endMeta.textOffset);
        if (!hooks.Serialize.Restore.isEmpty()) {
            var res = hooks.Serialize.Restore.call(this, startInfo, endInfo) || [];
            startInfo = res[0] || startInfo;
            endInfo = res[1] || endInfo;
        }
        var range = new HighlightRange(startInfo, endInfo, this.text, this.id, true);
        return range;
    };
}
