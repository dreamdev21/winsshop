$(document).ready(function() {
	// Apply Bootstrap Scrollspy to show active navigation link based on page scrolling
	$('.navbar').scrollspy();

    /*
    	$(document).on('click.nav','.navbar-collapse.in',function(e) {
    		if( $(e.target).is('a') || $(e.target).is('button')) {
    			$(this).collapse('hide');
    		}
    	});
    */
    // Scroll page with easing effect
    $('.navbar ul li a').bind('click', function(e) {
    	console.log('e',this,'this',e.target.href);
    	$('#collapse').collapse('hide');

    	if(e.target.href === 'https://online-keller.herrenmuehle-wein.de/' || e.target.href === '/'  || e.target.href === 'https://www.herrenmuehle-wein.de/'){
    		//console.log('match');
    	} else {
    		 e.preventDefault();
    		        target = this.hash;
    		        $.scrollTo(target, 1500, {
    		        	easing: 'easeOutCubic'
    		        });

    		        $(".btn-navbar").click();
    	}

   	});

	// Show/Hide Sticky "Go top" button
	$(window).scroll(function(){
		if($(this).scrollTop()>200){
			$(".go-top").fadeIn(200);
		}
		else{
			$(".go-top").fadeOut(200);
		}
	});

	// Scroll Page to Top when clicked on "go top" button
	$(".brand, .go-top").click(function(event){
		event.preventDefault();

		$.scrollTo('#home', 1500, {
        	easing: 'easeOutCubic'
        });
	});

	// Scroll Page to "Contact" section
	$(".connect-now").click(function(event){
		event.preventDefault();

		$.scrollTo('#contact', 1500, {
        	easing: 'easeOutCubic'
        });
	});


	// Sliding Background Images
	$.vegas('slideshow', {
        delay:11000,
        preload: false,
        backgrounds:[
        	{src:	'img/bg/Rebberge_im_Morgenlicht_DSC_3440-01.jpg',fade:2000},
        	 {src : 'img/bg/bg4.jpg', fade: 2000},
        	 {src : 'img/bg/bg5.jpg', fade: 2000},
        	 {src : 'img/bg/bg6.jpg', fade: 2000},
  			 {src : 'img/bg/bg7.jpg', fade: 2000},
             {src : 'img/bg/bg8.jpg', fade: 2000},
             {src : 'img/bg/bg9.jpg', fade: 2000},
             {src : 'img/bg/bg10.jpg', fade: 2000},
             {src : 'img/bg/bg11.jpg', fade: 2000}
        ]
    })('overlay');


    // Apply Card scrolling effect on Portfolio
	var $frame = $('#the-portfolio');
	var $wrap  = $frame.parent();

	// Call Sly on frame for Portfolio effect
	$frame.sly({
		horizontal: 1,
		itemNav: 'forceCentered',
		smart: 1,
		activateMiddle: 1,
		activateOn: 'click',
		mouseDragging: 1,
		touchDragging: 1,
		releaseSwing: 1,
		startAt: 2,
		scrollBar: $wrap.find('.scrollbar'),
		scrollBy: 1,
		speed: 300,
		elasticBounds: 1,
		easing: 'swing',
		dragHandle: 1,
		dynamicHandle: 1,
		clickBar: 1,

		// Buttons
		prev: $wrap.find('.prev'),
		next: $wrap.find('.next')
	});

	// make only center image clickable for zoom using prettyphoto
	$('#the-portfolio li').click(function(ele){
		if($(this).hasClass('active')){
			this_image = $(this).find("img").attr("src");
			$.fn.prettyPhoto({
				social_tools:''
			});
			$.prettyPhoto.open(this_image,'','');
		}
	})

});



var geocoder;
var map;

var places = [
  ["<div class='iw_content'><span class='iw_smaller'>Verkauf in der Herrenmühle<br/>Auf 'gut Glück'<br>Im Himmelreich 1, Ehrenstetten</span></div>", 47.914156, 7.755758, ''],
  ['<div class="iw_content"><span class="iw_smaller">Markt Wittnau<br/><br/>Do. 16:00-19:00 Uhr<br>Schönbergstraße, Wittnau</span></div>', 47.946827, 7.813849, ''],
  ['<div class="iw_content"><span class="iw_smaller">Markt Merzhausen<br/><br/>Sa. 09:00-13:00 Uhr<br>Dorfstraße, Merzhausen</span></div>', 47.965853, 7.827791, ''],
  ['<div class="iw_content"><span class="iw_smaller">Markt Littenweiler<br/><br/>Sa. 09:00-13:00 Uhr<br>Am Bürgersaal, Littenweiler</span></div>', 47.979272, 7.896287, '']
  ];
function initialize() {
	//console.log(query);
	var blueMoon= [{featureType: "all", stylers: [ { hue: '#c9d200'}]}];
	//geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(47.946827, 7.813849);
	var map_canvas = document.getElementById('map_canvas');
	var map_options = {
		center: latlng,
		scrollwheel: false,
		zoom: 12,
		disableDefaultUI: true,
		draggable: false
	}
	map = new google.maps.Map(map_canvas, map_options);
	map.setOptions({styles: blueMoon});

	//codeAddress();
	makeMap(map,places);
}

