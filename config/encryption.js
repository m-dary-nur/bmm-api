const CryptoJS = require('crypto-js')


const key = 'muhammadevanozaflanalfarezel'

exports.enc = text => CryptoJS.Rabbit.encrypt(text, key).toString()

exports.dec = text => {
	var bytes = CryptoJS.Rabbit.decrypt(text, key)
	return bytes.toString(CryptoJS.enc.Utf8)
}
