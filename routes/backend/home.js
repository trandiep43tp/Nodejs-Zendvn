var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

const { check, validationResult } = require('express-validator/check');

var UserModel    = require("../../schemas/users");
const validate   = require("../../validates/users");

var systemConfig = require(__path_configs + 'system');
const link = '/'+ systemConfig.prefixAdmin + '/items';
 //console.log(use)

/* GET home page. */
router.get('/', function(req, res, next) { 
	let item ={email: '', password: ''}
	//khai báo người đăng nhập
	global.use = '';
  res.render('index',{ errors: [], item } );
});

router.post('/submit', validate.validator(), function(req, res, next) {
	const errors = validationResult(req);
	const item       = Object.assign(req.body); 
	console.log(item)

	if (!errors.isEmpty()) { 		
		res.render('index', { errors: errors.array(), item });
		
	}else{
		UserModel.count( item , function (err, count){ 
			if(count>0){
				//khai báo người đăng nhập
				global.use = item.email;
				res.redirect(link);
			}else{
				let item ={email: '', password: ''}
				res.render('index',{ errors: [], item } );
			}
			
		});
	}
  
 
})

module.exports = router;
