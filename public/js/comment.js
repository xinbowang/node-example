// 评论分页
var page = 1;  // 当前页
var limit = 5; // 显示条数
var pages = 0; // 总页数
var comment = []; // 返回的评论
// 提交评论
$(function(){
	$('#commentBtn').on('click',function(){
		$.ajax({
			type : 'POST',
			url : '/api/comment/post',
			data : {
				content : $('#comCon').val(),
				contentid : $('#contentId').val()
			},
			success : function(respondata){
				//console.log(respondata);
				if( !respondata.code ){
					content = $('#comCon').val('');
					comment = respondata.data.comments.reverse()
					comments(comment);// 反转数组
				}
			}
			
		})
	})
})
// 每次页面重载，都获取评论
$.ajax({
	url : '/api/comment',
	data : {
		contentid : $('#contentId').val()
	},
	success : function(respondata){
		//console.log(respondata);
		if( !respondata.code ){
			comment = respondata.data.reverse();
			comments(comment);// 反转数组
		}
	}
	
})

// 分页按钮点击
$('.pagination').delegate('a','click',function(){
	if( $(this).attr('aria-label')=='Previous' ){
		page--;
	}else{
		page++;
	}
	comments(comment); // 重新渲染页面
})


// 解析respondata返回
function comments(comment){
	var len = comment.length;
	$('#comLen').html(len); // 评论条数
	
	var aLi = $('.pagination li')
	pages = Math.max(Math.ceil( len/limit ),1);
	var start = Math.max((page-1)*limit,0); // 取最大值
	var end = Math.min(start+limit,len); // 取最小值
	aLi.eq(1).find('span').html(page+'/'+pages);
	
	if( page<=1 ){
		page=1;
		aLi.eq(0).html('<span>没有上一页了</span>');
	}else{
		aLi.eq(0).html('<a href="javascript:;" aria-label="Previous">'+
							'<span aria-hidden="true">&laquo; 上一页</span>'+
						'</a>');
	}
	if(page>=pages){
		page=pages;
		aLi.eq(2).html('<span>没有下一页了</span>');
	}else{
		aLi.eq(2).html('<a href="javascript:;" aria-label="Next">'+
							'<span aria-hidden="true">&raquo; 下一页</span>'+
						'</a>');
	}
	// 渲染评论
	if( len==0 ){
		$('.comList').html('还没有评论！！！');
	}else{
		var html='';
		for( var i=start;i<end;i++ ){
			html += '<div class="com-con">'+
						'<p class="clearfix">'+ comment[i].username +'<span class="pull-right">'+ dTime(comment[i].time) +'</span></p>'+
						'<p>'+ comment[i].content +'</p>'+
					'</div>';
		}
		$('.comList').html(html);
	}
	
}
// 时间字符串转码
function dTime(t){
	var date = new Date(t); // 将字符串转成时间对象;
	return date.getFullYear()+'年'+zero(date.getMonth()+1)+'月'+zero(date.getDate())+'日 '+zero(date.getHours())+':'+zero(date.getMinutes())+':'+zero(date.getSeconds());
	
}
// 时间字符串转码+0
function zero(t){
	return t<10 ? '0'+t : t+'';
}
