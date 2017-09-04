var express = require('express');
var router = express.Router();
// 数据库操作, 引入User模块
var User = require('../models/User');
var Content = require('../models/Content');
/*
	注册验证：
		1，用户名不能为空
		2，密码不能为空
		3，密码不一致
	需要数据库查询验证
		1，用户名是否已注册
 */
// 定义一个注册请求返回的信息格式
var resData;
router.use(function(req,res,next){
	resData = {
		code : 0,
		message : ''
	}
	next(); // 后续执行...
})

// 用户注册
router.post('/user/register',function(req,res,next){
	// console.log('register')
	// console.log(req.body) 保存的注册数据
	var username = req.body.username;
	var password = req.body.password;
	var repassword = req.body.repassword;
	if( username == '' ){
		resData.code = 1;
		resData.message = '用户名不能为空！';
		res.json(resData); // 将数据保存成json格式，返回给前端
		return;
	}
	if( password == '' ){
		resData.code = 2;
		resData.message = '密码不能为空！';
		res.json(resData); // 将数据保存成json格式，返回给前端
		return;
	}
	if( password != repassword ){
		resData.code = 3;
		resData.message = '两次密码输入不一致，请重新输入！';
		res.json(resData); // 将数据保存成json格式，返回给前端
		return;
	}
	// mongoose下面Model.findOne只查找一次 : http://mongoosejs.com/docs/api.html#model_Model.findOne。返回值式es6 Promise对象，直接调用then方法，接受返回值
	User.findOne({
		username : username
	}).then(function(infoUser){
		// console.log(infoUser) 不存在，返回：null
		if( infoUser ){ // 如果infoUser不等于空，那么用户已注册
			resData.code = 4;
			resData.message = '用户名，已注册！';
			res.json(resData); // 将数据保存成json格式，返回给前端
			return;
		}
		// 保存数据,需要先创建对象
		var user = new User({
			username : username,
			password : password
		})
		return user.save(); // 返回保存的数据
	}).then(function(newInfoUser){
		resData.message = '注册成功';
		// 直接返回cookie信息，前端实现页面刷新直接登录;
		// 设置cookie,返回一个用户信息字符串
		/*req.cookies.set('infoUser',JSON.stringify({ // 将cookie保存成字符串格式
			_id : newInfoUser._id,
			username : newInfoUser.username
		}));*/
		req.session.username = newInfoUser.username;
		req.session._id = newInfoUser._id;
		res.json(resData);
	})
})

// 用户登陆
router.post('/user/login',function( req, res ){
	var username = req.body.username; // post发送过来的数据
	var password = req.body.password;
	if( username == '' ){
		resData.code = 1;
		resData.message = '用户名不能为空！';
		res.json(resData); // 将数据保存成json格式，返回给前端
		return;
	}
	if( password == '' ){
		resData.code = 1;
		resData.message = '密码不能为空！';
		res.json(resData); // 将数据保存成json格式，返回给前端
		return;
	}
	User.findOne({
		username : username,
		password : password
	}).then(function(infoUser){
		// console.log(infoUser) //不存在，返回：null
		if( !infoUser ){ // 如果infoUser不等于空，那么用户已存在
			resData.code = 2;
			resData.message = '用户名不存在！';
			res.json(resData); // 将数据保存成json格式，返回给前端
			return;
		}
		resData.infoUser = {
			_id : infoUser._id,
			username : infoUser.username
		}
		resData.message = '登陆成功！';
		// 设置cookie,返回一个用户信息字符串
		/*req.cookies.set('infoUser',JSON.stringify({ // 将cookie保存成字符串格式
			_id : infoUser._id,
			username : infoUser.username
		}));*/
		req.session.username = infoUser.username;
		req.session._id = infoUser._id;
		res.json(resData); // 将数据保存成json格式，返回给前端
		return;
	})
})

// 提交评论
router.post('/comment/post',function(req,res){
	var contentId = req.body.contentid;
	var data = {
		username : req.session.username, // 登录的话，cookie里保存着用户
		time : new Date(),
		content : req.body.content // 解析post数据
	}
	// 查找属于内容 所在的评论
	Content.findOne({
		_id : contentId
	}).then(function(content){
		content.comments.push(data);
		return content.save();
	}).then(function(newcontent){
		resData.message = '评论成功！';
		resData.data = newcontent;
		res.json(resData); // 将数据保存成json格式，返回给前端
	})
})
// 获取评论
router.get('/comment',function(req,res){
	var contentId = req.query.contentid;
	// 查找属于内容 所在的评论
	Content.findOne({
		_id : contentId
	}).then(function(content){
		resData.message = '获取成功！';
		resData.data = content.comments;
		res.json(resData); // 将数据保存成json格式，返回给前端
	})
})

// 退出登录
router.get('/user/logout',function(req,res){
	//req.cookies.set('infoUser',null); // cookie返回 空; 清楚cookie
	req.session.destroy(); // 销毁session
	res.json(resData); // 将数据保存成json格式，返回给前端
})





module.exports = router;