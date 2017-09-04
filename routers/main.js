var express = require('express');
var router = express.Router();
// 引入Category数据库获取分类名称
var Category = require('../models/Category');
// 引入Content数据库获取分类名称
var Content = require('../models/Content');
// 引入User数据库获取分类名称
var User = require('../models/User');

// 由于 view页面也需要用 category，infoUser等信息；所以app.use()中间件定义公用信息
var data;
router.use(function(req,res,next){
	data = {
		infoUser : req.session, // 这样 index模板就可以使用infoUser保存的数据 
		allCategories : []
	}
	Category.find().then(function( allCategories ){
		data.allCategories = allCategories;
		next();
	})
})

/* 首页
 */
router.get('/',function(req,res,next){
	// console.log(req.infoUser) // 打印当前用户登录的信息
	data.page = Number(req.query.page) || 1;
	data.category = req.query.category || ''; // 导航的get请求,注意数据类型：读取并且返回给模板,所以分页直接可以用
	data.limit = 5; // 每页所显示条数
	// 用于增加数据库查询条件：如果category存在就通过category的id查找
	var where = {};
	if( data.category ){
		where.category = data.category;
	}
	// 导航动态读取数据
	Content.where(where).count().then(function(count){
		// 查询结果的条数
		data.count = count || 0;
		// 页数超过最大页数限制
		data.pages = Math.ceil(data.count/data.limit) || 0;
		// page最大值等于pages
		data.page = Math.min(data.page,data.pages);
		// page最小值为1
		data.page = Math.max(data.page,1);
		
		var skip = (data.page-1)*data.limit; // 跳过条数
		return Content.where(where).find().sort({nowTime:-1}).limit(data.limit).skip(skip).populate(['category','user']);
		
	}).then(function( contents ){
		data.contents = contents;
		// console.log(data.contents)
		res.render('main/index',data); // 第一个参数：引入的html模板； 第二个参数 用户登录判断的模板用于html中模板判断{%%}
		
	})
});

/* 
 * 阅读全文
 */
router.get('/view',function( req,res ){
	var contentId = req.query.contentId || ''; //url
	
	Content.findOne({
		_id : contentId
	}).populate('user').then(function(content){
		data.content = content;
		content.views++;
		content.save();
		res.render('main/view',data);
	})
})

module.exports = router;