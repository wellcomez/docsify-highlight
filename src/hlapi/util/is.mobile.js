/**
 * is mobile device?
 */
var regMobile = /Android|iPhone|BlackBerry|BB10|Opera Mini|Phone|Mobile|Silk|Windows Phone|Mobile(?:.+)Firefox\b/i;
export default (function (userAgent) { return regMobile.test(userAgent); });
