/* 
 * 需要下载mongoDB数据库: www.mongodb.com
 */
// 引入 mongoose 模块 创建用户数据库 存储方式 -参考文档 : http://mongoosejs.com/docs/guide.html
var mongoose = require('mongoose');

// mongoose.Schema 每new Schema({})都是一个新表
var Schema = mongoose.Schema;

var newSch = new Schema({
	// 关联字段 ->分类名称id -> 用于select
	category : { // 引用另一个数据库
		// 字段类型->可以在ObjectId("59000a8b613590df38c02f46")robomongo里看
		type :　mongoose.Schema.Types.ObjectId,
		
		// 引用 models下的Category.js
		ref : 'Category'
	},
	user : { // 作者
		type :　mongoose.Schema.Types.ObjectId,
		
		// 引用 models下的User.js
		ref : 'User'
	},
	// 内容标题
	title : String,
	// 内容简介
	abstract : {
		type :　String,
		default : ''
	},
	// 内容
	content : {
		type :　String,
		default : ''
	},
	// 提交时间
	nowTime : {
		type : Date,
		default : Date.now // new Date()可能存在存储时间相同的问题
	},
	views : { // 浏览次数
		type : Number,
		default : 0
	},
	comments : {// 评论
		type : Array,
		default : []
	}
})

module.exports = newSch;
