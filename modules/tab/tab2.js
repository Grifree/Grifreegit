module.exports = function(){
	$(function(){
		var tab =function(obj){
			$(obj.triggers).bind('click',function(){
				var tabHeadIndex=$(this).index();
				var tabHeadLengh=$(obj.triggers).length;
				$(this).addClass('tab-head-on').siblings().removeClass('tab-head-on');
				$(obj.contents).each(function(){
					var tabMainIndex = $(this).index() - tabHeadLengh;
					if(tabMainIndex==tabHeadIndex){
						$(this).addClass('tab-main-on').siblings().removeClass('tab-main-on');
						return false;
					}
				})
			})
		}
		
		tab({
			element: '.tab',
		    triggers: '.tab-head',
		    contents: '.tab-main'
		})
	})
}