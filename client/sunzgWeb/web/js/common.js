var loopnum=0;
var loop_max=3;
var loopnum_now=0;
var window_w=$(window).width();
var select_detail_num=0;
var select_detail_now=0;
var window_h=$(window).height();
var logn_h=window_h/2-280;
var logn_earth_h=window_h/2-354
var personalboxorder;
var platform=0;	
var flag = true; 


$(function(){
	
	$(".hot_news dl:last").css("padding-bottom","40px")
	if($(window).width()>800){
	$(".popbox,.popbg").height(window_h);
	}else{
		$(".popbox,.popbg").height("100%");
		}
	resize_sec();
	window.onresize = function() {
		resize_sec();
	}
	window.onload=function(){
		IsPC();
		if(flag=="rue"){
			platform=1; 
			
		}else{
			platform=0;	
			}
		
	}
	$(".logbg").css("top",logn_h+"px");
	$(".log_earth").css("top",logn_earth_h+"px");
	

	$(".upload_file,.upload_widget").css("opacity","0");
	$(".popbg,.popbg2,.gotoTop .blackbg").css("opacity","0.6");
	$(".cover_bg,.bgblack,.select_btn_right,.select_btn_left").css("opacity","0.8");
	
	
	$(".btn_nav_slide").click(function(){
		$(".navSub").stop(true).animate({"height":"0"},200);
		if($(this).hasClass("G_close")){
			$(this).removeClass("G_close")
			$(".navPhonebox").removeClass("G_open")

			//console.log("111")
		}else{
			$(this).addClass("G_close")
			$(".navPhonebox").addClass("G_open")
			//console.log("222")
		}
	})
	$("#index_phone li a").click(function(){
		$(this).addClass("on").parent().siblings().find("a").removeClass("on")
		var  nav_phone_index=$(this).parent().index()+1;
		$("div[class^=sec0]").hide();
		$(".sec0"+nav_phone_index).show();
	})
		
	$(".select_status button").click(function(){
		
		$(this).addClass("on").siblings().removeClass("on");
		})
	
	$(".select_status2 a").click(function(){
		$(this).addClass("on").siblings().removeClass("on");
		})
	$(".select_status a").click(function(){
		if($(this).hasClass("on")){
			
			$(this).removeClass("on")
		}
		else{
			$(this).addClass("on")
			}
		})
	
	$(".sexbox button").click(function(){
		$(this).addClass("on").siblings().removeClass("on");
		})

	$(".personal_ul li a").click(function(){
		
		$(this).addClass("on").parent().siblings().find("a").removeClass("on");
		var personal_index=$(this).parent().index()+1;
		$("div[id^=personal_tab0]").hide();
		$("#personal_tab0"+personal_index).show();
		
		})

	$(".checkbox1").toggle(function(){
			$(this).addClass("on");
		},function(){
			$(this).removeClass("on");
		})
	if(	$(".news_detail_kv img").width()>540){
			$(".news_detail_kv img").css("width","100%")
	
		}
	
	if(	$(".resource_img img").width()>882){
			$(".resource_img img").css("width","100%")
	
		}
	
		$(".subrelatedul").each(function(i) {
     	$(this).find("li").eq(1).css("margin","0 2% 5px") ;
		$(this).find("li").eq(4).css("margin","0 2%")  
    });
	
	$(".resource_tabTop li a").click(function(){
		
		personalboxorder=$(this).attr("rel");
		if(personalboxorder){
			$(this).addClass("on").parent().siblings("li").find("a").removeClass("on");
			$(".personal_box:eq("+personalboxorder+")").show().siblings(".personal_box").hide();
		}
		
	})
	setTimeout("$('.popresource').hide()",5000);
	
	
	
	
	
})
	function IsPC()  
		{  
           var userAgentInfo = navigator.userAgent;  
           var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
           var flag = true;  
           for (var v = 0; v < Agents.length; v++) {  
               if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }  
           }  
           return flag;  
		}  
	
	function related_resource_hover(obj){
			$(obj).addClass("currenttext").siblings($(obj)).removeClass("currenttext")		
	}
	function perSetClick(obj){
		
		if($(obj).next(".perSetCon").is(":hidden")){
			$(obj).next(".perSetCon").slideDown(500);
			$(obj).find(".perSetTitBtn").html("收起");
			$(obj).find(".perSetTitleDes").hide();
			
			}else{
				$(obj).next(".perSetCon").slideUp(500);
				$(obj).find(".perSetTitBtn").html("编辑");
				$(obj).find(".perSetTitleDes").show();
				
				}
		
		}

	function perSetClick2(obj){
		var aa=$(obj).parents(".perSetCon").prev();
				aa.find(".perSetTitBtn").html("编辑");
				aa.find(".perSetTitleDes").show();
				$(obj).parents(".perSetCon").slideUp(500);
				
		
		}
	function uploadSelect(obj){
		if($(obj).find("a").hasClass("on")){
			$(obj).find("a").removeClass("on");
		}else{
			$(obj).find("a").addClass("on").parents(".uploadDl").siblings().find("a").removeClass("on");

			}
	}
	function commentPhone(obj,obj2,obj3){
		if($("."+obj).is(":hidden")){
			$("."+obj).show();
		}else{
			$("."+obj).hide();
			}
		}
	
	function reg_click(obj,obj2){
		$("."+obj2).hide();
		$("."+obj).show();
		
		}
	
	function reg_click2(obj,obj2){
		if($("."+obj).is(":hidden")){
			$("."+obj2).hide();
			$("."+obj).show();
			
			}else{
				$("."+obj2).hide();
				}
		}
	function reg_li_click(obj){
		
       var htm1=$(obj).html();
		$(obj).parent().prev().html(htm1);
		$(obj).parent().hide();
		}
	function openpop(obj){
		$("."+obj).show();
	}	
	function closepop(obj){
		$("."+obj).hide();
	}	
	function personaltab_click(obj){
		
		$(obj).addClass("on").siblings().removeClass("on");
		var obj_index=$(obj).index()+1;
		$(".set_tabs").hide();
		
		$("#set_0"+obj_index).show();
		
	}
	function popshow_click(obj){
		$("#"+obj).show();
		}
	function uploadTab_click(obj,obj2,num){
		$("."+obj2).hide();
		$("#"+obj).show();
		$("div[class^='uploadTab']").removeClass("blueOn");
		$("div[id^='uploadTabNav'] span" ).removeClass("blueOn2");
		$("#uploadTabNav"+num).addClass("blueOn");
		$("#uploadTabNav"+num+" span").addClass("blueOn2");
		
		}
	function close_click(obj){
		$("#"+obj).hide();
		}
	function demo_img_click(obj){
		$(obj).addClass("shade").append('<div class="demo_now"><img src="../images/common/now.png"></div>');
		$(obj).siblings().children().remove("div[class=demo_now]");
		$(obj).siblings().removeClass("shade");
		
		var obj_index=$(obj).index()+1;
		$(".uploadtab").hide();
		$("#uploadtab_"+obj_index).show();
		
	}
	
		
	function right_pic_hover(obj,obj2){
		
		$(obj).find("."+obj2).show();
	}
	function right_pic_mouseout(obj,obj2){
		$(obj).find("."+obj2).hide();

	}
	
	function share_hover(obj){
		
		$(".part10_3").css({"height":"100px","background":"#fff url(images/common/share2.png)  80px 30px no-repeat","border":"1px solid #eaeaea","width":"194px"})
		$(".resource_share").show();
	}
	function share_mouseout(obj){
		$(".part10_3").css({"height":"50px","background":"#eff1f3 url(images/common/share2.png)  80px 30px no-repeat","border":"none","width":"196px"})
		$(".resource_share").hide();

	}
	
	
	
	
	function good(obj){
		var bgimg=$(obj).css("background-image").split("good");
	    var bgimg2=bgimg[1].split(".");
	    if(bgimg2[0]=="2"){
			$(obj).css('background','url(images/common/good.png) center center no-repeat');
		}else{
			
			$(obj).css('background','url(images/common/good2.png) center center no-repeat');}
		}
	
	
	function editpen1(obj,display_text,display_input){
		
		var edit_img=$("#"+obj).find("img").attr("src");
		if(edit_img=="images/common/edit_pen.png"){	
			$("."+display_text).hide();
			$("."+display_input).show();
		}else {
			$("."+display_input).hide();
			$("."+display_text).show();
		}
		
		
		}
	function editpen2(obj,display_input){
			
		var edit_img=$("#"+obj).find("img").attr("src");
		if(edit_img=="images/common/edit_pen2.png"){	
			$("."+display_input).show();
		}else {
			$("."+display_input).hide();
		}
		
		
		}
	function editpen3(obj,display_input,display_top){
			
		var edit_img=$("#"+obj).find("img").attr("src");
		if(edit_img=="images/common/edit_pen2.png"){	
			$("."+display_input).show();
			//$("."+display_top).css('top','-75px');
		}else {
			$("."+display_input).hide();
			//$("."+display_top).css('top','0');
		}
		
		
		}
	function editpen7(obj){
		
		var edit_img=$("#"+obj).find("img").attr("src");
		if(edit_img=="images/common/edit_pen2.png"){	
			$("#"+obj).find("img").attr("src","images/common/edit_save2.png");
			$(".video_adress_box").show();
		}else {
			$(".video_adress_box").hide();
			$("#"+obj).find("img").attr("src","images/common/edit_pen2.png");
		}
		
		
		}
	function add_remove(obj){
		
		$(obj).addClass("on").siblings().removeClass("on");
		
		}
	function select_link_hover(obj){
		$(obj).find(".dd21").css("border-bottom","1px solid #98dcdf")
		$(obj).find("dd").css({"background":"#00bbc0","color":"#fff"});
		$(obj).find(".mask").show();

		if($(obj).find(".noPrice")){
			$(obj).find(".buyone").addClass(".buyone2").show();
		}else{
			
			$(obj).find(".buyone").show();
			}
		
		}
	function select_link_mouseout(obj){
		$(obj).find(".dd21").css("border-bottom","1px solid #edf0f3")
		$(obj).find("dd").css({"background":"#fff","color":"#434343"});
		$(obj).find(".dd21").css("color","#00bbc0");
		$(obj).find(".mask").hide();

		if($(obj).find(".noPrice")){
			$(obj).find(".buyone").removeClass(".buyone2").hide();
		}else{
			
			$(obj).find(".buyone").hide();
			}
		
		}
		
	function resource_link_hover(obj){
		if(window_w>800){			
			$(obj).find("a,span").css({"color":"#f5f7f8"});
			$(obj).find(".shade").attr("src","images/common/user_shade_cyan40.png")
			$(obj).find(".mask").show();
			$(obj).find("dd").css({"background":"#00bbc0","color":"#f5f7f8","font-weight":"bold"});
			$(obj).find(".buyone").show();
			$(obj).find(".buyone").css("color","#6fb8be")
		}
	}
	function resource_link_mouseout(obj){
		if(window_w>800){
		$(obj).find(".resource_title").css("color","#434343");
		$(obj).find(".comment_name2,.zan").css("color","#999");
		$(obj).find(".shade").attr("src","images/common/user_shade_white40.png")
		$(obj).find(".mask").hide();
		$(obj).find("dd").css({"background":"#fff","color":"#434343","font-weight":"normal"});
		$(obj).find(".buyone").hide();
		
		}
	}

	function select_set_hover(obj,con){
		
		$(obj).addClass("on");
		$("."+con).show();
		
		
		}
	function select_set_mouseout(obj,con){
		$(obj).removeClass("on");
		$("."+con).hide();	
		
		}	
	
	function loop_arrow_click(arrow_name){
		
		if(window_w>=1788){
			loop_max=4
			}
			//alert(loopnum);
		if(arrow_name=="loop_arrow_left"){
			
			if (loopnum > 0)
			{
				loopnum --;
				
				$(".looppic li").eq(loopnum).show().siblings().hide();
				
			}else if(loopnum == 0){		
				
				loopnum = loop_max;
				$(".looppic li").eq(loopnum).show().siblings().hide();
			}
		}else{
			
			if (loopnum == loop_max)
			{
				 loopnum = 0;
				$(".looppic li").eq(loopnum).show().siblings().hide();
				
			}else{
				 loopnum ++
				$(".looppic li").eq(loopnum).show().siblings().hide();
			}		
			}
		
		
		}
		
	function loopfont_hover(obj){
		loopnum=$(obj).index();
		$(obj).stop(true,true).animate({"padding-left":"10px"},200)
		$(obj).find(".loop_arrow").show();	
		$(obj).addClass("loop_on");
		$(".looppic li:eq("+loopnum+")").show().addClass("looppic_on");
		$(".looppic li:eq("+loopnum+")").siblings().removeClass("looppic_on");
		$(".looppic li:eq("+loopnum+")").siblings().hide()
	}
	function loopfont_mouseout(obj){
		$(obj).stop(true,true).animate({"padding-left":"0"},200);
		$(obj).find(".loop_arrow").hide();
		$(obj).removeClass("loop_on");
		
	}

	function loop_arrow_mousehover(obj){
		if(obj=="loop_arrow_left"){
			$(".loop_arrow_left").find("img").attr("src","images/common/loop_arrow_leftover.png");
		}else{
			$(".loop_arrow_right").find("img").attr("src","images/common/loop_arrow_rightover.png");
		}
	}
	function loop_arrow_mouseout(obj){
		if(obj=="loop_arrow_left"){
			$(".loop_arrow_left").find("img").attr("src","images/common/loop_arrow_left.png");
		}else{
			$(".loop_arrow_right").find("img").attr("src","images/common/loop_arrow_right.png");	
		}	
	}
	
	function nav_down(obj,ul_h){
		$(".navSub").stop(true).animate({"height":"0"},500);
		$(".navPhonebox").addClass("G_close").removeClass("G_open");
		$(".btn_nav_slide").removeClass("G_close");
		if($("."+obj).height()==0){
			$("."+obj).stop(true).animate({"height":ul_h},500);
		}else{
			$("."+obj).stop(true).animate({"height":"0"},500);
			}
	}
	
	
	
	function nav_up(obj){
		$("."+obj).stop(true).animate({"height":"0"},500);
	}
	
	function nav_down2(obj,ulname,ul_h){
		$(obj).css('background','#fff');
		$("."+ulname+"ul").stop(true).animate({"height":ul_h},500);
		
		$(obj).find(".user_pic_nav").find('.shade').attr("src","images/common/user_shade_white40.png");
		
		
	}
	
	
	
	function nav_up2(obj,ulname){
		$(obj).css('background','#30b9bf');
		$("."+ulname+"ul").stop(true).animate({"height":"0"},500);
			$(obj).find(".user_pic_nav").find('.shade').attr("src","images/common/user_shade08_2.png");
		
	}
	
	
	
	
	function index_hover(hover_pic){
		$("."+hover_pic).addClass("on");
	}
	function index_mouseout( hover_pic){
		
		$("."+hover_pic).removeClass("on");
	}


	function resize_sec(){
		window_w=$(window).width();
		if(window_w<800){
			
			var select_detail_kv_h=$(".select_detail_kv li img").height();
			$(".select_detail_kvbox,.selectkv_box,.select_detail_kv li").height(select_detail_kv_h);
			
			var part03_img_h=$(".part03_img_h").height();
			$(".part05").height(part03_img_h);
		
		
		
		}else{
			$(".part05,.part05 img").height(150);

			}
        window_h=$(window).height();
        logn_h=window_h/2-280;
		logn_earth_h=window_h/2-354;
		$(".logbg").css("top",logn_h+"px");
		$(".log_earth").css("top",logn_earth_h+"px");
		

	}