/**
 * support IE 10
 */
export const unique = (arr) => {
    const res = [];
    for (const el of arr) {
        if (res.indexOf(el) === -1) {
            res.push(el);
        }
    }
    return res;
};
