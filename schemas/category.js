/* 
 * 需要下载mongoDB数据库: www.mongodb.com
 */
// 引入 mongoose 模块 创建用户数据库 存储方式 -参考文档 : http://mongoosejs.com/docs/guide.html
var mongoose = require('mongoose');

// mongoose.Schema 每new Schema({})都是一个新表
var Schema = mongoose.Schema;

var newSch = new Schema({
	// 分类列表数据
	name : String
})

module.exports = newSch;