// function codeAddress() {
// 	var image = 'img/logogreen.png';
// 	var address = query;
// 	geocoder.geocode({ 'address': address }, function (results, status) {
// 		console.log("status", status)
// 		if (status == google.maps.GeocoderStatus.OK) {
// 			map.setCenter(results[0].geometry.location);
// 			var latlng = new google.maps.LatLng(47.914156, 7.755758);
// 			var cont = '<div class="iw_content">Verkauf in der <br/>Herrenmühle:<span class="iw_smaller"><br/>Sa. 10:00-13:00 Uhr</span</div>'
// 			var infowindow = new google.maps.InfoWindow({
// 				position: latlng,
// 				map: map,
//
// 				content: cont
// 			});
//
// 			var marker = new google.maps.Marker({
// 				map: map,
// 				position: results[0].geometry.location,
//
// 				icon: image
// 			});
// 		} else {
// 			console.log('Geocode was not successful for the following reason: ' + status);
// 		}
// 	});
// }

function makeMap(map, locations) {
	var marker, i;
	var image = 'img/logogreen.png';
	for (i = 0; i < locations.length; i++) {

		var lat = locations[i][1];
		var long = locations[i][2];
		var content = locations[i][0];
		var tit= locations[i][3];
		console.log(content);
		latlngset = new google.maps.LatLng(lat, long);
		// var infowindow = new google.maps.InfoWindow({
// 			position: latlngset,
// 			map: map,
// 			content: add
// 		});
		 var infowindow = new google.maps.InfoWindow();


		 var marker = new google.maps.Marker({
			  map: map, position: latlngset,icon:image
		  });

		//  map.setCenter(marker.getPosition());
	   google.maps.event.addListener(marker, 'click', (function (marker, content, infowindow) {
 			  return function () {
 				  infowindow.setContent(content);
				  infowindow.open(map, marker);
 			  };
	  })(marker, content, infowindow));

	}
}


//   function setMarkers(map, locations) {
//
// 	  var marker, i
//
// 	  for (i = 0; i < locations.length; i++) {
//
// 		  var loan = locations[i][0]
// 		  var lat = locations[i][1]
// 		  var long = locations[i][2]
// 		  var add = locations[i][3]
//
// 		  latlngset = new google.maps.LatLng(lat, long);
//
// 		  var marker = new google.maps.Marker({
// 			  map: map, title: loan, position: latlngset
// 		  });
// 		  map.setCenter(marker.getPosition())
//
//
// 		  var content = "Loan Number: " + loan + '</h3>' + "Address: " + add
//
// 		  var infowindow = new google.maps.InfoWindow()
//
// 		  google.maps.event.addListener(marker, 'click', (function (marker, content, infowindow) {
// 			  return function () {
// 				  infowindow.setContent(content);
// 				  infowindow.open(map, marker);
// 			  };
// 		  })(marker, content, infowindow));
//
// 	  }
//   }





// Attach a submit handler to the form
$("#contactform").submit(function(event){
	event.preventDefault();
	$('#hint').css(
		'display', 'none'
	);

	 var fd;
	fd = $("#contactform").serializeArray();
	var dataObj={};

	$(fd).each(function(i, field){
	  dataObj[field.name] = field.value;

	  //tmpStr=str.replace(/_/g,' ');
	});
	console.log(fd);

	for(var i=0; i < fd.length; i++) {
	 fd[i].value = fd[i].value.replace(/,/g, ' ');
	}
	var msg=fd[3].value;
	console.log(msg);
	msg=msg.replace(/,/g,' ');
	fd[3].value=msg;
	fd = JSON.stringify(fd);


	console.log('fd',fd);
	if (dataObj['humancheck'] == 'robot') return;
	//console.log(dataObj['humancheck'])
	//var Arr =$("#contactform").serializeArray();
	if (dataObj['fullname'].length < 10) {
		document.getElementById('hint').innerHTML = " Ihr Name ist zu kurz ... ";
		$('#hint').css(
			'display', 'inline'
		);
		return;
	}
	if (dataObj['phone'].length < 5) {
		document.getElementById('hint').innerHTML = " bitte eine gültige Telefonnummer eingeben ... ";
		$('#hint').css(
			'display', 'inline'
		);
		return;
	}

	//console.log('.',dataObj['email'].indexOf('.'));
	if (dataObj['email'].indexOf('.') == -1 || dataObj['email'].indexOf('@') == -1) {
	//if (str.toLowerCase().indexOf("yes") >= 0)
		document.getElementById('hint').innerHTML = " bitte eine gültige Mail-Adresse eingeben ... ";
		$('#hint').css(
			'display', 'inline'
		);
		return;
	}

	if (dataObj['message'].length < 10) {
		document.getElementById('hint').innerHTML = " Ihre Mitteilung ist zu kurz ... ";
		$('#hint').css(
			'display', 'inline'
		);
		return;
	}
       // Stop form from submitting normally
       // Get the values from elements on the page:
    var $form = $(this);
     var result = decodeURIComponent($.param(fd));
    //console.log(result);

    url = "http://ets.syccess.com/test.nsf/bla?OpenAgent&data=" + fd;
   // console.log(fd, url);
    // Send the data using post
    var posting = $.post(url, fd);
    $('#contactform').trigger("reset");
    document.getElementById("message").value = "";
   document.getElementById('hint').innerHTML = " Ihre Mitteilung wurde versendet, vielen Dank.";
   $('#hint').css(
   	'display', 'inline'
   );
    // Put the results in a div
    posting.done(function(data){
        // var content = $( data ).find( "#content" );
        console.log('data', data);
    });
});