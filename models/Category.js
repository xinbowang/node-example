// 引入 mongoose模块
var mongoose = require('mongoose');
// 引入users.js 暴露的接口
var userSch = require('../schemas/category');

// mongoose下的模型类:http://mongoosejs.com/docs/models.html
var Category = mongoose.model('Category', userSch);

module.exports = Category;
