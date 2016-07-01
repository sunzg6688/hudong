<%@ page language="java" pageEncoding="UTF-8" contentType="text/html;charset=UTF-8"%>
<%@include file="/WEB-INF/views/commons/taglibs.jsp"%>
<%
response.setHeader("Cache-Control","no-cache"); //Forces caches to obtain a new copy of the page from the origin server
response.setHeader("Cache-Control","no-store"); //Directs caches not to store the page under any circumstance
response.setHeader("Pragma","no-cache"); //HTTP 1.0 backward compatibility
response.setDateHeader("Expires", 0); //Causes the proxy cache to see the page as "stale"
%>
<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html, charset=utf-8">
<meta name="viewport" content="width=device-width,  user-scalable=yes,initial-scale=1, minimum-scale=1, maximum-scale=1">
<meta property="qc:admins" content="155244206664731467056414563756367" />
<meta property="wb:webmaster" content="3b0e529c0f0ba4df" />
<title>WOW</title>
<%@ include file="/WEB-INF/views/commons/meta.jsp"%>


<script>
var window_w=$(window).width();
if(window_w<800){
		if (/Android (\d+\.\d+)/.test(navigator.userAgent)) {
		var version = parseFloat(RegExp.$1);
		if (version > 2.3) {
			var phoneScale = parseInt(window.screen.width) / 640;
			document.write('<meta name="viewport" content="width=640, minimum-scale = ' + phoneScale + ', maximum-scale = ' + phoneScale + ', target-densitydpi=device-dpi, user-scalable=no">');
		} else {
			document.write('<meta name="viewport" content="width=640, target-densitydpi=device-dpi, user-scalable=no">');
		}
	} else {
		document.write('<meta name="viewport" content="width=640, target-densitydpi=device-dpi, user-scalable=no">');
	}
}
var params = {
		wmode: "transparent",
		allowFullScreen: "true"
	};
	//playVideo("","video/about.mp4")
	
	 function playVideo(picurl,videourl,videoId) {
		 var flashvars = {
			  videoUrl:videourl,
			  picUrl:picurl,
			  videoId:"1",
			  wmode: "transparent",
			  allowFullScreen: "true"
		};
		//picurl视频缩略图 ，videourl视频地址
		swfobject.embedSWF("flvplayer.swf", "myFlashId", "1280", "720", "10.2.0", "expressInstall.swf",flashvars,params);
	 }
	 function aboutvideo(videourl){
		$(".videopic").hide();
		$(".myFlashId").show();
		//alert(videourl)
		playVideo('',videourl)
		}
</script>
</head>

<body>
<div class="wrapper_box aboutbg">
<%@include file="/WEB-INF/views/front/include/header.jsp"%>
  <div class="main">
    <div class="aboutVideoBox " ><p onClick="aboutvideo('video/about.mp4')" class="videopic"><img src="images/common/aboutVideoPic.jpg"></p>
    <div id="myFlashId" class="myFlashId">
    
    </div>
    </div>
    <div class="aboutLogo "><img src="images/common/aboutLogo.jpg"></div>
    <div id="aboutUpdates" class="aboutsec">
      <p><img src="images/common/aboutUpdates.jpg"></p>
      <p class="aboutbgTitle">更新日志</p>
      <p>1.2 版本  2015.12.10 </p>
      <p class="aboutIndent"> 上线资源匹配与需求对接等功能，修正了若干bug.</p>
      <p class="aboutIndent"> -用户注册时候可以选择消费者、创客、投资人、媒体、电商等专属身份</p>
      <p class="aboutIndent"> -用户可以定义自己的兴趣喜好，并获得相关内容匹配</p>
      <p class="aboutIndent"> -用户可以定义自己的需求，并在资源栏目或者相关需求匹配</p>
      <p class="aboutIndent"> -针对不同智能产品行业属性增加7套创客模板</p>
      <p>1.1版本   2015.10.7 上传作品栏目上线</p>
      <p class="aboutIndent">-创客可以上传并生成针对自己产品的介绍页面。</p>
      <p>1.0 版本  2015.9.25 阅读与精选功能上线</p>
    </div>
    
    
    <div id="aboutAboutUs" class="aboutsec">
      <p><img src="images/common/aboutAboutUs.jpg"></p>
      <p class="aboutbgTitle">关于WOW</p>
      <p>Cheil鹏泰为助力IOT事业发展而投资设立的综合性IOT垂直网站，内容涉及IOT行业新闻、投资动向、创业家报导、先锋领袖、机构报道等众多方面。同时网站兼具社交功能，为创业者、投资人、销售渠道提供多方位的交流平台和沟通机会。 </p>
     
    </div>
    
    
     <div id="aboutReports" class="aboutsec">
      <p><img src="images/common/aboutReports.jpg"></p>
      <p class="aboutbgTitle">寻求报道</p>
      <p>请您将相关资料和稿件发送至编辑部邮箱  </p>
     <p>support@wowclub.cn</p>
    </div>
    
    
    <div id="aboutContactUs" class="aboutsec">
      <p ><img src="images/common/aboutUpdates.jpg"></p>
      <p class="aboutbgTitle">联系我们</p>
      <p>感谢您的关注，请您发送邮箱到   </p>
     <p>support@wowclub.cn</p>
    </div>
    
   
  </div>  
    
 <div class="aboutcompany">   
    
    <img src="images/common/aboutCompany.jpg">
    
    
    
    
    </div>
    
   
</div>
   <div class="clear"></div>
 <%@include file="/WEB-INF/views/front/include/footer.jsp"%></div>
</body>
</html>
<%@ include file="/WEB-INF/views/commons/js.jsp"%>