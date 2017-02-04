// components
var outerWrapper = document.getElementById("outerWrapper");
var innerWrapper = document.getElementById("innerWrapper");
//~ var wrapperAddKodiHost = document.getElementById("addKodiHost");
//~ var wrapperDeleteKodiHost = document.getElementById("deleteKodiHost");
var wrapperNoneAddKodiHost = document.getElementById("noneAddKodiHost");
var currentKodiHostWrapper = document.getElementById("currentKodiHostWrapper");
var input = document.getElementById("sendUrlToKodiInput");

var btn = document.getElementById("sendUrlToKodiSubmit");
var btnQueue = document.getElementById("sendUrlToKodiQueueSubmit");

var playlist = document.getElementById("playlist");
var currentlyDragging = false;

var playlistWrapper = document.getElementById("playlistWrapper");

var toggleHistoryLink = document.getElementById("toggleHistoryLink");
var openHistoryImg = document.getElementById("openHistoryImg");
var closeHistoryImg = document.getElementById("closeHistoryImg");
var history = document.getElementById("history");
var historyWrapper = document.getElementById("historyWrapper");

var ifKodiOffline = document.getElementById("ifKodiOffline");
var ifKodiOnline = document.getElementById("ifKodiOnline");
var ifKodiNeedsAuthentication = document.getElementById("ifKodiNeedsAuthentication");

var lastLink = document.getElementById("lastLink");
var rewindLink = document.getElementById("rewindLink");
var playLink = document.getElementById("playLink");
var stopLink = document.getElementById("stopLink");
var forwardLink = document.getElementById("forwardLink");
var nextLink = document.getElementById("nextLink");

var playImg = document.getElementById("playImg");
var pauseImg = document.getElementById("pauseImg");

var progress = document.getElementById("progress");
var progressBar = document.getElementById("progressBar");
var progressBarSpan = document.getElementById("progressBarSpan");

var volume = document.getElementById("volume");
var volumeBar = document.getElementById("volumeBar");
var volumeBarSpan = document.getElementById("volumeBarSpan");
var muteLink = document.getElementById("muteLink");

var kodiUsername = document.getElementById("kodiUsername");
var kodiPassword = document.getElementById("kodiPassword");
var kodiLoginButton = document.getElementById("kodiLoginButton");
var invalidLogin = document.getElementById("invalidLogin");

var spinner = document.getElementById("spinner");
var selectKodiHost = document.getElementById("selectKodiHost");
var addKodiHostBtn = document.getElementById("addKodiHostBtn");
var newKodiHost = document.getElementById("newKodiHost");
var newKodiPort = document.getElementById("newKodiPort");
var submitNewKodiHost = document.getElementById("submitNewKodiHost");
var cancelNewKodiHost = document.getElementById("cancelNewKodiHost");
var invalidHost = document.getElementById("invalidHost");
var invalidPort = document.getElementById("invalidPort");

var delKodiHostBtn = document.getElementById("delKodiHostBtn");
var submitDeleteKodiHost = document.getElementById("submitDeleteKodiHost");
var cancelDeleteKodiHost = document.getElementById("cancelDeleteKodiHost");

function updateKodiHosts(kodiHosts, kodiPorts, selectedKodiHostIndex) {
	var i;
	for(i = selectKodiHost.options.length - 1 ; i >= 0 ; i--) {
		selectKodiHost.remove(i);
	}
	
	kodiHosts.forEach(function(curHost, ind) {
		var curPort = kodiPorts[ind];
		
		var option = document.createElement("option");
		option.text = curHost + ":" + curPort;
		option.value = ind;
		selectKodiHost.appendChild(option);
	});
	
	selectKodiHost.selectedIndex = selectedKodiHostIndex;
}

function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    self.port.emit('playerSeek', x/rect.width, selectKodiHost.value);
}

function getCursorPositionVolume(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    self.port.emit('setVolume', x/rect.width, selectKodiHost.value);
}

selectKodiHost.addEventListener('change', function(event) {
	//~ console.log("selectKodiHostchange");
	showSpinner(selectKodiHost.value);
	self.port.emit('setSelectedKodiHost', selectKodiHost.value);
});

progress.addEventListener('click', function(event) {
	var pos = getCursorPosition(progress, event);
});

