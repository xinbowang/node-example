$('#logout').click(function(){
	$.ajax({
		url : '/api/user/logout',
		success : function(result){
			if( !result.code ){
				alert('退出成功！');
				window.location.href='/'; // 退出成功， 跳转页面
			}
		}
	})
});

