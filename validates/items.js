
const  {check} = require('express-validator/check');

const util = require('util');    //đây là thư viện của nodejs
var notify = require("../configs/notify");

const option = {
	name    : { min: 1, max: 8 },
	ordering: {min: 1, max: 100},
	status  : { value: 'novalue' }
}
module.exports = {
	validator: () =>{
		return [
			check('name',util.format(notify.ERROR_NAME, option.name.min, option.name.max)).isLength({min: option.name.min, max: option.name.max}),
			check('ordering','Phai la so lon hon 0').isInt({gt: 0, lt: 100}),
			check('status', 'Chọn một trạng thái').not().isIn(['novalue'])
		]			
	}
};
 



            
	