volume.addEventListener('click', function(event) {
        showSpinner(selectKodiHost.value);
	var pos = getCursorPositionVolume(volume, event);
});

toggleHistoryLink.addEventListener('click', function(event) {
	if (openHistoryImg.style.display == 'inline-block') {
		openHistoryImg.style.display = 'none';
		closeHistoryImg.style.display = 'inline-block';
		
		history.style.display = 'inline-block';
	} else {
		openHistoryImg.style.display = 'inline-block';
		closeHistoryImg.style.display = 'none';
		
		history.style.display = 'none';
	}
});

input.addEventListener('keypress', function(e) {
	var key = e.which || e.keyCode;
	if (key == 13) {
		showSpinner(selectKodiHost.value);
		self.port.emit("sendURLToKodi", input.value, selectKodiHost.value);
	}
}, false);
		

btn.addEventListener('click', function() {
	//~ console.log("btnclick");
  showSpinner(selectKodiHost.value);
  self.port.emit("sendURLToKodi", input.value, selectKodiHost.value);
	}, false);

btnQueue.addEventListener('click', function() {
	//~ console.log("btnQueueclick");
  showSpinner(selectKodiHost.value);
  self.port.emit("queueURLToKodi", input.value, selectKodiHost.value);
	}, false);

lastLink.addEventListener('click', function() {
	//~ console.log("lastLinkclick");
  showSpinner(selectKodiHost.value);
  self.port.emit("last", selectKodiHost.value);
	}, false);

rewindLink.addEventListener('click', function() {
	//~ console.log("rewindLinkclick");
  showSpinner(selectKodiHost.value);
  self.port.emit("rewind", selectKodiHost.value);
	}, false);

playLink.addEventListener('click', function() {
	//~ console.log("playLinkclick");
  showSpinner(selectKodiHost.value);
  self.port.emit("playPause", selectKodiHost.value);
	}, false);

stopLink.addEventListener('click', function() {
	//~ console.log("stopLinkclick");
  showSpinner(selectKodiHost.value);
  self.port.emit("stop", selectKodiHost.value);
	}, false);

forwardLink.addEventListener('click', function() {
	//~ console.log("forwardLinkclick");
  showSpinner(selectKodiHost.value);
  self.port.emit("forward", selectKodiHost.value);
	}, false);

nextLink.addEventListener('click', function() {
	//~ console.log("nextLinkclick");
  showSpinner(selectKodiHost.value);
  self.port.emit("next", selectKodiHost.value);
	}, false);

muteLink.addEventListener('click', function() {
	//~ console.log("muteLinkclick");
  showSpinner(selectKodiHost.value);
  self.port.emit("toggleMute", selectKodiHost.value);
	}, false);
	
	
kodiLoginButton.addEventListener('click', function() {
	//~ console.log("kodiLoginButtonclick");
	hideWrongLogin(selectKodiHost.value);
	showSpinner(selectKodiHost.value);
	self.port.emit('loginProvided', selectKodiHost.value, kodiUsername.value, kodiPassword.value);
});

addKodiHostBtn.addEventListener('click', function() {
	showAddKodiHostDiv();
	wrapperNoneAddKodiHost.style.display = 'none';
});

delKodiHostBtn.addEventListener('click', function() {
	showDeleteKodiHostDiv();
	wrapperNoneAddKodiHost.style.display = 'none';
});

function hideCurrentKodiHostDiv() {
	currentKodiHostWrapper.style.display = 'none';
}

function showCurrentKodiHostDiv() {
	currentKodiHostWrapper.style.display = 'block';
}

submitNewKodiHost.addEventListener('click', function() {
	var errorEncountered = false;
	
	if (isNaN(newKodiPort.value) || newKodiPort.value == '') {
		invalidPort.style.display = 'block';
		errorEncountered = true;
	} else {
		invalidPort.style.display = 'none';
	}
	
	if (newKodiHost.value == '') {
		invalidHost.style.display = 'block';
		errorEncountered = true;
	} else {
		invalidHost.style.display = 'none';
	}
	
	if (errorEncountered)
		return;
	
	hideAddKodiHostDiv();
	wrapperNoneAddKodiHost.style.display = 'block';
	cancelNewKodiHost.disabled = false;
	self.port.emit('addKodiHost', newKodiHost.value, newKodiPort.value);
	self.port.emit("getKodiHosts");
});

