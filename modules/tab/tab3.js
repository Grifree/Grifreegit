module.exports = function(){
	$(function(){
		var tab =function(obj){
			var tabHeadLengh=$(obj.triggers).length;
			//初始化显示
			$(obj.triggers).each(function(){
				var tabHeadInitialIndex=$(this).index() + 1;
				if(tabHeadInitialIndex == obj.initialIndex){
					$(this).addClass('tab-head-on').siblings().removeClass('tab-head-on');
					return false;
				}
			})
			$(obj.contents).each(function(){
				var tabMainInitialIndex = $(this).index() - tabHeadLengh + 1;
				if(tabMainInitialIndex==obj.initialIndex){
					$(this).addClass('tab-main-on').siblings().removeClass('tab-main-on');
					return false;
				}
			})
			AddTriggerClass()
			//点击事件
			$(obj.triggers).bind('click',function(){
				var tabHeadIndex=$(this).index();
				$(this).addClass('tab-head-on').siblings().removeClass('tab-head-on');
				$(obj.contents).each(function(){
					var tabMainIndex = $(this).index() - tabHeadLengh;
					if(tabMainIndex==tabHeadIndex){
						$(this).addClass('tab-main-on').siblings().removeClass('tab-main-on');
						return false;
					}
				})
				AddTriggerClass()
			})
			//给有on的head加activeTriggerClass
			function AddTriggerClass(){
				$(obj.element).find('.tab-head-on').addClass(obj.activeTriggerClass).siblings().removeClass(obj.activeTriggerClass);
			}
		}
		
		tab({
			element: '.tab',
		    triggers: '.tab-head',
		    contents: '.tab-main',
		    //初始显示第一个
		    initialIndex:2,
		    activeTriggerClass: 'ui-tab-active'
		})
	})
}