/**
 * all constants
 * cSpell:ignore mengshou
 */
// var __extends = (this && this.__extends) || (function () {
//     var extendStatics = function (d, b) {
//         extendStatics = Object.setPrototypeOf ||
//             ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
//             function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
//         return extendStatics(d, b);
//     };
//     return function (d, b) {
//         extendStatics(d, b);
//         function __() { this.constructor = d; }
//         d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
//     };
// })();
// from;
// '@src/hlapi/model/source';
// {
//     ERROR;
// }
// from;
// '@src/hlapi/types';
import camel from './camel';
// import EventEmitter from '@src/hlapi/util/event.emitter';
export var ID_DIVISION = ';';
export var LOCAL_STORE_KEY = 'highlight-mengshou';
export var STYLESHEET_ID = 'highlight-mengshou-style';
export var DATASET_IDENTIFIER = 'highlight-id';
export var DATASET_IDENTIFIER_EXTRA = 'highlight-id-extra';
export var DATASET_SPLIT_TYPE = 'highlight-split-type';
export var CAMEL_DATASET_IDENTIFIER = camel(DATASET_IDENTIFIER);
export var CAMEL_DATASET_IDENTIFIER_EXTRA = camel(DATASET_IDENTIFIER_EXTRA);
export var CAMEL_DATASET_SPLIT_TYPE = camel(DATASET_SPLIT_TYPE);
var DEFAULT_WRAP_TAG = 'span';
export var getDefaultOptions = function () { return ({
    $root: document || document.documentElement,
    exceptSelectors: null,
    wrapTag: DEFAULT_WRAP_TAG,
    verbose: false,
    style: {
        className: 'highlight-mengshou-wrap',
    },
}); };
export var getStylesheet = function () { return "\n    ." + getDefaultOptions().style.className + " {\n        background: #ff9;\n        cursor: pointer;\n    }\n    ." + getDefaultOptions().style.className + ".active {\n        background: #ffb;\n    }\n"; };
export var ROOT_IDX = -2;
export var UNKNOWN_IDX = -1;
export var INTERNAL_ERROR_EVENT = 'error';
// var ErrorEventEmitter = /** @class */ (function (_super) {
//     __extends(ErrorEventEmitter, _super);
//     function ErrorEventEmitter() {
//         return _super !== null && _super.apply(this, arguments) || this;
//     }
//     return ErrorEventEmitter;
// }(EventEmitter));
// export var eventEmitter = new ErrorEventEmitter();
