var ItemModel = require("../../schemas/items");

let createFilterStatus = async (currentStatus)=> {
    let statusFilter =[
		{ name: 'All',     value: 'all',      count: 0,  class: 'default'},
		{ name: 'Active',  value: 'active',   count: 0,  class: 'default'},
		{ name: 'InActive',value: 'inactive', count: 0,  class: 'default'},
	];

	for(let index = 0; index < statusFilter.length; index ++ ){
		let item = statusFilter[index];
		let conditon = ( item.value !== 'all')? { status: item.value} : {};
		
		if( item.value === currentStatus ){
			statusFilter[index].class = 'success';
		}
		//console.log(item.name)
		await	ItemModel.count( conditon).then( (data)=>{
			statusFilter[index].count = data;
			//console.log(data)
		})
	}
	
    
    return statusFilter;
}

module.exports = {
    createFilterStatus: createFilterStatus
}