
$(document).ready(function(){
  $('.avatar').click(function(){
  	var sub = $(this).attr("id");
    $('.'+sub).slideToggle("medium");
  });
});

$(document).ready(function(){
	$('.subavatar').click(function () {
		if($(this).css('height') !== '70px'){
			$(this).animate({
				height: '90px',
				width: '90px',
			});
		}

		for(var i=0;i<$('.subavatar').length;i++){
			if($('.subavatar')[i].style.height === '90px'){
				$($('.subavatar')[i]).animate({
					width: '38px',
	    			height: '38px',
    			});
			}

		}

	});
});