
function isMobile() {
	return (navigator.userAgent.match(/\bAndroid|BlackBerry|iPad|iPhone|iPod|webOS|Windows Phone/i));
}


function getCookie(key) {
	var val = "";

	var cookies = document.cookie.split(";");
	for (var i=0; i<cookies.length; i++) {
		var c = cookies[i];
		while (c.charAt(0) == " ")
			c = c.substring(1);

		if (c.indexOf(key) != -1) {
			val = c.split("=")[1];
			break;
		}
	}

	return (val);
}

function refreshCookie(key) {
	setCookie(key, getCookie(key));
}

function setCookie(key, val) {
	if (!val || val.length == 0) {
		deleteCookie(key);

	} else {
		var d = new Date();
		d.setDate(d.getDate() + 365);
		document.cookie = key + "=" + val + "; expires=" + d.toUTCString();
	}
}

function deleteCookie(key) {
	document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function deleteAllCookies() {
	var cookies = document.cookie.split(";");
	for (var i=0; i<cookies.length; i++) {
		setCookie(cookies[i].split("=")[0]);
	}
}


var queryString = {};
window.location.href.replace(
	new RegExp("([^?=&]+)(=([^&]*))?", "g"),
	function($0, $1, $2, $3) { queryString[$1] = $3; }
);



if (!Array.prototype.randElement) {
	Array.prototype.randElement = function () {
		return (this[this.randIndex()]);
	};
}

if (!Array.prototype.randIndex) {
	Array.prototype.randIndex = function () {
		return (Math.floor(Math.random() * this.length));
	};
}

/**
 * Randomizes an array using Fisher–Yates
 */
if (!Array.prototype.shuffle) {
	Array.prototype.shuffle = function () {
		var i = this.length, j, tmp;

		if (i == 0)
			return (this);

		while (--i) {
			j = Math.floor(Math.random() * (i + 1));
			tmp = this[i];
			this[i] = this[j];
			this[j] = tmp;
		}

		return (this);
	};
}


if (!Math.randomInt) {
	Math.randomInt = function (lower, upper) {
		return (this.floor(this.random() * (this.max(lower, upper) - this.min(lower, upper)) + this.min(lower, upper)));
	};
}


if (!Number.prototype.commaFormatted) {
	Number.prototype.commaFormatted = function () {
		return (this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
	};
}


if (!String.prototype.isEmail) {
	String.prototype.isEmail = function () {
		var regex = /^([a-zA-Z0-9_\.\-])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return (regex.test(this));
	};
}


/**
 * Convert a string to HTML entities
 */
if (!String.prototype.toHtmlEntities) {
	String.prototype.toHtmlEntities = function () {
		return this.replace(/./gm, function (s) {
			return "&#" + s.charCodeAt(0) + ";";
		});
	};
}

if (!String.prototype.truncate) {
	String.prototype.truncate = function (amt, ellipsis) {
		return ((this.length > amt) ? (this.substring(0, amt - 1) + ((!ellipsis) ? "…" : "")) : (this));
	};
}

/**
 * Create string from HTML entities
 */
if (!String.prototype.fromHtmlEntities) {
	String.prototype.fromHtmlEntities = function (string) {
		return (string + "").replace(/&#\d+;/gm, function (s) {
			return String.fromCharCode(s.match(/\d+/gm)[0]);
		})
	};
}
