var ItemModel = require("../../schemas/items");

let createFilterStatus = (currentStatus)=> {
    let statusFilter =[
		{ name: 'All', value: 'all', count: 0, link: '#diep', class: 'default'},
		{ name: 'Active', value: 'active', count: 0, link: '#diep', class: 'default'},
		{ name: 'InActive',value: 'inactive', count: 0, link: '#diep', class: 'default'},
	];

	statusFilter.forEach((items, index) =>{
		let conditon = {};
		if( items.value !== 'all') conditon = { status: items.value}
		if( items.value === currentStatus ){
			statusFilter[index].class = 'success';
		}
		ItemModel.count( conditon).then( (data)=>{
			statusFilter[index].count = data;
		})
    })
    
    return statusFilter;
}

module.exports = {
    createFilterStatus: createFilterStatus
}