module.exports = function(){
	$(function() {
		

	    var pPanelData = $.parseJSON($('#fontjson').html())
	    var pPanelTpl = $('#fonttpl').html()
	    var pPanelRender = Handlebars.compile(pPanelTpl)
	    var pPanelHtml = pPanelRender(pPanelData)
	    $('#fonttag').html(pPanelHtml)

		adaption()

		function adaption(){// 自适应
				// 通过 zoom 来调节文字大小
				var zoom = ($('.p-panel-item').width() / $('.p-panel-item-content').width())*0.8;
				console.log("$('.p-panel-item-content').width() "+$('.p-panel-item-content').width())
				$('.p-panel-item-content').css('zoom', zoom);			
		}
		
		$(window).resize(function(){
			adaption()
		})
		
	})
}