
function createGrid() {
	$.ajax({
		url   : 'http://beta.modd.live/api/live_streamers.php',
		type  : 'GET',
		data  : {
			min_viewers : MIN_VIEWERS,
			max_viewers : MAX_VIEWERS,
			game        : "Hearthstone"
		},
		dataType  : 'json',
		success   : function (response) {
			$.each(response.shuffle(), function(i, item) {
				var html = '<li class="flex-item channel-cell" data-channel="'+item.channel_name+'" data-game="'+item.game_name+'">';
				html += '  <img class="preview-image" src="'+((item.preview_image == "None") ? "/img/404_preview-640x360.jpg" : item.preview_image)+'" />';
				html += '  <div class="channel-info">';
				html += '    <img class="channel-logo" src="'+((item.channel_logo == "None") ? "/img/404_channel_logo.jpg" : item.channel_logo)+'" />';
				html += '    <div class="channel-name">'+item.channel_name+'</div>';
				html += '    <div class="game-name">'+item.game_name+'</div>';
				html += '  </div>';
				html += '</li>';

				$('.channel-grid').append(html);
			});
		}
	});
}

function resetOverlay() {
	setCookie('has_requested', "0");

	deleteCookie('channel');
	deleteCookie('game_name');

	$('.overlay-alert').addClass('is-hidden');
}

function authViewer() {
	console.log("[:] authViewer() [:]");

	// no url fragment
	if (!window.location.hash) {

		// no cookie
		if (getCookie('auth_token').length == 0) {
			location.href = "https://api.twitch.tv/kraken/oauth2/authorize?action=authorize&client_id=dulsl0m2x9zsi8ykb99i1sawmptuima&login=&login_type=login&redirect_uri="+encodeURIComponent(location.protocol + "//" + location.hostname)+"&response_type=token&scope=user_read+chat_login&utf8=%E2%9C%93&force_verify=true";

			// has cookie, signup
		} else {
			submitHelpRequest();
		}

		// has fragment
	} else {
		setCookie('auth_token', window.location.hash.split("&")[0].replace("#access_token=", ""));
		location.href = "/";
	}
}

function submitHelpRequest() {
	console.log("[:] submitHelpRequest() [:]");

	var width = $('.overlay-container').width();
	$('.overlay-title').html(getCookie('channel'));
	$('.overlay-message').html('<div class="overlay-spinner loader-circle"></div>');
	$('.overlay-container').css('width', width + 'px');
	$('.overlay-alert').removeClass('is-hidden');

	$.ajax({
		url         : "https://api.twitch.tv/kraken/user",
		beforeSend  : function (request) {
			request.setRequestHeader('Accept', "application/vnd.twitchtv.v3+json");
			request.setRequestHeader('Authorization', "OAuth " + getCookie('auth_token'));
		},
		dataType  : 'json',
		success   : function(response) {
			setCookie('twitch_name', response.name);

			$.ajax({
				url   : "http://beta.modd.live/api/help_request.php",
				type  : 'POST',
				data  : {
					channel     : getCookie('channel'),
					game_name   : getCookie('game_name'),
					twitch_id   : response._id,
					twitch_name : getCookie('twitch_name'),
					oauth_token : getCookie('auth_token')
				},
				dataType  : 'json',
				success   : function (response) {
					deleteCookie('channel');
					deleteCookie('game_name');

					$('.overlay-title').html(response.channel);
					$('.overlay-message').html('<div>' + ((response.result == "inserted_record") ? 'Success, <span class="channel-alert">' + response.channel + '</span> has been asked to help you with <span class="game-alert">' + response.game_name.replace("\\", "") + '</span>. You will be notified when they are ready.' : (response.result == "existing_record") ? 'You have already asked <span class="channel-alert">' + response.channel + '</span> for help with <span class="game-alert">' + response.game_name.replace("\\", "") + '</span>. You will be notified when they are ready.' : 'Oh oh, something went wrong and wasn\'t possible to ask <span class="channel-alert">'+response.channel+'</span> for help with <span class="game-alert">' + response.game_name.replace("\\", "") + '</span>. Please try again.') + '</div>');
				}
			});
		}
	});
}

// request state
setCookie('has_requested', (getCookie('has_requested') == "1") ? "1" : "0");


var MIN_VIEWERS = 10;
var MAX_VIEWERS = Number.MAX_VALUE;



$(document).ready(function() {

	// reload if oauth error
	if (queryString['error'] == "access_denied") {
		location.href = "/";
	}

	// ui update
	createGrid();
	$('.current-year').text((new Date()).getFullYear());

	// set token & reload
	if (window.location.hash) {
		setCookie('has_requested', "1");
		setCookie('auth_token', window.location.hash.split("&")[0].replace("#access_token=", ""));
		location.href = "/";
	}

	// redirect if auth'ing
	if (getCookie('channel').length != 0 && getCookie('game_name').length != 0 && getCookie('auth_token').length != 0) {
		submitHelpRequest();
	}

	// any cell click
	$(this).on('click', '.channel-cell', function() {
		setCookie('channel', $(this).attr('data-channel'));
		setCookie('game_name', $(this).attr('data-game'));

		$.ajax({
			url   : "http://beta.modd.live/api/help_request.php?check=1",
			type  : 'POST',
			data  : {
				channel     : getCookie('channel'),
				game_name   : getCookie('game_name'),
				twitch_name : getCookie('twitch_name')
			},
			dataType  : 'json',
			success   : function (response) {

				// has record
				if (response.total > 0) {
					deleteCookie('channel');
					deleteCookie('game_name');

					$('.overlay-message').html('<div>You have already asked <span class="channel-alert">' + response.channel + '</span> for help with <span class="game-alert">' + response.game_name.replace("\\", "") + '</span>. You will be notified when they are ready.</div>');

					// no record
				} else {
					$('.overlay-message').html('<div>Are you sure you want to recommend <span class="channel-alert">' + response.channel +'</span> to help you with <span class="game-alert">' + response.game_name.replace("\\", "") + '</span> questions?</div>');
				}

				$('.overlay-title').html(response.channel);
				$('.overlay-alert').removeClass('is-hidden');
			}
		});
	});

	// ok button
	$('.overlay-button').click(function(e) {

		// auth in
		if (getCookie('has_requested') == "0") {
			if (getCookie('auth_token').length == 0) {
				authViewer();

				// already auth
			} else {

				// channel & game set
				if (getCookie('channel').length != 0 && getCookie('game_name').length != 0) {
					submitHelpRequest();

					// close
				} else {
					resetOverlay();
				}
			}

			// close
		} else {
			resetOverlay();
		}
	});

	// close overlay actions
	$('.overlay-alert').click(function(e) {
		if ($(e.target).is('div')) {
			resetOverlay();
		}
	});

	/*
	 window.onbeforeunload = function(e) {
	 alert("window.onbeforeunload - " + e);
	 };

	 // leave page
	 $(window).on('beforeunload', function() {
	 alert("beforeunload");
	 });
	 */
});
