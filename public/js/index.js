$(function(){
	$('a').on('mouseover',function(ev){
		return false;
	})
	var $registered = $('.registered');
	var $login = $('.login');
	var $info = $('.info');
	// 注册转换登陆
	$registered.find('a').click(function(){
		$login.show();
		$registered.hide();
	});
	// 登陆转换注册
	$login.find('a').click(function(){
		$registered.show();
		$login.hide();
	});
	
	// 注册按钮提交
	$registered.find('input[type=button]').click(function(){
		
		$.ajax({
			type:'post',
			url:'/api/user/register',
			data:{
				username : $registered.find('[name="username"]').val(),
				password : $registered.find('[name="password"]').val(),
				repassword : $registered.find('[name="repassword"]').val(),
				
			},
			dataType : 'json',
			success : function(result){
				// console.log(result);
				switch( result.code ){
					case 1 : $registered.find('[name="username"]').val(result.message)
						break;
					case 2 : $registered.find('[name="password"]').val(result.message)
						break;
					case 3 : $registered.find('[name="repassword"]').val(result.message)
						break;
					case 4 : $registered.find('[name="username"]').val(result.message)
						break;
					default : defaultResult(result)
				}
			}
		});
		
	})
	
	// 登录按钮
	$login.find('input[type=button]').click(function(){
		console.log(1);
		$.ajax({
			type:'post',
			url:'/api/user/login',
			data:{
				username : $login.find('[name="username"]').val(),
				password : $login.find('[name="password"]').val()
			},
			dataType : 'json',
			success : function(result){
				// console.log(result);
				if( !result.code ){
					window.location.reload(); //重载页面
				}else{
					$login.find('[name="username"]').val(result.message);
				}
			}
		});
		
	});
	// 退出登录
	$info.find('.logout').click(function(){
		$.ajax({
			url : '/api/user/logout',
			success : function(result){
				if( !result.code ){
					alert('退出成功！');
					window.location.reload(); //重载页面
				}
			}
		})
	})
	
	
	// 注册默认成功的返回
	function defaultResult(result){
		alert(result.message);
		window.location.reload(); //重载页面,实现 cookie登录
	}
})
