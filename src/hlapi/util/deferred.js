export default function getDeferred() {
    var resolve;
    var reject;
    var promise = new Promise(function (r, j) {
        resolve = r;
        reject = j;
    });
    return {
        promise: promise,
        resolve: resolve,
        reject: reject,
    };
}
export var resolve = function (data) {
    var defer = getDeferred();
    defer.resolve(data);
    return defer.promise;
};
export var reject = function (data) {
    var defer = getDeferred();
    defer.reject(data);
    return defer.promise;
};
