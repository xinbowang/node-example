/*
 * express
 * 博客入口文件
 */
// 引入express模块
var express = require('express');
// 引入swig模块 ： 配置html模板
var swig = require('swig');
// 引入数据库模块
var mongoose = require('mongoose');
// 引入body-parser模块，可以接受客户端ajax提交的json数据,以及url的处理.
var bodyParser = require('body-parser');
// 引入cookies 来判断是否是登录状态
var cookies = require('cookies');
// 引入数据库 ./models/User,判断是否是管理员,这个很多地方用到，所以用isAdmin布尔值判断
var User = require('./models/User');

// 执行express => 相当于node.js 里面的http.createServer()
var app = express();

/* 
 * 配置模板引擎 
 * 1.定义当前所使用的模板引擎
 * 第一个参数 ：模板引擎名称，同时也是文件名后缀名；
 * 第二个参数 ： 用于解析模板内容的方法
 */
app.engine('html',swig.renderFile);


/* 
 * 设置html模板存放目录，第一个参数必须是views 第二个参数是文件路径 
 * router.get('/',function(req,res,next){
		res.render('admin/index',{ //   --->./views/admin/index
			infoUser :　req.infoUser
		})// 第一个参数：引入的html模板； 第二个参数 用户登录判断的模板用于html中模板判断{%%}
	})
 */
app.set('views','./views');

/* 
 * 访问静态资源文件时，express.static 中间件会根据目录添加的顺序查找所需的文件。
 * 第一个 参数 指定访问静态文件名称【支持正则方式】  第二个参数文件所在目录
 */
app.use('/public', express.static(__dirname+'/public'));

/* 
 * 设置body-parser:https://github.com/expressjs/body-parser;解析post发送的数据保存的body的属性内
 */
app.use(bodyParser.urlencoded({extended:true}));

/*
 * 设置cookies : 后台返回数据名称 infoUser;
 */
app.use(function( req,res,next ){
	req.cookies = new cookies( req,res );
	// console.log(typeof req.cookies.get('infoUser')) // string
	req.infoUser = {}; // 给req添加一条属性， 为了在api,main等页面判断用户是否登录
	// 解析cookie对象->req.cookies.get(数据名称) 获取cookie
	if( req.cookies.get('infoUser') ){ // 如果cookie存在;
		try{
			req.infoUser = JSON.parse(req.cookies.get('infoUser')); // 转成json对象;
			// 判断是否是管理员登录
			User.findById(req.infoUser._id).then(function(infoUser){
				// 通过id查找数据库，infoUser.isAdmin是否存在
				// 在req.infoUser中增加一条数据，isAdmin是否为真;
				req.infoUser.isAdmin = Boolean( infoUser.isAdmin ); // 如果为真，则是管理员登录
				next(); // 向下继续运行
			})
		}catch(e){
			next(); // 向下继续运行
		}
	}else{
		next(); // 向下继续运行
	}
	
	
})


/* 
 * 注册使用模板引擎，第一个参数必须是 view.engine 第二个参数必须与app.engine的第一个参数一致；
 */
app.set('view engine','html');


// 在开发过程中，取消模板默认缓存
swig.setDefaults({cache:false});


/* 
 * 各模块Routers路由入口文件: 
 * 		默认写法 app.use('/main', router); 第一个参数 路由路径， 第二个参数 绑定的路由规则
 * 		这里的router放到了外部文件，以模块的方式引入。
 * 		require('./routers/main') => 文件内的 module.exports = router;
 */
app.use('/',require('./routers/main'));
app.use('/api',require('./routers/api'));
app.use('/admin',require('./routers/admin'));


// 监听端口号
// 通过mongoose.connect方法链接数据库；在此之前需要开启数据库
mongoose.connect('mongodb://localhost:27017/blog',function(err){
	if( err ){
		console.log('连接数据库错误！');
	}else{
		console.log('连接数据库成功！');
		app.listen(8080);
	}
});
