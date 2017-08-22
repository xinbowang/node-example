var testEditor = $(function(){
	// console.log($('#content')[0]);
	// 防止value报错
	if(!$('#content')[0]) return;
	editormd("test-editormd", {
	    width  : "100%",
	    height : 400,
	    path   : "/public/editor.md/lib/",
	    saveHTMLToTextarea : true
	});
})
// testEditor.getMarkdown();       // 获取 Markdown 源码
// testEditor.getHTML();           // 获取 Textarea 保存的 HTML 源码
// testEditor.getPreviewedHTML();  // 获取预览窗口里的 HTML，在开启 watch 且没有开启 saveHTMLToTextarea 时使用