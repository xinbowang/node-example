/*
 * express
 * 博客入口文件
 */
// 引入express模块
var express = require('express');
// 引入http模块
var http = require('http');
// 引入path模块
var path = require('path');
// 引入swig模块 ： 配置html模板
var swig = require('swig');
// 引入数据库模块
var mongoose = require('mongoose');
// 引入body-parser模块，可以接受客户端ajax提交的json数据,以及url的处理.
var bodyParser = require('body-parser');
// 引入cookies 来判断是否是登录状态
//var cookies = require('cookies');
var cookieParser = require('cookie-parser');
var session = require('express-session');
// 打印日志
var morgan = require('morgan');
// 第三方登录
// var everyauth = require('everyauth');
// Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
// 支持put/delete操作
var methodOverrid = require('method-override');
// 引入数据库 ./models/User,判断是否是管理员,这个很多地方用到，所以用isAdmin布尔值判断
var User = require('./models/User');


// 执行express => 相当于node.js 里面的http.createServer()
var app = express();

/**
 * 设置port端口：process.env.PORT 默认端口;
 */
app.set('port',process.env.PORT || 3000);


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
 * 注册使用模板引擎，第一个参数必须是 view.engine 第二个参数必须与app.engine的第一个参数一致；
 */
app.set('view engine','html');


// 在开发过程中，取消模板默认缓存
swig.setDefaults({cache:false});



/* 
 * 访问静态资源文件时，express.static 中间件会根据目录添加的顺序查找所需的文件。
 * 第一个 参数 指定访问静态文件名称【支持正则方式】  第二个参数文件所在目录
 */
app.use('/public', express.static(path.join(__dirname,'/public')));

/* 
 * 设置body-parser:https://github.com/expressjs/body-parser;解析post发送的数据保存的body的属性内
 */
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser('ses'));
/* 
name: 设置 cookie 中，保存 session 的字段名称，默认为 connect.sid 。
saveUninitialized: 是指无论有没有session cookie，每次请求都设置个session cookie ，默认给个标示为 connect.sid
saveUninitialized:是否设置session在存储容器中可以给修改
PS:session过期30分钟，没有人操作时候session 30分钟后过期，如果有人操作，每次以当前时间为起点，使用原设定的maxAge重设session过期时间到30分钟只有这种业务场景必须同行设置resave,rolling为true.同时saveUninitialized要设置为false允许修改。
store: session 的存储方式，默认存放在内存中，也可以使用 redis，mongodb 等session 的 .
store 有四个常用选项：1）内存 2）cookie 3）缓存 4）数据库。express 生态中都有相应模块的支持。
redis方式-> store: new redisStore();
1）内存方式：适合开发环境使用，方便。
2） 安全性不好，我拿到你的cookie,就相当与拿到了你的身份令牌。对于cookie盗窃，非常危险。不存在共享问题，浏览器携带。浪费带宽。
3）缓存方式是最常用的方式了，即快，又能共享状态。节省带宽
4）数据库 session。很慢。
secret: 通过设置的 secret 字符串，来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改。
cookie: 设置存放 session id 的 cookie 的相关选项，默认为
(default: { path: ‘/‘, httpOnly: true, secure: false, maxAge: null })
genid: 产生一个新的 session_id 时，所使用的函数， 默认使用 uid2 这个 npm 包。
rolling: 每个请求都重新设置一个 cookie，默认为 false。
resave: 即使 session 没有被修改，也保存 session 值，默认为 true。
是指每次请求都重新设置session cookie,假设你的cookie是10分钟过期，每次请求都会再设置10分钟
 */
// 过了过期时间没有操作，需将重新登陆
// app.use(session({secret: 'sess', resave: true, rolling: true, saveUninitialized: false ,cookie: { maxAge: 10000 }}));
// name默认为 connect.sid
app.use(session({name: 'sessionId', secret: 'sess', resave: true, rolling: true, saveUninitialized: false ,cookie: { maxAge: 1000*60*60 }})); // 30分钟过期
app.use(morgan('dev'));
app.use(methodOverrid());
// app.use(everyauth.middleware());
/*
 * 设置cookies : 后台返回数据名称 infoUser;
 */
/*app.use(function( req,res,next ){
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
})*/

app.use(function(req,res,next){
	if( req.session && req.session._id ){
		try{
			// console.log(req.session);
			// 判断是否是管理员登录
			User.findById(req.session._id).then(function(infoUser){
				// 通过id查找数据库，infoUser.isAdmin是否存在
				// 在req.infoUser中增加一条数据，isAdmin是否为真;
				req.session.isAdmin = Boolean( infoUser.isAdmin ); // 如果为真，则是管理员登录
				next(); // 向下继续运行
			})
		}catch(e){
			next(); // 向下继续运行
		}
	}else{
		next(); // 向下继续运行
	}
})

// 检测是否是管理员登录->需要检测的接口调用->admin
function auth(req,res,next){
	if( req.session && req.session.isAdmin ){
		return next();
	}else{
		return res.send('你不是管理员，不能进入后台管理系统！');
	}
}

/* 
 * 各模块Routers路由入口文件: 
 * 		默认写法 app.use('/main', router); 第一个参数 路由路径， 第二个参数 绑定的路由规则
 * 		这里的router放到了外部文件，以模块的方式引入。
 * 		require('./routers/main') => 文件内的 module.exports = router;
 */
app.use('/',require('./routers/main'));
app.use('/api',require('./routers/api'));
app.use('/admin',auth,require('./routers/admin')); // 将检测函数放入路由执行



// 监听端口号
// 通过mongoose.connect方法链接数据库；在此之前需要开启数据库
mongoose.connect('mongodb://localhost:27017/blog',function(err){
	if( err ){
		console.log('连接数据库错误！');
	}else{
		// app.get('port')->获取set定义的端口号
		http.createServer(app).listen(app.get('port'),function(){
			console.log('http model listening on port '+app.get('port'))
		});
		// 第二种写法
		/*app.listen(app.get('port'),function(){
			console.log('express model listening on port '+app.get('port'))
		});*/
	}
});
