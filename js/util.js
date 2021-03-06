var exports = module.exports = {};
const QRCode        = require('qrcode');

exports.generateQR = function (text) {
  const opts = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
  }
  return QRCode.toDataURL(text, opts)
}

exports.pad2Zero = function(str) {
  return String(str).padStart(2, '0')
}

exports.getFormattedDate = function  (date) {
  const year = date.getFullYear()
  const month = pad2Zero(date.getMonth() + 1) // Les mois commencent à 0
  const day = pad2Zero(date.getDate())
  return `${year}-${month}-${day}`
}

exports.addSlash = function (str) {
  return str
    .replace(/^(\d{2})$/g, '$1/')
    .replace(/^(\d{2})\/(\d{2})$/g, '$1/$2/')
    .replace(/\/\//g, '/')
}

exports.addVersion = function (version) {
  document.getElementById(
    'version',
  ).innerHTML = `${new Date().getFullYear()} - ${version}`
}
