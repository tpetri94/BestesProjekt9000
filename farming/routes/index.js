var express = require('express');
var router = express.Router();
var Cloudant = require('cloudant');

var me = '24919f5e-53bd-45ca-90f2-e3ae3f051c41-bluemix'; // Set this to your own account
var password = "db76626130ea3e6d55b931bc0ab914ce303d1863a71b4bc0cbfd5d8725d87ae6";
// Initialize the library with my account.
var cloudant = Cloudant({account:me, password:password});
var db = cloudant.db.use("users");

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('start', { title: 'Express' });
});

router.get('/main', function(req, res, next) {
	res.render('main', { title: 'Express' });
});

router.post('/userdata', function(req, res, next) {
	db.insert(req.body);
});

module.exports = router;