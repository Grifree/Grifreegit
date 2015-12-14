module.exports = function(){
	$(function() {

		// 封装api
		adapt({
			hull:'.p-panel',
			content:'.p-panel-item-content',//文字
			box:'.p-panel-item',//容器
			//所有文字大小一致 same ,或者文字各自适应容器 vary
			type: "vary"
		})

		var adapt =function(obj){
			// Handlebars的渲染部分
			var pPanelData = $.parseJSON($('#fontjson').html())
		    var pPanelTpl = $('#fonttpl').html()
		    var pPanelRender = Handlebars.compile(pPanelTpl)
		    var pPanelHtml = pPanelRender(pPanelData)
		    var type =obj.type=="same"?"same":"vary";
		    $('#fonttag').html(pPanelHtml)

		    //自适应的函数
			adaption()

			function adaption(){// 自适应
				if(type=="same"){
					// 通过 zoom 来调节文字大小
					var zoom = ($('.p-panel-item').width() / $('.p-panel-item-content').width())*0.7;
					// console.log("$('.p-panel-item-content').width() "+$('.p-panel-item-content').width())
					$('.p-panel-item-content').css('zoom', zoom);		
				}else if (type=="vary") {
					$('.p-panel-item').each(function(){
						var zoom = ($(this).width() / $(this).find('.p-panel-item-content').width())*0.7;
						$(this).find('.p-panel-item-content').css('zoom', zoom);	
					})
				};
						
			}
			
			//监听窗口大小改变
			$(window).resize(function(){
				adaption()
			})
		}
	})
}