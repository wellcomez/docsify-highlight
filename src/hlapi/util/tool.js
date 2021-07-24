/**
 * support IE 10
 */
export var unique = function (arr) {
    var res = [];
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var el = arr_1[_i];
        if (res.indexOf(el) === -1) {
            res.push(el);
        }
    }
    return res;
};
