
const  {check} = require('express-validator/check');

const util = require('util');    //đây là thư viện của nodejs vào https://nodejs.org/dist/latest-v10.x/docs/api/util.html#util_util_format_format_args
var notify = require("../configs/notify");

const option = {	
	password: {min: 1, max: 100},	
}


module.exports = {
	validator: () =>{
		return [
			check('email','Email chưa đúng!').isEmail(),
			check('password','Phải từ 5 ký tự!').isLength({min: 5})
			
		]			
	}
};
 



            
	

