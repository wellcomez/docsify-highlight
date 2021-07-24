/**
 * inject styles
 */
import { STYLESHEET_ID, getStylesheet } from '@src/util/const';
export var initDefaultStylesheet = function () {
    var styleId = STYLESHEET_ID;
    var $style = document.getElementById(styleId);
    if (!$style) {
        var $cssNode = document.createTextNode(getStylesheet());
        $style = document.createElement('style');
        $style.id = styleId;
        $style.appendChild($cssNode);
        document.head.appendChild($style);
    }
    return $style;
};
