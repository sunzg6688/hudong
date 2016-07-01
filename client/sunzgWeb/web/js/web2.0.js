$(function(){
	// feed fold event
	$(document).delegate(".feed-unfold","click",function(){
	  	var that =  $(this)
		var parent = that.parents(".feed-detail").find(".feed-media")
		that.toggleClass("active")
		parent.toggle()
	});
	
	/**
	 * @param  {[type]}
	 * @param  {[type]}
	 * @return {[type]}
	 */
	function abc (str, num){}
	
	// search pop event
	$(document).delegate(".feed-from .crumb","click",function(){
	  	$(".searchPopLayout,.searchPop").show()
	});
	
	$(document).delegate(".popClose","click",function(){
	  	$(".searchPopLayout,.searchPop").hide()
	});
	
	
	
	    //sunzg-start
    $(".personal_ul_setting li a").click(function(){
        $(this).addClass("on").parent().siblings().find("a").removeClass("on");
        var personal_index=$(this).parent().index()+1;
        $("div[id^=personal_tab0]").hide();
        $("#personal_tab0"+personal_index+"_setting").show();

    })

    $(".dynamic-tabs li a").click(function(){
        $(this).addClass("on").parent().siblings().find("a").removeClass("on");
        var personal_index=$(this).parent().index()+1;
        $("div[id^=dynamic_tab0]").hide();
        $("#dynamic_tab0"+personal_index).show();

    })

    $(document).delegate(".need-feed-title-operation","click",function(){
        var that =  $(this)
        var parent = that.parents(".need-feed").find(".need-feed-content");
        that.toggleClass("active")
        parent.toggle();
    });
    $(document).delegate(".reply-operation","click",function(){
        var that =  $(this)
        var parent = that.parents(".mail-feed").find(".mail-feed-reply");
        parent.toggle()
    });
//sunzg-end
	$(".sixinupload").css("opacity","0");
	$(".sixinZanHuifu").click(function(){
		
		$(this).parent().next(".sinxinReplywrap").toggle(300);
		
		})
	$(".publish").click(function(){
		
		var sendMsg=$(".feed-sendMsg").offset().top-70;
		console.log(sendMsg);
		$('html,body').animate({ scrollTop:sendMsg+"px"},1000)
		
		
		})
	
	
	
	
	
})