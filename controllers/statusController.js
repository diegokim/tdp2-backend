module.exports.ping = function (req, res) {
	 res.status(200).send({ status: 'ok' });
};
