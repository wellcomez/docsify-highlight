/**
 * is mobile device?
 */
const regMobile = /Android|iPhone|BlackBerry|BB10|Opera Mini|Phone|Mobile|Silk|Windows Phone|Mobile(?:.+)Firefox\b/i;
export default (userAgent) => regMobile.test(userAgent);