cancelNewKodiHost.addEventListener('click', function() {
	hideAddKodiHostDiv();
	wrapperNoneAddKodiHost.style.display = 'block';
});

submitDeleteKodiHost.addEventListener('click', function() {
	hideDeleteKodiHostDiv();
	wrapperNoneAddKodiHost.style.display = 'block';
	cancelDeleteKodiHost.disabled = false;
	
	self.port.emit('deleteKodiHost', selectKodiHost.value);
	self.port.emit("getKodiHosts");
});

cancelDeleteKodiHost.addEventListener('click', function() {
	hideDeleteKodiHostDiv();
	wrapperNoneAddKodiHost.style.display = 'block';
});

//~ self.port.on("show", function onShow(kodiHost) {
	//~ self.port.emit("getPlaylistItems", kodiHost);
	//~ self.port.emit("getHistoryItems");
	//~ self.port.emit("updateIsPaused", kodiHost);
	//~ self.port.emit("updatePlayerPercentage", kodiHost);
	//~ self.port.emit("updatePlayerTime", kodiHost);
	//~ self.port.emit("updateVolumePercentage", kodiHost);
	//~ self.port.emit("updateIsMuted", kodiHost);
	//~ self.port.emit("getKodiHosts");
	
	//~ triggerHeightChanged();
//~ });

self.port.on('updateKodiHosts', function(kodiHosts, kodiPorts, selectedKodiHost) {
	updateKodiHosts(kodiHosts, kodiPorts, selectedKodiHost);
});

self.port.on('setInputFocus', function() {
	input.select();
});

self.port.on("kodiOffline", function onKodiOffline(kodiHost) {
		//~ console.log("kodiOffline: " + kodiHost);
	if (kodiHost == selectKodiHost.value) {
		hideSpinner(kodiHost);
		ifKodiOffline.style.display = 'block';
		ifKodiOnline.style.display = 'none';
		triggerHeightChanged();
	}
});

self.port.on("kodiOnline", function onKodiOnline(kodiHost) {
		//~ console.log("kodiOnline: " + kodiHost);
	if (kodiHost == selectKodiHost.value) {
		hideSpinner(kodiHost);
		ifKodiOffline.style.display = 'none';
		ifKodiOnline.style.display = 'block';
		triggerHeightChanged();
	}
});

self.port.on("kodiAuthenticated", function onKodiAuthenticated(kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		//~ console.log("kodiAuthenticated");
		hideSpinner(kodiHost);
		ifKodiNeedsAuthentication.style.display = 'none';
		ifKodiAuthenticated.style.display = 'block';
		triggerHeightChanged();
	}
});

self.port.on("kodiNeedsAuthentication", function kodiNeedsAuthentication(kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		//~ console.log("kodiNeedsAuthentication");
		hideSpinner(kodiHost);
		ifKodiAuthenticated.style.display = 'none';
		ifKodiNeedsAuthentication.style.display = 'block';
		triggerHeightChanged();
	}
});

self.port.on("showWrongLogin", function (kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		//~ console.log("showWrongLogin");
		hideSpinner(kodiHost);
		invalidLogin.style.display = 'block';
		triggerHeightChanged();
	}
});

self.port.on("hideWrongLogin", function (kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		//~ console.log("hideWrongLogin");
		hideSpinner(kodiHost);
		hideWrongLogin();
	}
});

function hideWrongLogin() {
	invalidLogin.style.display = 'none';
	triggerHeightChanged();
}

self.port.on("updatePlaylistItems", function updatePlaylistItems(items, kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		if (currentlyDragging)
			return;
		// delete all old items
		while (playlist.firstChild) {
		    playlist.removeChild(playlist.firstChild);
		}
		if (items.length > 0) {
			playlistWrapper.style.display = 'block';
			var pos = 0;
			for (var item in items) {
				var liElem = document.createElement("li");
				liElem.appendChild(document.createTextNode(items[item]));
				
				playlist.appendChild(liElem);
				pos++;
			}
		} else {
			playlistWrapper.style.display = 'none';
		}
		triggerHeightChanged();
	}
});

