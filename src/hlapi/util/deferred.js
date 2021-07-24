export default function getDeferred() {
    let resolve;
    let reject;
    const promise = new Promise((r, j) => {
        resolve = r;
        reject = j;
    });
    return {
        promise,
        resolve,
        reject,
    };
}
export const resolve = (data) => {
    const defer = getDeferred();
    defer.resolve(data);
    return defer.promise;
};
export const reject = (data) => {
    const defer = getDeferred();
    defer.reject(data);
    return defer.promise;
};
