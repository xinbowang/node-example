// 引入 mongoose模块
var mongoose = require('mongoose');
// 引入content.js 暴露的接口
var contentSch = require('../schemas/content');

// mongoose下的模型类:http://mongoosejs.com/docs/models.html
var Content = mongoose.model('Content', contentSch);

module.exports = Content;
