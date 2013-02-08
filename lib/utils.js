
module.exports.isUuid = function (uuid) {
	return typeof uuid === 'string' &&
		/[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[89ab][0-9a-f]{3}\-[0-9a-f]{12}/.test(uuid.toLowerCase())
}
