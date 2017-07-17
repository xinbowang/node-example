var express = require('express');
var router = express.Router();
// 引入用户数据库查询
var User = require('../models/User');
//引入分类列表数据库查询
var Category = require('../models/Category');
//引入分类列表数据库查询
var Content = require('../models/Content');

// 判断是否是管理员登录
router.use(function(req,res,next){
	if( !req.infoUser.isAdmin ){
		res.send('你不是管理员，不能进入后台管理系统！');
		return;
	}
	next();
})

// 首页
router.get('/',function(req,res,next){
	res.render('admin/index',{
		infoUser :　req.infoUser
	})// 第一个参数：引入的html模板； 第二个参数 用户登录判断的模板用于html中模板判断{%%}
})


/*
 * 用户管理
 * 数据做分页
 * */
router.get('/user',function(req,res){
	var page = Number(req.query.page) || 1; // 通过node方法req.query解析hash值-> ?page=1 来获取当前页
	var limit = 5; // 每页显示条数
	var skip = 0; // 跳过条数
	var pages = 0;
	User.count().then(function(count){
		// console.log(count); 异步返回数据库数据条数
		// 页数超过最大页数限制
		pages = Math.ceil(count/limit);
		// page最大值等于pages
		page = Math.min(page,pages);
		// page最小值为1
		page = Math.max(page,1);
		
		skip = (page-1)*limit; // 跳过条数
		// 从数据库查询所有用户数据
		User.find().limit(limit).skip(skip).then(function( users ){
			// console.log(users); // 返回所有数据的数组集合
			res.render('admin/user_index',{
				infoUser :　req.infoUser,
				users : users,
				// 返回分页数据
				page : page,
				pages:pages,
				limit:limit,
				count:count,
				url : '/admin/user'
			})// 第一个参数：引入的html模板； 第二个参数 用户登录判断的模板用于html中模板判断{%%}
		})
	})
});

/*
 * 项目分类列表
 * */
// 分类名称页
router.get('/category',function(req,res){
	var page = Number(req.query.page) || 1; // 通过node方法req.query解析hash值-> ?page=1 来获取当前页
	var limit = 5; // 每页显示条数
	var skip = 0; // 跳过条数
	var pages = 0;
	Category.count().then(function(count){
		// console.log(count); 异步返回数据库数据条数
		// 页数超过最大页数限制
		pages = Math.ceil(count/limit);
		// page最大值等于pages
		page = Math.min(page,pages);
		// page最小值为1
		page = Math.max(page,1);
		
		skip = (page-1)*limit; // 跳过条数
		// sort({_id:-1}) : 数据排序： 1升序; -1降序
		// 从数据库查询所有用户数据
		Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function( categories ){
			// console.log(categories); // 返回所有数据的数组集合
			res.render('admin/category',{
				infoUser :　req.infoUser,
				categories : categories,
				// 返回分页数据
				page : page,
				pages:pages,
				limit:limit,
				count:count,
				url : '/admin/category'
			})// 第一个参数：引入的html模板； 第二个参数 用户登录判断的模板用于html中模板判断{%%}
		})
	})
})
// 分类名称添加页
router.get('/category/add',function(req,res){
	res.render('admin/category_add',{
		infoUser :　req.infoUser
	})
})
// 分类名称添加提交
router.post('/category/add',function(req,res){
	var name = req.body.name || '';
	
	if ( name=='' ){
		res.render('admin/category_err',{
			infoUser :　req.infoUser,
			message : '列表名称不能为空！请返回上一页重新输入！'
		});
		return;
	}
	// 数据库查询是否名称已存在
	Category.findOne({
		name : name
	}).then(function( nameTrue ){
		if( nameTrue ){
			res.render('admin/category_err',{
				infoUser :　req.infoUser,
				message : '该名称已存在，返回上一步重新填写！',
				title : '添加'
			});
			return Promise.reject();
		}else{
			return new Category({
				name : name
			}).save();
		}
		
	}).then(function( newName ){
		res.render('admin/category_success',{
			infoUser :　req.infoUser,
			message : '名称添加成功！',
			url : '/admin/category',
			title : '添加'
		});
	})
});

/*
 * 分类名称编辑
 * */
router.get('/category/eidt',function(req,res){
	var id = req.query.id || '';
	Category.findOne({ // 查询到要修改分类名称
		_id : id
	}).then(function( category ){
		if( !category ){
			res.render('admin/category_err',{
				infoUser :　req.infoUser,
				message : '分类名称不存在！',
				title : '编辑'
			});
		}else{
			res.render('admin/category_eidt',{
				infoUser :　req.infoUser,
				category :　category
			})
		}
		
	})
})

/*
 * 分类名称修改post请求
 * */
router.post('/category/eidt',function(req,res){
	var id = req.query.id || '';
	var name = req.body.name || '';
	if( name=='' ){
		res.render('admin/category_err',{
			infoUser :　req.infoUser,
			message : '用户名称不能为空！',
			title : '编辑'
		})
		return;
	}
	
	Category.findOne({ // 查询到要修改分类名称
		_id : id
	}).then(function( category ){
		if( !category ){
			res.render('admin/category_err',{
				infoUser :　req.infoUser,
				message : '分类名称不存在！',
				title : '编辑'
			});
			return Promise.reject();
		}else{
			// 名称是否有修改
			if( category.name == name ){
				res.render('admin/category_success',{
					infoUser :　req.infoUser,
					message : '分类名称修改成功！',
					url : '/admin/category',
					title:'编辑'
				})
				return Promise.reject();
			}else{
				// 通过数据库查询，分类名称是否与存在其他id上的名称相同
				return Category.findOne({ // 查询到要修改分类名称
					_id : { $ne:id },
					name : name
				})
			}
		}
		
	}).then(function( sameCategory ){
		if( sameCategory ){
			res.render('admin/category_err',{
				infoUser :　req.infoUser,
				message : '分类名称已存在，请更换其他名称！',
				title : '编辑'
			});
			return Promise.reject();
		}else{
			return Category.update({ // 更新数据
				_id : id // 更新id
			},{
				name : name // 更新的内容
			})
		}
	}).then(function(){
		res.render('admin/category_success',{
			infoUser :　req.infoUser,
			message : '分类名称修改成功！',
			url : '/admin/category',
			title:'编辑'
		})
	})
})
/*
 * 分类名称删除
 * */
