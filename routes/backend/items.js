var express = require('express');
var router = express.Router();
const util = require('util');    //đây là thư viện của nodejs

const { check, validationResult } = require('express-validator/check');

var ItemModel    = require("../../schemas/items");
var UtilsHelper  = require("../helpers/utils");
var ParamsHelper = require("../helpers/params");	

var systemConfig = require(__path_configs + 'system');
var notify       = require(__path_configs + 'notify');
const validate   = require("../../validates/items");

const link = '/'+ systemConfig.prefixAdmin + '/items';



router.get('(/:status)?',async (req, res, next)=> {     //(/:status)? đây là những ký hiệu trong regularexpression nghã là có cũng được, không có cũng đươcj
	//kiểm tra xem có người đăng nhập không, nếu không  có quay lại trang chủ
	if(use === ''){
		res.redirect('/admin')
	}
	//tạo một đối tượng
	let objWhere ={};
	//lấy trạng thái được nhấn
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'all');
	//console.log(currentStatus)
	//lấy điều kiện lọc		
	 objWhere      = (currentStatus === "all" )? {} : {status: currentStatus};

	//lấy query khi nhấn search
	let query = ParamsHelper.getParams(req.query, 'search', '');  //search là tên được đặt trong input search	
	if(query !== ''){
		objWhere.name = new RegExp(query, 'i');   //RegExp(query, 'i') tìm kiếm không phân biệt các chữ hoa, thường
	}
	//in ra các trạng thái filter	
	let statusFilter  = await UtilsHelper.createFilterStatus(currentStatus);


	//phân trang
	let pagination ={
		totalItems : 0,
		totalItemsperPage: 4,
		currentPage		 : 1,
		pageRanges       : 3,    //để cấu hình khi có quá nhiều trang
	}

	
	// lấy số trang hiện tại
	pagination.currentPage =  parseInt(ParamsHelper.getParams(req.query, 'page', 1));

	//đếm tỏng số bản ghi
	await ItemModel.count(objWhere).then((data)=>{
			pagination.totalItems = data;		  
		 })
	//console.log(pagination.totalItems)

	//lấy dữ liệu 	
	ItemModel
		.find(objWhere)
		.sort({ordering: 'asc'})  //sắp xếp theo thứ tự
		.skip((pagination.currentPage - 1)*pagination.totalItemsperPage)   //lấy từ vị trí
		.limit(pagination.totalItemsperPage)
		.then((items)=> {
			res.render('pages/items/list', { 
				title: 'Item List page',
				items,
				statusFilter,
				currentStatus,
				query,
				pagination		
			});
		}); 

});

//thay đổi trạng thái status
router.get('/change-status/:id/:status', function(req, res, next) {
	//console.log(req.params)
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'active');
	let id            = ParamsHelper.getParams(req.params, 'id', '');
	let status = (currentStatus === 'active')? 'inactive' : 'active';	
	//update cách 1
	 ItemModel.updateOne({_id: id}, {status: status}, (err, result)=>{
		 req.flash('success', notify.CHANGE_STATUS_SUSCCESS , false); //khi k cần render thì để false
		 res.redirect(link);
	 })
});


//change status muti
router.post('/change-status/:status', function(req, res, next) {
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'active');
	let items = req.body.cid;  //cid là tên đặt ở ô input bên layout
	
	ItemModel.updateMany({_id: {$in: items}}, {status: currentStatus}, (err, result)=>{
		req.flash('success', util.format(notify.CHANGE_STATUS_MUTI_SUSCCESS, result.n ) , false);
		res.redirect(link);
	})
	
});

//change ordering
router.post('/change-ordering/', function(req, res, next) {
		let ids     = req.body.cid;
		let ordering = req.body.ordering;
		
		if(Array.isArray(ids)){
			ids.forEach( (id, index) =>{
				ItemModel.updateOne({_id: id}, {ordering: parseInt(ordering[index])}, (err, result)=>{
					
				});   
			})
			req.flash('success', util.format( notify.CHANGE_ORDERING_MUTI_SUSCCESS,ids.length ), false);
			res.redirect(link);
		}else{
			ItemModel.updateOne({_id: ids}, {ordering: parseInt(ordering)}, (err, result)=>{
				req.flash('success', notify.CHANGE_ORDERING_SUSCCESS, false);
				res.redirect(link);
			})
		}
	
	
});

//khi nhấn delete
router.get('/delete/:id', function(req, res, next) {	

	let id  = ParamsHelper.getParams(req.params, 'id', '');
	ItemModel.deleteOne({_id: id},  (err)=>{
		req.flash('success', notify.DELETE_SUSCCESS, false);
		res.redirect(link);
	 })
	
});

//delete- muti
router.post('/delete', function(req, res, next) {	
	let items = req.body.cid;    //cid là tên đặt trong ô input
	
	ItemModel.deleteMany({_id: {$in: items}}, (err, result)=>{
		req.flash('success', util.format( notify.DELETE_MUTI_SUSCCESS, result.n ), false);
		res.redirect(link);
	})
	
});
			 

//add và Edit
router.get('/form/:status/:id?', function(req, res, next) {  
	let currentStatus = ParamsHelper.getParams(req.params, 'status', 'add');
	let id 			  = ParamsHelper.getParams(req.params, 'id', '');	
	let errors        = [];
	if(currentStatus == 'add'){
		let item = {name: '', ordering: 0, status: 'novalue'}			
		res.render('pages/items/form', { title: 'Item Add page', item, errors });
	}else{
		ItemModel.findById(id)
			.then((item)=>{
				res.render('pages/items/form', { title: 'Item Edit page', item, errors });
			})
		
	}
  
});

//validate.validator() là modun mình tự viết
router.post('/save',validate.validator(),function(req, res, next){
	const errors = validationResult(req);
	const item       = Object.assign(req.body);  //lấy lại các thứ gửi lên
	
	//console.log(errors.array())
	if(item.id !==''){  //edit
		if (!errors.isEmpty()) { 		
			res.render('pages/items/form', { 
				title: 'Item Edit page',
				item,
				errors: errors.array()				
			});
			
		}else{
			ItemModel.updateOne({_id: item.id}, item, (err, result)=>{
				if(err) console.log(err);
				req.flash('success', notify.CHANGE_ITEM_SUSCCESS, false);
				res.redirect(link);
			})
		}

	}else{ //add
		if (!errors.isEmpty()) { 		
			res.render('pages/items/form', { 
				title: 'Item Add page',
				item,
				errors: errors.array()				
			});
			
		}else{
			var newItem = new ItemModel(item);
			newItem.save().then((err, result)=>{
				req.flash('success', notify.ADD_SUSCCESS , false);
				res.redirect(link);
			})
		}

	}
})

module.exports = router;
 