self.port.on("updateHistoryItems", function (items) {
	// delete all old items
	while (history.firstChild) {
	    history.removeChild(history.firstChild);
	}
	
	if (items.length > 0)
		historyWrapper.style.display = 'block';
	else
		historyWrapper.style.display = 'none';
	
	var pos = items.length-1;
	var count = 0;
	while (pos >= 0) {
		var item = items[pos];
		var liElem = document.createElement("li");
		var link = document.createElement('a');
		var text = truncate(item, 35, "...");
		var textNode = document.createTextNode(text);
		link.appendChild(textNode);
		link.title = text;
		link.href = "#";
		link.fullHref = item;
		
		
		link.addEventListener('click', function(event) {
			var target = event.target || event.srcElement;
			input.value = target.fullHref;
			input.select();
		}, false);
		
		liElem.appendChild(link);
		
		history.appendChild(liElem);
		pos--;
		count++;
		if (count >= 10)
			break;
	}
	triggerHeightChanged();
});

var truncate = function (fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr;

    separator = separator || '...';

    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);

    return fullStr.substr(0, frontChars) + 
           separator + 
           fullStr.substr(fullStr.length - backChars);
};

self.port.on('playerPauseStatus', function(isPlaying, kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		//~ console.log("playerPauseStatus");
		hideSpinner(kodiHost);
		if (isPlaying) {
			playImg.style.display = 'none';
			pauseImg.style.display = 'inline-block';
		} else {
			pauseImg.style.display = 'none';
			playImg.style.display = 'inline-block';
		}
	}
});

self.port.on('playerPercentage', function(percentage, kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		progressBar.setAttribute("aria-valuenow", percentage);
		progressBar.style.width = percentage + "%";
	}
});


self.port.on('volumePercentage', function(percentage, kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		volumeBar.setAttribute("aria-valuenow", percentage);
		volumeBar.style.width = percentage + "%";
		
		while (volumeBarSpan.firstChild) {
		    volumeBarSpan.removeChild(volumeBarSpan.firstChild);
		}
		
		volumeBarSpan.appendChild(document.createTextNode(percentage + "%"));
	}
});

self.port.on('muteStatus', function(isMuted, kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		//~ console.log("muteStatus");
		hideSpinner(kodiHost);
		if (isMuted) {
			soundImg.style.display = 'none';
			muteImg.style.display = 'inline-block';
		} else {
			muteImg.style.display = 'none';
			soundImg.style.display = 'inline-block';
		}
	}
});

self.port.on('showSpinner', showSpinner);
self.port.on('hideSpinner', hideSpinner);

function hideInnerWrapper() {
	innerWrapper.style.display = "none";
}

function showInnerWrapper(kodiHost) {
	innerWrapper.style.display = "block";
}

function showSpinner(kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		//~ console.log("showSpinner " + kodiHost);
		spinner.style.display = 'block';
		//hideInnerWrapper(kodiHost);
	}
}

function hideSpinner(kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		//~ console.log("hideSpinner " + kodiHost);
		spinner.style.display = 'none';
		//showInnerWrapper(kodiHost);
	}
}

self.port.on('triggerAddKodiHostShow', triggerAddKodiHostShow);

function triggerAddKodiHostShow() {
	showAddKodiHostDiv();
	wrapperNoneAddKodiHost.style.display = 'none';
	cancelNewKodiHost.disabled = true;
}

function showAddKodiHostDiv() {
	addKodiHost.style.display = 'block';
}

function hideAddKodiHostDiv() {
	addKodiHost.style.display = 'none';
}

function showDeleteKodiHostDiv() {
	deleteKodiHost.style.display = 'block';
}

function hideDeleteKodiHostDiv() {
	deleteKodiHost.style.display = 'none';
}

self.port.on('playerTime', function(time, kodiHost) {
	if (kodiHost == selectKodiHost.value) {
		while (progressBarSpan.firstChild) {
		    progressBarSpan.removeChild(progressBarSpan.firstChild);
		}
		
		progressBarSpan.appendChild(document.createTextNode(time));
	}
});

function triggerHeightChanged() {
	self.port.emit('resize', getAbsoluteHeight(outerWrapper)+30);
}

function getAbsoluteHeight(el) {
  // Get the DOM Node if you pass in a string
  el = (typeof el === 'string') ? document.querySelector(el) : el; 

  var styles = window.getComputedStyle(el);
  var margin = parseFloat(styles['marginTop']) +
               parseFloat(styles['marginBottom']);

  return Math.ceil(el.offsetHeight + margin);
}