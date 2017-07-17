/* 
 * 需要下载mongoDB数据库: www.mongodb.com
 */
// 引入 mongoose 模块 创建用户数据库 存储方式 -参考文档 : http://mongoosejs.com/docs/guide.html
var mongoose = require('mongoose');

// mongoose.Schema 每new Schema({})都是一个新表
var Schema = mongoose.Schema;

var newSch = new Schema({
	// 用户名
	username : String,
	// 密码
	password : String,
	// 是否是管理员
	isAdmin : {
		type : Boolean,
		defaule : false // 默认值是非管理员用户
	}
})

module.exports = newSch;
