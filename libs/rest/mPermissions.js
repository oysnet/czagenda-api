var models = require('../../models'),
	statusCodes = require('../statusCodes'),
	log = require('czagenda-log').from(__filename);
	
exports.getUserPermsAndGroups = function (req, res, next) {
	
	if (typeof(req.user) === 'undefined') {
		res.statusCode = statusCodes.FORBIDDEN;
		res.end('User unknow, access forbidden.');
		log.warning('req.user is undefined, sending 403')
		return;
	}
		
	models.User.get({id:req.user}, function (err, user) {
		
		if (user.isActive === false) {
			res.statusCode = statusCodes.FORBIDDEN;
			res.end('Account disabled');
			log.notice('Account is disabled, sending 403');
			return;
		}
		
		req.user = user.serialize(['id', 'isStaff', 'isSuperuser', 'isActive']);
		req.user.groups = [];
		next();
	})
	
}


exports.staffOnly = function (req, res, next) {
	
	
	
	if (req.user.isStaff === true || req.user.isSuperuser) {
		log.debug('check staffOnly, granted');
		next();
	} else {
		log.debug('check staffOnly, forbidden');
		res.statusCode = statusCodes.FORBIDDEN;
		res.end('Insufficient privileges');
	}
		
}