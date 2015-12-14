module.exports = function(){
	$(function(){
		$('div.tab-head').bind('click',function(){
			var tabHeadIndex=$(this).index();
			// console.log("序号 "+tabHeadIndex);
			var tabHeadLengh=$('.tab-head').length;
			// console.log("长度"+tabHeadLengh);
			$(this).addClass('tab-head-on').siblings().removeClass('tab-head-on');
			$('div.tab-main').each(function(){
				tabMainIndex = $(this).index() - tabHeadLengh;
				// console.log("mian序号"+tabMainIndex);
				if(tabMainIndex==tabHeadIndex){
					$(this).addClass('tab-main-on').siblings().removeClass('tab-main-on');
					return false;
				}
			})
		})
	})
}