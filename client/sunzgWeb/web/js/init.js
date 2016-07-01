
;(function($)
{
	$(document).ready(function() 
	{





		// Here all containers are prepared, except for those that hold images.
		// Elements are added to the containers at this stage.
		var imgEnd;
		if(window.devicePixelRatio && window.devicePixelRatio>1)
		{
			imgEnd = "big"
		}
		else
		{
			imgEnd = "small"
		}

		$(".wow_index_zanBtn").click(function(){
			var zanCount = $(this).parent().find(".wow_index_zanCount")
			zanCount.html(parseInt(zanCount.html())+1);
		})
		$(".wow_index_pinglunBtn").click(function(){
			var pinglunCount = $(this).parent().find(".wow_index_pinglunCount")
			pinglunCount.html(parseInt(pinglunCount.html())+1);
		})

		var _w = $(window).width();
		var _h = $(window).height();

		// First test
//        for (i=0;i<40;i++)
        for (i=0;i<1;i++)
		{
			var w = 280,
				h = 370;
			var element = $('<div class="element" style="color:#fff;"></div>').width(w).height(h).appendTo('.wow_index_items');
			var _src = "img/pic_"+(i%5+4)+".jpg"
			var obj = {element:element,src:_src,index:i}
			initElement(obj)

		}

		function initElement(obj)
		{
			var intro = $('<div class="wow_index_intro abs">'),
				introTitle = $('<div class="wow_index_introTitle"></div>'),
				introControl = $('<div class="wow_index_introControl abs">'),
				zanBtn = $('<div class="wow_index_zanBtn left">'),
				zanCount = $('<div class="wow_index_zanCount left">'),
				pinglunBtn = $('<div class="wow_index_pinglunBtn left">'),
				pinglunCount = $('<div class="wow_index_pinglunCount left">'),
				moreBtn = $('<div class="wow_index_moreBtn right">'),
				img = $('<img src="'+obj.src+'" width="100%" alt=""/>');

			img.appendTo(obj.element);
			intro.appendTo(obj.element);
			introTitle.appendTo(intro);
			introControl.appendTo(intro);
			zanBtn.appendTo(introControl);
			zanCount.appendTo(introControl);
			pinglunBtn.appendTo(introControl);
			pinglunCount.appendTo(introControl);
			moreBtn.appendTo(introControl);
			//introTitle.html("超便捷快轮Ring空心轮平衡车");
			zanCount.html("123");
			pinglunCount.html("1234");
			introTitle.html("让新闻阅读变得如此清晰和立体")
			zanBtn.click(function(){
				zanCount.html(parseInt(zanCount.html())+1);
			})
		}


		/*// Make sure the "empty" test is actually empty and call freetile on it.
		$(window).resize(function(){
			console.log("resize")
			if(_w >=950)
			{
				$( '.wow_index_items' ).freetile(
					{
						selector: '.element',
						animate: true,
						elementDelay: 10,
						callback: function() { $( '.empty.test' ).text( 'Callback from empty container.' ); }
					});
			}
			else
			{
				$(".wow_index_firstImg").css({"width":580})
				$( '.wow_index_items' ).freetile(
					{
						animate: true,
						elementDelay: 10,
						callback: function() { $( '.empty.test' ).text( 'Callback from empty container.' ); }
					});
			}
		})*/

		if(_w >=950)
		{
			$( '.wow_index_items' ).freetile(
				{
					selector: '.element',
					animate: true,
					elementDelay: 10,
					callback: function() { $( '.empty.test' ).text( 'Callback from empty container.' ); }
				});
		}
		else
		{
			$(".wow_index_firstImg").css({"width":580})
			$( '.wow_index_items' ).freetile(
				{
					animate: true,
					elementDelay: 10,
					callback: function() { $( '.empty.test' ).text( 'Callback from empty container.' ); }
				});
		}

		$(".element,.wow_index_fixedElement").mouseenter(function(e){
			$(this).css({"transform": "perspective(600px) translateZ(30px) "})
			console.log("over")
		})
		$(".element,.wow_index_fixedElement").mousemove(function(e){

			var _s = parseInt($(this).width()/10)
			$(this).css({"transform": "perspective(600px)  translateZ(30px) rotateY("+ -(e.pageX - parseInt($(this).css("left"))-100 - _s*5)/_s +"deg) rotateX("+ (e.pageY - parseInt($(this).css("top"))-270)/20 +"deg)"})
		});
		$(".element,.wow_index_fixedElement").mouseleave(function(e){
			console.log("leave")
			$(this).css({"transform": "perspective(600px)  translateZ(0px) rotateY(0deg) rotateX(0deg)"})
		});


		var introTitle = $('<div class="wow_index_introTitle"></div>'),
		 	introControl = $('<div class="wow_index_introControl">'),
			zanBtn = $('<div class="wow_index_zanBtn left">'),
			zanCount = $('<div class="wow_index_zanCount left">'),
			pinglunBtn = $('<div class="wow_index_pinglunBtn left">'),
			pinglunCount = $('<div class="wow_index_pinglunCount left">')



	});



})(jQuery)