router.get('/category/delete',function(req,res){
	var id = req.query.id || '';
	if( id=='' ){
		res.render('admin/category_err',{
			infoUser :　req.infoUser,
			message : '分类名称不存在，删除失败！',
			url : '/admin/category',
			title:'删除'
		})
	}else{
		Category.remove({
			_id :id
		}).then(function(){
			res.render('admin/category_success',{
				infoUser :　req.infoUser,
				message : '分类名称删除成功！',
				url : '/admin/category',
				title:'删除'
			})
		})
	}
})

/*
 * 文章-内容
 * */
// 首页
router.get('/content',function(req,res){
	var page = Number(req.query.page) || 1; // 通过node方法req.query解析hash值-> ?page=1 来获取当前页
	var limit = 5; // 每页显示条数
	var skip = 0; // 跳过条数
	var pages = 0;
	Content.count().then(function(count){
		// console.log(count); 异步返回数据库数据条数
		// 页数超过最大页数限制
		pages = Math.ceil(count/limit);
		// page最大值等于pages
		page = Math.min(page,pages);
		// page最小值为1
		page = Math.max(page,1);
		
		skip = (page-1)*limit; // 跳过条数
		// 从数据库查询所有用户数据 
		//.populate('category')关联另一个数据库
		Content.find().sort({nowTime:-1}).limit(limit).skip(skip).populate(['category','user']).then(function( contents ){
			//console.log(contents); // 返回所有数据的数组集合
			res.render('admin/content_index',{
				infoUser :　req.infoUser,
				contents : contents,
				// 返回分页数据
				page : page,
				pages:pages,
				limit:limit,
				count:count,
				url : '/admin/content'
			})// 第一个参数：引入的html模板； 第二个参数 用户登录判断的模板用于html中模板判断{%%}
		})
	})
})
/*
 * 文章内容添加
 * */
router.get('/content/add',function(req,res){
	Category.find().sort({_id:-1}).then(function( categories ){
		if( categories ){
			res.render('admin/content_add',{
				infoUser :　req.infoUser,
				categories : categories
			})
		}else{
			res.render('admin/category_err',{
				infoUser :　req.infoUser,
				message : '获取分类名称失败！'
			})
		}
	})
	
})

/*
 * 文章内容添加post到数据库
 * */
router.post('/content/add',function(req,res){
	var title = req.body.title || '';
	if ( title=='' ){
		res.render('admin/category_err',{
			infoUser :　req.infoUser,
			message : '标题不能为空！请返回上一页重新输入！'
		});
		return Promise.reject();
	}else{
		new Content({
			title : title,
			category : req.body.category,
			abstract : req.body.abstract,
			content : req.body.content,
			user : req.infoUser._id.toString() // 先保存作者
		}).save().then(function( newName ){
			res.render('admin/category_success',{
				infoUser :　req.infoUser,
				message : '文章内容添加成功！',
				url : '/admin/content',
				title : '添加'
			});
		});
	}
})

/*
 * 文章内容编辑页面
 * */
router.get('/content/eidt',function(req,res){
	var id = req.query.id || ''; // 获取path下的id
	// 定义变量
	categories = [];
	Category.find().then(function(rs){ // 获取Category数据库下的分类名称
		categories = rs;
		return Content.findById({
			_id : id
		}).populate('category'); // 对select数据判断是否选中
	}).then(function( contents ){
		if( !contents ){
			res.render('admin/category_err',{
				infoUser : req.infoUser,
				message : '文章内容不存在，请返回查看！',
				title : '编辑'
			})
			return Promise.reject();
		}else{
			res.render('admin/content_eidt',{
				infoUser : req.infoUser,
				categories:categories,
				contents : contents
			})
		}
	})
})
/*
 * 文章内容编辑保存
 * */
router.post('/content/eidt',function(req,res){
	var title = req.body.title || '';
	var id = req.query.id || ''; // 获取path下的id
	if ( title=='' ){
		res.render('admin/category_err',{
			infoUser :　req.infoUser,
			message : '标题不能为空！请返回上一页重新输入！'
		});
		return Promise.reject();
	}else{
		Content.update({
			_id : id
		},{
			title : title,
			category : req.body.category,
			abstract : req.body.abstract,
			content : req.body.content
		}).then(function( newName ){
			res.render('admin/category_success',{
				infoUser :　req.infoUser,
				message : '文章内容添加成功！',
				url : '/admin/content',
				title : '修改'
			});
		});
	}
})
/*
 * 文章内容删除
 * */
router.get('/content/delete',function(req,res){
	var id = req.query.id || '';
	if( id =='' ){
		res.render('admin/category_err',{
			infoUser :　req.infoUser,
			message : '删除文章内容失败！',
			title : '删除'
		});
	}else{
		Content.remove({
			_id : id
		}).then(function(){
			res.render('admin/category_success',{
				infoUser :　req.infoUser,
				message : '文章内容删除成功！',
				url : '/admin/content',
				title : '删除'
			});
		})
	}
})


module.exports = router;
