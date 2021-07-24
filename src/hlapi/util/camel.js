/**
 * convert dash-joined string to camel case
 */
export default (function (a) {
    return a.split('-').reduce(function (str, s, idx) { return str + (idx === 0 ? s : s[0].toUpperCase() + s.slice(1)); }, '');
});
