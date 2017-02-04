//
// VARIABLES
//

var self = require("sdk/self");

/*
* We add a button to the toolbar, which we can use to enter the video URL and change the kodi host + port configuration.
*/
var { ToggleButton } = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var { setInterval, clearInterval } = require("sdk/timers");

var button = ToggleButton({
    id: "my-button",
    label: "Play URL On Kodi",
    icon: {
      "16": "./kodi-16.png",
      "32": "./kodi-32.png",
      "64": "./kodi-64.png"
    },
    onChange: handleChange,
    badge: "",
    badgeColor: "#00AAAA"
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

var firstAuthenticationCheck = {};
var kodiWrongLogin = {};
var kodiNeedsAuthentication = {};
var kodiOnline = {};
var collectedRequests = {};
	
for (var i = 0; i < getAllKodiHosts().length; i++) {
	firstAuthenticationCheck[i] = true;
	kodiWrongLogin[i] = false;
	kodiNeedsAuthentication[i] = false;
	kodiOnline[i] = false;
	collectedRequests[i] = [];
}

var postRequestsIntervalID = setInterval(postCollectedRequests, 200);
  
var panel = panels.Panel({
  contentURL: self.data.url("panel.html"),
  contentScriptFile: [self.data.url("panel-submit.js")],
  contentStyleFile: self.data.url("bootstrap.css"),
  onHide: handleHide,
  height: 0
});

function handleHide() {
  button.state('window', {checked: false});
}

var Request = require("sdk/request").Request;

//
// TIMERS
//
var intervalGetActiveVidePlayerId = -1;
var intervalGetPlayerItems = -1;
var intervalGetPlayerPositions = -1;
var intervalGetVideoPlaylists = -1;
var intervalGetLoginsPresent = -1;
var intervalGetUsernames = -1;
var intervalGetPasswords = -1;

var activeVideoPlayerIDs = {}
var playerItems = {}
var playerPositions = {}
var videoPlaylists = {}
var loginsPresent = {};
var usernames = {};
var passwords = {};

initTimers();
	
function initTimers() {
	if (getAllKodiHosts().length == 0)
		return;
	
	activeVideoPlayerIDs = {}
	playerItems = {}
	playerPositions = {}
	videoPlaylists = {}
	loginsPresent = {};
	usernames = {};
	passwords = {};
		
	function getActivePlayerIdCurrentHost() {
		var kodiHost = getSelectedKodiHost();
		
		if (kodiHost == -1)
			return;
		
		getActiveVidePlayerId(function(playerId, kodiHost) {
			activeVideoPlayerIDs[kodiHost] = playerId;
		}, kodiHost);
	}
	
	getActivePlayerIdCurrentHost();
	
	if (intervalGetActiveVidePlayerId != -1)
		clearInterval(intervalGetActiveVidePlayerId);
	intervalGetActiveVidePlayerId = setInterval(getActivePlayerIdCurrentHost, 1000);

	function getPlayerItemsCurrentHost() {
		var kodiHost = getSelectedKodiHost();
		
		if (kodiHost == -1)
			return;
		
		var playerId = activeVideoPlayerIDs[kodiHost];
		
		if (typeof playerId == 'undefined') {
			playerItems[kodiHost] = undefined;
			return;
		}
		
		getPlayerItem(playerId, function(firstItemTitle, kodiHost) {
			playerItems[kodiHost] = firstItemTitle;
		}, kodiHost);
	}
	
	getPlayerItemsCurrentHost();
	
	if (intervalGetPlayerItems != -1)
		clearInterval(intervalGetPlayerItems);
	intervalGetPlayerItems = setInterval(getPlayerItemsCurrentHost, 1000);
	
	function getPlayerPositionCurrentHost() {
		var kodiHost = getSelectedKodiHost();
		
		if (kodiHost == -1)
			return;
		
		var playerId = activeVideoPlayerIDs[kodiHost];
		
		if (typeof playerId == 'undefined') {
			playerPositions[kodiHost] = -1;
			return;
		}
		
		getPlayerPosition(playerId, function(position, kodiHost) {
			playerPositions[kodiHost] = position;
		}, kodiHost);
	}
	
	getPlayerPositionCurrentHost();

	if (intervalGetPlayerPositions != -1)
		clearInterval(intervalGetPlayerPositions);
	intervalGetPlayerPositions = setInterval(getPlayerPositionCurrentHost, 1000);

	function getVideoPlaylistIdCurrentHost() {
		var kodiHost = getSelectedKodiHost();
		
		if (kodiHost == -1)
			return;
		
		getVideoPlaylistId(function(playlistId, kodiHost) {
			videoPlaylists[kodiHost] = playlistId;
		}, kodiHost);
	}
	
	getVideoPlaylistIdCurrentHost();
	
	if (intervalGetVideoPlaylists != -1)
		clearInterval(intervalGetVideoPlaylists);
	intervalGetVideoPlaylists = setInterval(getVideoPlaylistIdCurrentHost, 1000);
	
	function isLoginPresentCurrentHost() {
		var kodiHost = getSelectedKodiHost();
		
		if (kodiHost == -1)
			return;

		isLoginPresent(kodiHost, function(isPresent) {
			loginsPresent[kodiHost] = isPresent;
		});
	}
	
	isLoginPresentCurrentHost();

	if (intervalGetLoginsPresent != -1)
		clearInterval(intervalGetLoginsPresent);
	intervalGetLoginsPresent = setInterval(isLoginPresentCurrentHost, 1000);
	
	function getUsernameCurrentHost() {
		var kodiHost = getSelectedKodiHost();
		
		if (kodiHost == -1)
			return;
		
		if (!loginsPresent[kodiHost])
			return;


		getUsernameFromStore(kodiHost, function(username) {
			usernames[kodiHost] = username;
		});
	}
	
	getUsernameCurrentHost();
			
	if (intervalGetUsernames != -1)
		clearInterval(intervalGetUsernames);
	intervalGetUsernames = setInterval(getUsernameCurrentHost, 1000);
	
	function getPasswordCurrentHost() {
		var kodiHost = getSelectedKodiHost();
		
		if (kodiHost == -1)
			return;
		
		if (!loginsPresent[kodiHost])
			return;


		getPasswordFromStore(kodiHost, function(pw) {
			passwords[kodiHost] = pw;
		});
	}
	
	getPasswordCurrentHost();

	if (intervalGetPasswords != -1)
		clearInterval(intervalGetPasswords);
	intervalGetPasswords = setInterval(getPasswordCurrentHost, 1000);
}
			





//
// INIT PANEL
//

sendKodiHostsToPanel();
onPanelNotVisible();
var panelShowingRefreshIntervalID = -1;






//
// PREFERENCE HANDLING
//

function addItemToHistory(item) {
	var old = require("sdk/simple-prefs").prefs.kodihistory;
	
	var split = old.split('\n').slice(0, -1);
	if (split.length > 9) {
		split = split.slice(Math.max(split.length - 9, 1));
		old = ""
		for (url in split) {
			old = old + split[url] + "\n";
		}
	}
	
	require("sdk/simple-prefs").prefs.kodihistory = old + item + "\n";
}

function getAllKodiHosts() {
	var str = require("sdk/simple-prefs").prefs.kodihost;
	if (str == "") {
		return [];
	}
	return str.split("\n");
}

function getKodiHost() {
	return getAllKodiHosts()[getSelectedKodiHost()];
}

function getAllKodiPorts() {
	var str = require("sdk/simple-prefs").prefs.kodiport;
	if (str == "") {
		return [];
	}
	return str.split("\n");
}

function getKodiPort() {
	return getAllKodiHosts()[getSelectedKodiHost()];
}

function getSelectedKodiHost() {
	return require("sdk/simple-prefs").prefs.selectedkodihost;
}

function addKodiHost(host, port) {
	var oldHost = require("sdk/simple-prefs").prefs.kodihost;
	if (oldHost == "") {
		require("sdk/simple-prefs").prefs.kodihost = host;
	} else {
		require("sdk/simple-prefs").prefs.kodihost = oldHost + "\n" + host;
	}
	
	var oldPort = require("sdk/simple-prefs").prefs.kodiport;
	if (oldPort == "") {
		require("sdk/simple-prefs").prefs.kodiport = port;
	} else {
		require("sdk/simple-prefs").prefs.kodiport = oldPort + "\n" + port;
	}
	collectedRequests[getAllKodiHosts().length-1] = []
	
	if (getSelectedKodiHost() == -1)
		setSelectedKodiHost(0)
}

function deleteKodiHost(kodiHost) {
	//~ console.log(kodiHost);
	var oldHost = require("sdk/simple-prefs").prefs.kodihost;
	if (oldHost != "") {
		var hostSplit = oldHost.split("\n");
		hostSplit.splice(kodiHost, 1);
		require("sdk/simple-prefs").prefs.kodihost = hostSplit.join("\n");
	}
	
	var oldPort = require("sdk/simple-prefs").prefs.kodiport;
	if (oldPort != "") {
		var portSplit = oldPort.split("\n");
		portSplit.splice(kodiHost, 1);
		require("sdk/simple-prefs").prefs.kodiport = portSplit.join("\n");
	}
	collectedRequests = {};
	setSelectedKodiHost(Math.min(kodiHost,getAllKodiHosts().length-1));
		
	if (getAllKodiHosts().length == 0) {
		return;
	}
	
	sendKodiHostsToPanel();
}

function getKodiHistory() {
	return require("sdk/simple-prefs").prefs.kodihistory;
}

function getKodiHistoryItems() {
	var kodiHistoryString = getKodiHistory();
	if (kodiHistoryString == "")
		return [];
	return kodiHistoryString.split('\n').slice(0, -1);
}

function isLoginPresent(kodiServerId, callback) {
  require("sdk/passwords").search({
    url: require("sdk/self").uri,
    realm: getRealm(kodiServerId),
    onComplete: function onComplete(credentials) {
	callback(credentials.length > 0);
      }
    });
}

function getUsernameFromStore(kodiServerId, callback) {
  require("sdk/passwords").search({
    url: require("sdk/self").uri,
    realm: getRealm(kodiServerId),
    onComplete: function onComplete(credentials) {
      credentials.forEach(function(credential) {
	      callback(credential.username);
	      return;
        });
      }
    });
}

function getPasswordFromStore(kodiServerId, callback) {
  require("sdk/passwords").search({
    url: require("sdk/self").uri,
    realm: getRealm(kodiServerId),
    onComplete: function responseGetPasswordFromStore (credentials) {
      credentials.forEach(function credentialsFound (credential) {
	      callback(credential.password);
	      return;
        });
      }
    });
}

function loginProvided(kodiServerId, username, password) {
	// remove old credentials if present
	require("sdk/passwords").search({
		url: require("sdk/self").uri,
		realm: getRealm(kodiServerId),
		onComplete: function onComplete(credentials) {
			if (credentials.length == 0) {
				// no old credentials
				require("sdk/passwords").store({
				  realm: getRealm(kodiServerId),
				  username: username,
				  password: password,
				});
			} else {
				require("sdk/passwords").remove({
				  url: require("sdk/self").uri,
				  realm: getRealm(kodiServerId),
				  username: credentials[0].username,
				  password: credentials[0].password,
				  onComplete: function onComplete() {
					require("sdk/passwords").store({
					  realm: getRealm(kodiServerId),
					  username: username,
					  password: password,
					});
				  }
				});
			}
			
		}
	});
}

function getRealm(kodiServerId) {
	// TODO
	return "kodi login " + getKodiHost() + ":" + getKodiPort();
}







//
// SEND REQUESTS TO KODI
//

function testWhetherKodiOnline(kodiHost) {
	if (kodiHost >= getAllKodiHosts().length)
		return;
	
	saveRequest('{ "jsonrpc": "2.0", "method": "Player.GetActivePlayers", "params": {}, "id": 1 }', function(response) {
		if(response.status==0||response.status==504) {
			//~ console.log("kodi offline ... ");
			//~ console.log(response.status);
			//~ console.trace();
			kodiOnline[kodiHost] = false;
			kodiOnline[kodiHost] = false;
			panel.port.emit("kodiOffline", kodiHost);
		}
		else {
			kodiOnline[kodiHost] = true
			panel.port.emit("kodiOnline", kodiHost);
		}
	}, kodiHost);
}

/*
* Send a video URL to kodi and play it immeditately.
*/
function sendURLToKodi(url, kodiHost) {
	//~ console.log("sendURLToKodi: " + kodiHost);
	if (isYoutubeURL(url)) {
		url = getYoutubePluginPath(url);
	}
	var videoPlaylistId = videoPlaylists[kodiHost];
	// make sure, that we stop the video player before we add the item, such that these downstream functions start the playlist
	clearPlaylist(videoPlaylistId, function(videoPlaylistId) {
		// on active video player
		checkActiveVideoPlayer(function(videoPlayerId) {
			stopPlayer(videoPlayerId,
				// after we have stopped the player, add URL to playlist
				function() {
					addURLToPlaylist(videoPlaylistId, url, ensurePlaylistStarted, kodiHost);
				}, kodiHost
			);
		},
		// no active video player
		function() {
			addURLToPlaylist(videoPlaylistId, url, ensurePlaylistStarted, kodiHost);
		}, kodiHost);
	}, kodiHost);
}

/*
* Queue a video URL in the video playlist of kodi.
* If the video playlist is currently not being played, it will be after the URL is added to it.
*/
function queueURLToKodi(url, kodiHost) {
	// get playlists
	
	var videoPlaylistId = videoPlaylists[kodiHost];
	addURLToPlaylist(videoPlaylistId, url, ensurePlaylistStarted, kodiHost);
}

function ensurePlaylistStarted(videoPlaylistId, kodiHost) {
	// handle adding new video approprioately depending on whether we are currently playing videos;
	checkActiveVideoPlayer(
		// on active video player
		function(videoPlayerId) {
			checkPlayerIsPlayingPlaylist(videoPlayerId, videoPlaylistId, 
				// playlist is not being played
				function(videoPlayerId, videoPlaylistId) {
					startPlaylist(videoPlaylistId, kodiHost);
				}, kodiHost);
		}, 
		// no active video player
		function() {
			startPlaylist(videoPlaylistId, kodiHost);
		}, kodiHost);
}


function addURLToPlaylist(videoPlaylistId, url, onAdded, kodiHost) {
	//~ console.log("addURLToPlaylist: " + kodiHost);
	if (isYoutubeURL(url)) {
		url = getYoutubePluginPath(url);
	}
	// add url to video playlist
	saveRequest('{ "jsonrpc": "2.0", "method": "Playlist.Add", "params": {"playlistid": ' + videoPlaylistId + ', "item": {"file": "' + url + '"}}, "id": 1 }',
	  function (response) {
		if (response.json.result != "OK") {
			return;
		}
		
		onAdded(videoPlaylistId, kodiHost);
	  }, kodiHost);
}

function getVideoPlaylistId(onComplete, kodiHost) {
	//~ console.log("getVideoPlaylistId: " + kodiHost);
	saveRequest('{ "jsonrpc": "2.0", "method": "Playlist.GetPlaylists", "params": {}, "id": 1 }',
	  function (response) {
		if (response.status == 401) {
			return;
		}
		res = response;
		
		var videoPlaylistId = -1;
		for (var key in res.json.result) {
			  if (res.json.result.hasOwnProperty(key)) {
				if (res.json.result[key].type == "video") {
					videoPlaylistId = res.json.result[key].playlistid;
					break;
				}
			  }
		}
		onComplete(videoPlaylistId, kodiHost);
	  }, kodiHost);
}

function getPlayerPosition(playerId, callback, kodiHost) {
	if (typeof playerId == 'undefined') {
		callback(playerId);
		return;
	}
	saveRequest('{ "jsonrpc": "2.0", "method": "Player.getProperties", "params": {"playerid": ' + playerId + ', "properties": ["position"]}, "id": 1 }',
	  function (response) {
		if (response.status == 401) {
			return;
		}
		callback(response.json.result.position, kodiHost);
	  }, kodiHost);
}

function getPlayerItem(playerId, callback, kodiHost) {
	//~ console.log("getPlayerItem: " + kodiHost);
	if (typeof playerId == 'undefined') {
		callback(playerId, kodiHost);
		return;
	}
	saveRequest('{"jsonrpc": "2.0", "method": "Player.GetItem", "params": { "properties": ["file", "title"], "playerid": ' + playerId + ' }, "id": 1}',
	  function (response) {
		//~ console.log("getPlayerItem RESPONSE: " + kodiHost);
		if (response.status == 401) {
			return;
		}
		  
		if (response.json.result.item.title != "") {
			callback(response.json.result.item.title, kodiHost);
		} else if (response.json.result.item.label != "") {
			callback(response.json.result.item.label, kodiHost);
		} else if (response.json.result.item.file != "") {
			if (isYoutubePluginURL(response.json.result.item.file)) {
				var youtubeVidId = extractYoutubePluginVideoID(response.json.result.item.file);
				callback("Youtube Video: " + youtubeVidId, kodiHost);
			} else {
				callback(response.json.result.item.file, kodiHost);
			}
			callback(response.json.result.item.file, kodiHost);
		} else {
			callback("URL unknown", kodiHost);
		}
		}, kodiHost);
}

function getPlaylistItems(fromPosition, playlistId, callback, kodiHost) {
	saveRequest('{ "jsonrpc": "2.0", "method": "Playlist.GetItems", "params": {"playlistid": ' + playlistId + ', "properties": ["file", "title"]}, "id": 1 }',
	  function (response) {
		if (response.status == 401) {
			return;
		}
		
		var items = [];
		var i = 0;
		for (var item in response.json.result.items) {
			if (i >= fromPosition) {
				if (response.json.result.items[item].title != "") {
					items.push(response.json.result.items[item].title);
				} else if (response.json.result.items[item].label != "") {
					items.push(response.json.result.items[item].label);
				} else if (response.json.result.items[item].file != "") {
					if (isYoutubePluginURL(response.json.result.items[item].file)) {
						var youtubeVidId = extractYoutubePluginVideoID(response.json.result.items[item].file);
						items.push("Youtube Video: " + youtubeVidId);
					} else {
						items.push(response.json.result.items[item].file);
					}
				} else {
					callback("URL unknown", kodiHost);
				}
			}
			i = i + 1;
		}
		callback(playlistId, items, kodiHost);
	  }, kodiHost);
}

function movePlaylistItem(playlistId, oldPosition, newPosition, kodiHost) {
	if (oldPosition == newPosition)
		return;
	
	var targetPosition;
	if (oldPosition < newPosition)
		targetPosition = oldPosition+1;
	else
		targetPosition = oldPosition-1;
	
	saveRequest('{ "jsonrpc": "2.0", "method": "Playlist.Swap", "params": {"playlistid": ' + playlistId + ', "position1": ' + oldPosition + ', "position2": ' + targetPosition + '}, "id": 1 }',
	  function (response) {
		if (response.status == 401) {
			return;
		}
		
		movePlaylistItem(playlistId, targetPosition, newPosition, kodiHost);
	  }, kodiHost);
}

function clearPlaylist(playlistId, onComplete, kodiHost) {
	//~ console.log("clearPlaylist: " + kodiHost);
	saveRequest('{ "jsonrpc": "2.0", "method": "Playlist.Clear", "params": {"playlistid": ' + playlistId + '}, "id": 1 }',
	  function (response) {
		if (response.status == 401) {
			return;
		}
		
		onComplete(playlistId, kodiHost);
	  }, kodiHost);
}

function getActiveVidePlayerId(callback, kodiHost) {
	//~ console.log("getActiveVidePlayerId: " + kodiHost);
	//console.trace();
	saveRequest('{ "jsonrpc": "2.0", "method": "Player.GetActivePlayers", "params": {}, "id": 1 }',
	  function (response) {
		//~ console.log("getActiveVidePlayerId RESPONSE: " + kodiHost);
		if (response.status == 401) {
			callback(undefined, kodiHost);
			return;
		}
		//console.log("response getActiveVidePlayerId: " + response.status + " " + JSON.stringify(response.json));
		// get video player
		var videoPlayerId = undefined;
		for (var key in response.json.result) {
			  if (response.json.result.hasOwnProperty(key)) {
				if (response.json.result[key].type == "video") {
					videoPlayerId = response.json.result[key].playerid;
					break;
				}
			  }
		}
		callback(videoPlayerId, kodiHost);
	  }, kodiHost);
}


function stopPlayer(playerId, callback, kodiHost) {
	//~ console.log("stopPlayer: " + kodiHost);
	saveRequest('{ "jsonrpc": "2.0", "method": "Player.Stop", "params": {"playerid": ' + playerId + '}, "id": 1 }',
	  function (response) {
		if (response.status == 401) {
			return;
		}
		callback(kodiHost);
	  }, kodiHost);
}

function checkPlayerIsPlayingPlaylist(videoPlayerId, videoPlaylistId, onNotPlaying, kodiHost) {
	if (typeof videoPlayerId == 'undefined') {
		return;
	}
	saveRequest('{ "jsonrpc": "2.0", "method": "Player.GetProperties", "params": {"playerid":' + videoPlayerId + ', "properties": ["playlistid","position"]}, "id": 1 }',
	  function (response) {
		if (response.status == 401) {
			return;
		}
		
		if (typeof response.json.result == 'undefined') {
			return;
		}

		if (!response.json.result.hasOwnProperty("playlistid") || !response.json.result.hasOwnProperty("position") || response.json.result.position == -1 || response.json.result.playlistid != videoPlaylistId) {
			onNotPlaying(videoPlayerId, videoPlaylistId, kodiHost);
		}
	  }, kodiHost);
}

function startPlaylist(videoPlaylistId, kodiHost) {
	saveRequest('{ "jsonrpc": "2.0", "method": "Player.Open", "params": {"item": {"playlistid": ' + videoPlaylistId + '}}, "id": 1 }',
	  function (response) {
	  }, kodiHost);
}

/*
   Playback control requests
*/
function last(kodiHost) {
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	if (typeof videoPlayerId == 'undefined') {
		return;
	}

	saveRequest('{ "jsonrpc": "2.0", "method": "Player.Move", "params": {"playerid": ' + videoPlayerId + ', "direction": "left"}, "id": 1 }',
	  function (response) {
	  }, kodiHost);
}

function rewind(kodiHost) {
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	if (typeof videoPlayerId == 'undefined') {
		return;
	}
	getPlayerSpeed(videoPlayerId, function(speed) {
		var newSpeed;
		if (speed == -32 || speed == 0)
			return;
		if (speed == 1)
			newSpeed = -1;
		if (speed > 1)
			newSpeed = speed/2;
		if (speed <= -1)
			newSpeed = speed*2;
		saveRequest('{ "jsonrpc": "2.0", "method": "Player.SetSpeed", "params": {"playerid": ' + videoPlayerId + ', "speed": ' + newSpeed + '}, "id": 1 }',
		  function (response) {
		  }, kodiHost
		);
	}, kodiHost);
}


function getPlayerSpeed(videoPlayerId, callback, kodiHost) {
	if (typeof videoPlayerId == 'undefined') {
		callback(undefined, kodiHost);
		return;
	}
	//~ console.log("getPlayerSpeed");
	//~ console.log(videoPlayerId);
	//~ console.log(typeof videoPlayerId);

	saveRequest('{ "jsonrpc": "2.0", "method": "Player.GetProperties", "params": {"playerid": ' + videoPlayerId + ', "properties": ["speed"]}, "id": 1 }',
	  function (response) {
		if (response.status == 401) {
			return;
		}
		callback(response.json.result.speed, kodiHost);
	  }, kodiHost);
}

function playPause(kodiHost) {
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	if (typeof videoPlayerId == 'undefined') {
		return;
	}

	saveRequest('{ "jsonrpc": "2.0", "method": "Player.PlayPause", "params": {"playerid": ' + videoPlayerId + '}, "id": 1 }',
	  function (response) {
	  }, kodiHost
	);
}

function stop(kodiHost) {
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	if (typeof videoPlayerId == 'undefined') {
		return;
	}
	

	saveRequest('{ "jsonrpc": "2.0", "method": "Player.Stop", "params": {"playerid": ' + videoPlayerId + '}, "id": 1 }',
	  function (response) {
	  }, kodiHost
	);
}

function forward(kodiHost) {
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	if (typeof videoPlayerId == 'undefined') {
		return;
	}
	getPlayerSpeed(videoPlayerId, function(speed) {
		var newSpeed;
		if (speed == 32 || speed == 0)
			return;
		if (speed == -1)
			newSpeed = 1;
		if (speed < -1)
			newSpeed = speed/2;
		if (speed >= 1)
			newSpeed = speed*2;
		saveRequest('{ "jsonrpc": "2.0", "method": "Player.SetSpeed", "params": {"playerid": ' + videoPlayerId + ', "speed": ' + newSpeed + '}, "id": 1 }',
		  function (response) {
		  }, kodiHost
		);
	}, kodiHost);
}

function next(kodiHost) {
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	if (typeof videoPlayerId == 'undefined') {
		return;
	}
	

	saveRequest('{ "jsonrpc": "2.0", "method": "Player.Move", "params": {"playerid": ' + videoPlayerId + ', "direction": "right"}, "id": 1 }',
	  function (response) {
	  }, kodiHost
	);
}

function getPlayerPercentage(videoPlayerId, callback, kodiHost) {
	if (typeof videoPlayerId == 'undefined') {
		return;
	}
	
	saveRequest('{ "jsonrpc": "2.0", "method": "Player.GetProperties", "params": {"playerid": ' + videoPlayerId + ', "properties": ["percentage"]}, "id": 1 }',
		function (response) {
			if (response.status == 401) {
				return;
			}
			callback(response.json.result.percentage, kodiHost);
	  }, kodiHost);
}


function getPlayerTime(videoPlayerId, callback, kodiHost) {
	if (typeof videoPlayerId == 'undefined') {
		return;
	}
	
	saveRequest('{ "jsonrpc": "2.0", "method": "Player.GetProperties", "params": {"playerid": ' + videoPlayerId + ', "properties": ["time", "totaltime"]}, "id": 1 }',
		function (response) {
			if (response.status == 401) {
				return;
			}
			var timeStr = "";
			if (response.json.result.time.hours > 0)
				timeStr += response.json.result.time.hours + "h ";
			if (response.json.result.time.minutes < 10)
				timeStr += "0";
			timeStr += response.json.result.time.minutes + ":";
			if (response.json.result.time.seconds < 10)
				timeStr += "0";
			timeStr += response.json.result.time.seconds;
			
			timeStr += " / ";
			
			if (response.json.result.totaltime.hours > 0)
				timeStr += response.json.result.totaltime.hours + "h ";
			if (response.json.result.totaltime.minutes < 10)
				timeStr += "0";
			timeStr += response.json.result.totaltime.minutes + ":";
			if (response.json.result.totaltime.seconds < 10)
				timeStr += "0";
			timeStr += response.json.result.totaltime.seconds;

			callback(timeStr, kodiHost);
		}, kodiHost
	);
}


function playerSeek(videoPlayerId, percentage, kodiHost) {
	if (typeof videoPlayerId == 'undefined') {
		return;
	}
	
	if (percentage < 0)
		percentage = 0;
	if (percentage > 1)
		percentage = 1;
	
	saveRequest('{ "jsonrpc": "2.0", "method": "Player.Seek", "params": {"playerid": ' + videoPlayerId + ', "value": {"percentage": ' + percentage*100 + '}}, "id": 1 }', 
		null, kodiHost);
}

function getVolumePercentage(callback, kodiHost) {
	saveRequest('{ "jsonrpc": "2.0", "method": "Application.GetProperties", "params": {"properties": ["volume"]}, "id": 1 }', function (response) {
		if (response.status != 401) {
			callback(response.json.result.volume, kodiHost);
		}
	  }, kodiHost);
}

function setVolume(percentage, kodiHost) {
	//~ console.log(percentage + " " + kodiHost);
	if (percentage < 0)
		percentage = 0;
	if (percentage > 1)
		percentage = 1;
	
	saveRequest('{ "jsonrpc": "2.0", "method": "Application.SetVolume", "params": {"volume": ' + Math.round(percentage*100) + '}, "id": 1 }', function(res) {}, kodiHost);
}

function isMuted(callback, kodiHost) {
	saveRequest('{ "jsonrpc": "2.0", "method": "Application.GetProperties", "params": {"properties": ["muted"]}, "id": 1 }',
		function (response) {
			if (response.status != 401) {
				callback(response.json.result.muted, kodiHost);
			}
		}, kodiHost);
}

function toggleMute(kodiHost) {
	isMuted(function(isMuted, kodiHost) {
		saveRequest('{ "jsonrpc": "2.0", "method": "Application.SetMute", "params": {"mute": ' + !isMuted + '}, "id": 1 }', null, kodiHost);
	}, kodiHost);
}


function startMovePlaylistItem(oldPosition, newPosition, kodiHost) {
	var playerId = activeVideoPlayerIDs[kodiHost];
	var position = playerPositions[kodiHost];
	var playlistId = videoPlaylists[kodiHost];
	movePlaylistItem(playlistId, oldPosition + position, newPosition + position);
}

function checkActiveVideoPlayer(onActiveVideoPlayer, onNoActiveVideoPlayer, kodiHost) {
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	// check whether we have an active video player; if not, we just start the playlist
	if (typeof videoPlayerId == 'undefined') {
		onNoActiveVideoPlayer(kodiHost);
		return;
	}
	
	// check whether player plays this playlist
	onActiveVideoPlayer(videoPlayerId, kodiHost);
}

function checkIsPaused(callback, kodiHost) {
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	
	if (typeof videoPlayerId == 'undefined')
		return;
	
	getPlayerSpeed(videoPlayerId, function(speed) {
		callback(speed == 0, kodiHost);
	}, kodiHost);
}

function checkIsPlaying(callback, kodiHost) {
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	
	if (typeof videoPlayerId == 'undefined')
		return;
	
	getPlayerSpeed(videoPlayerId, function(speed) {
		callback(speed == 1, kodiHost);
	}, kodiHost);
}







//
// PANEL EVENTS
//


panel.on("show", onPanelVisible);
panel.on("hide", onPanelNotVisible);

function onPanelVisible() {
	panel.port.emit('setInputFocus');
	clearInterval(panelShowingRefreshIntervalID);
	panelShowingRefreshIntervalID = -1;
	
	// do it once now
	onPanelVisibleHelper();
	panelShowingRefreshIntervalID = setInterval(onPanelVisibleHelper, 1000);
}

function onPanelVisibleHelper() {
	//testWhetherKodiOnline();
	//panel.port.emit("show");
	updateAllOnPanel();
}

function updateAllOnPanel() {
	if (getAllKodiHosts().length == 0) {
		panel.port.emit('triggerAddKodiHostShow');
		return;
	}
	var kodiHost = getSelectedKodiHost();

	sendPlaylistItemsToPanel(kodiHost);
	sendPlayerIsPausedToPanel(kodiHost);
	sendPlayerPercentageToPanel(kodiHost);
	sendPlayerTimeToPanel(kodiHost);
	sendVolumePercentageToPanel(kodiHost);
	sendIsMutedToPanel(kodiHost);
	
	sendHistoryItemsToPanel(kodiHost);
}

function onPanelNotVisible() {
	clearInterval(panelShowingRefreshIntervalID);
	panelShowingRefreshIntervalID = -1;
	
	// do it once now
	onPanelNotVisibleHelper();
	panelShowingRefreshIntervalID = setInterval(onPanelNotVisibleHelper, 5000);
}

function onPanelNotVisibleHelper() {
	if (getAllKodiHosts().length == 0) {
		panel.port.emit('triggerAddKodiHostShow');
		return;
	}
	testWhetherKodiOnline(require("sdk/simple-prefs").prefs.selectedkodihost);
}

panel.port.on('resize', function(height) {
	panel.resize(panel.width, height);
});

panel.port.on("sendURLToKodi", function(url, kodiHost) {
	sendURLToKodi(url, kodiHost);
	addItemToHistory(url, kodiHost);
});

panel.port.on("queueURLToKodi", function(url, kodiHost) {
	queueURLToKodi(url, kodiHost);
	addItemToHistory(url, kodiHost);
});

function setSelectedKodiHost(hostInd) {
	require("sdk/simple-prefs").prefs.selectedkodihost = parseInt(hostInd);
	testWhetherKodiOnline(require("sdk/simple-prefs").prefs.selectedkodihost);
	initTimers();
}

panel.port.on('setSelectedKodiHost', setSelectedKodiHost);

panel.port.on('getKodiHosts', sendKodiHostsToPanel);
panel.port.on('getPlaylistItems', sendPlaylistItemsToPanel);
panel.port.on('getHistoryItems', sendHistoryItemsToPanel);
panel.port.on('updateIsPaused', sendPlayerIsPausedToPanel);
panel.port.on('updatePlayerPercentage', sendPlayerPercentageToPanel);
panel.port.on('updatePlayerTime', sendPlayerTimeToPanel);
panel.port.on('updateVolumePercentage', sendVolumePercentageToPanel);
panel.port.on('updateIsMuted', sendIsMutedToPanel);
panel.port.on('loginProvided', loginProvided);
panel.port.on('addKodiHost', addKodiHost);
panel.port.on('deleteKodiHost', deleteKodiHost);


/*
	Play controls
*/
panel.port.on('last', function(kodiHost) {
	last(kodiHost);
});
panel.port.on('rewind', function(kodiHost) {
	rewind(kodiHost);
});
panel.port.on('playPause', function(kodiHost) {
	playPause(kodiHost);
});
panel.port.on('stop', function(kodiHost) {
	stop(kodiHost);
});
panel.port.on('forward', function(kodiHost) {
	forward(kodiHost);
});
panel.port.on('next', function(kodiHost) {
	next(kodiHost);
});
panel.port.on('toggleMute', function(kodiHost) {
	toggleMute(kodiHost);
});

panel.port.on('movePlaylistItem', startMovePlaylistItem);

panel.port.on('setVolume', function(percentage, kodiHost) {
	setVolume(percentage, kodiHost);
})


panel.port.on('playerSeek', function(percentage, kodiHost) {
	getActiveVidePlayerId(function (videoPlayerId) {
		if (typeof videoPlayerId == 'undefined') {
			return;
		}
		playerSeek(videoPlayerId, percentage, kodiHost);
	}, kodiHost);
})




//
// SEND STUFF TO PANEL
//

function sendHistoryItemsToPanel(kodiHost) {
	if (!kodiOnline[kodiHost]) {
		return;
	}
	
	panel.port.emit("updateHistoryItems", getKodiHistoryItems());
}


function sendKodiHostsToPanel() {
	panel.port.emit("updateKodiHosts", getAllKodiHosts(), getAllKodiPorts(), getSelectedKodiHost());
}

function sendPlaylistItemsToPanel(kodiHost) {
	//~ console.log("sendPlaylistItemsToPanel: " + kodiHost);
	if (!kodiOnline[kodiHost]) {
		button.badge = "";
		return;
	}
	
	var playerId = activeVideoPlayerIDs[kodiHost];
	if (typeof playerId == 'undefined') {
		button.badge = "";
		panel.port.emit("updatePlaylistItems", [], kodiHost);
		return;
	}
	// get currently played item title
	var firstItemTitle = playerItems[kodiHost];
	var fromPosition = playerPositions[kodiHost];
	if (typeof playerId == 'undefined') {
		button.badge = "";
		panel.port.emit("updatePlaylistItems", [], kodiHost);
		return;
	}
	
	if (fromPosition == -1) {
		// no playlist is being played
		button.badge = 1;
		panel.port.emit("updatePlaylistItems", [firstItemTitle], kodiHost);
	} else {
		var playlistId = videoPlaylists[kodiHost];
		getPlaylistItems(fromPosition, playlistId, function(playlistId, items, kodiHost) {
			button.badge = items.length;
			// playlist titles are not as good as the ones returned from the player
			items[0] = firstItemTitle;
			panel.port.emit("updatePlaylistItems", items, kodiHost);
		}, kodiHost);
	}
}

function sendPlayerIsPausedToPanel(kodiHost) {
	if (!kodiOnline[kodiHost]) {
		return;
	}
	
	checkIsPlaying(function(isPlaying) {
		if (isPlaying == -1)
			return;
		
		panel.port.emit('playerPauseStatus', isPlaying, kodiHost);
	}, kodiHost);
}

function sendIsMutedToPanel(kodiHost) {
	if (!kodiOnline[kodiHost]) {
		return;
	}
	
	isMuted(function(isMuted) {
		panel.port.emit('muteStatus', isMuted, kodiHost);
	}, kodiHost);
}

function sendPlayerPercentageToPanel(kodiHost) {
	if (!kodiOnline[kodiHost]) {
		return;
	}
	
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	if (typeof videoPlayerId == 'undefined') {
		return;
	}
	getPlayerPercentage(videoPlayerId, function(percentage) {
		panel.port.emit('playerPercentage', percentage, kodiHost);
	}, kodiHost);
}


function sendPlayerTimeToPanel(kodiHost) {
	if (!kodiOnline[kodiHost]) {
		return;
	}
	
	var videoPlayerId = activeVideoPlayerIDs[kodiHost];
	if (typeof videoPlayerId == 'undefined') {
		return;
	}
	getPlayerTime(videoPlayerId, function(time) {
		panel.port.emit('playerTime', time, kodiHost);
	}, kodiHost);
}


function sendVolumePercentageToPanel(kodiHost) {
	if (!kodiOnline[kodiHost]) {
		return;
	}
	
	getVolumePercentage(function(percentage) {
		panel.port.emit('volumePercentage', percentage, kodiHost);
	}, kodiHost);
}






//
// youtube stuff
// taken from chrome play-to-xbmc plugin;
//

function urlMatchesOneOfPatterns(url, patterns) {
    for (var i = 0; i < patterns.length; i++) {
        var pattern = patterns[i];
        if (url.match(pattern)) {
            return true;
        }
    }

    return false;
}

function isYoutubeURL(url) {
	var validPatterns = [
	    ".*youtube.com/watch.*",
	    ".*youtu.be/.*"
	];
	return urlMatchesOneOfPatterns(url, validPatterns);
}

function isYoutubePluginURL(url) {
	var validPatterns = [
	    ".*plugin.video.youtube*"
	];
	return urlMatchesOneOfPatterns(url, validPatterns);
}

function extractYoutubeVideoID(url) {
	var videoId;
        if (url.match('v=([^&]+)')) {
            videoId = url.match('v=([^&]+)')[1];
        }

        if (url.match('.*youtu.be/(.+)')) {
            videoId = url.match('.*youtu.be/(.+)')[1];
        }
	return videoId;
}

function extractYoutubePluginVideoID(url) {
	var videoId;
        if (url.match('videoid=([^&]+)')) {
            videoId = url.match('videoid=([^&]+)')[1];
        }
	
	return videoId;
}

function getYoutubePluginPath(url) {
	var videoId = extractYoutubeVideoID(url);
	return 'plugin://plugin.video.youtube/?action=play_video&videoid=' + videoId;
}







//
// REQUEST HANDLING
//

var doMergeRequests = false;

function saveRequest(content, onCompleteCallback, kodiHost) {
	//~ console.log(kodiHost + ": " + content);
	//console.log("saveRequest: " + kodiHost);
	//console.trace();
	if (doMergeRequests) {
		collectedRequests[kodiHost].push({content: content, onComplete: onCompleteCallback});
	} else {
		// just post the request directly
		createRequest(content, onCompleteCallback, function(req) {
				req.post()
			}, kodiHost);
	}
}

function postCollectedRequests() {
	//console.log("postCollectedRequests");
	//console.log(Object.keys(collectedRequests));
	for (var kodiHost in Object.keys(collectedRequests)) {
		var requests = collectedRequests[kodiHost];
		//console.log("postCollectedRequests: " + kodiHost + " (" + requests.length + ")");
		if (requests.length == 0) {
			continue;
		}
		mergeRequests(requests, function(mergeRequest, kodiHost) {
			//console.log("postCollectedRequests: " + kodiHost);
			mergeRequest.post();
			collectedRequests[kodiHost] = [];
		}, kodiHost);
	}
}

function mergeRequests(requestArray, requestsMergedCallback, kodiHost) {
	//console.log("merge requests");
	//console.log(requestArray);
	
	var callbackHash = {};
	
	var newContentString = "[";
	requestArray.forEach(function(request, ind) {
		//~ console.log(request.content);
		try {
			var json = JSON.parse(request.content);
			json['id'] = ind;
			newContentString = newContentString + JSON.stringify(json) + ",";
		
			callbackHash[ind] = request.onComplete;
		} catch (err) {
			//~ console.log("Ignoring invalid request: " + request.content);
		}
	});
	newContentString = newContentString.slice(0, -1);
	newContentString = newContentString + "]";
	//console.log("newContentString: " + newContentString);
	
	createRequest(newContentString, function(responses) {
			if (responses.status == 200) {
				//console.log("responses");
				//console.log(response.status);
				//console.log(response.text);
				//console.log(response.headers);
				//~ console.log(responses.json);
				responses.json.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ); 
				responses.json.forEach(function(response, ind) {
					if (response.id in callbackHash && (typeof callbackHash[response.id] != 'undefined')) {
						callbackHash[response.id]({json: response, status: responses.status});
					}
				});
				panel.port.emit('hideSpinner');
				//console.log("callbackHash: " + callbackHash);
				
			}
		}, requestsMergedCallback, kodiHost);
}
	

function createRequest(contentString, onCompleteCallback, requestCreatedCallback, kodiHost) {
	var requestHeaders = {};
	var isPresent = loginsPresent[kodiHost];
		
	if (isPresent) {
		var base64 = require("sdk/base64");
		
		var username = usernames[kodiHost];
		var password = passwords[kodiHost];
		requestHeaders['Authorization'] = 'Basic ' + base64.encode(username + ':' + password);
		
		requestCreatedCallback(coreCreateRequestWithHeaders(contentString, requestHeaders, onCompleteCallback, kodiHost), kodiHost);
	} else {
		requestCreatedCallback(coreCreateRequestWithHeaders(contentString, requestHeaders, onCompleteCallback, kodiHost), kodiHost);
	}
}

function coreCreateRequestWithHeaders(contentString, requestHeaders, onCompleteCallback, kodiHost, callbackHash) {
	console.log("coreCreateRequestWithHeaders: " + contentString);
	//console.trace();
	if (firstAuthenticationCheck[kodiHost]) {
		panel.port.emit('showSpinner', kodiHost);
	}
	var req = Request({
	  url: "http://" + getAllKodiHosts()[kodiHost] + ":" + getAllKodiPorts()[kodiHost] + "/jsonrpc",
	  overrideMimeType: "text/plain; charset=utf8",
	  headers: requestHeaders,
	  content: contentString,
	  contentType: "application/json", 
	  onComplete: function(response) {
		// invalid address
		if(response.status==0||response.status==504) {
			kodiOnline[kodiHost] = false;
			panel.port.emit("kodiOffline", kodiHost);
		}
		else {
			kodiOnline[kodiHost] = true
			panel.port.emit("kodiOnline", kodiHost);
			
			// we check whether we need to ask the user for credentials
			if (response.status == 401) {
				isLoginPresent(kodiHost, function(isPresent) {
					if (isPresent) {
						// wrong credentials
						panel.port.emit("showWrongLogin", kodiHost);
					} else {
						// missing credentials
						panel.port.emit("hideWrongLogin", kodiHost);
					}
					//if (//firstAuthenticationCheck[kodiHost] || 
					//	!kodiNeedsAuthentication[kodiHost]) {
						kodiNeedsAuthentication[kodiHost] = true;
						panel.port.emit("kodiNeedsAuthentication", kodiHost);
					//}
				
				});
			} else {
				panel.port.emit("hideWrongLogin");
				//if (firstAuthenticationCheck[kodiHost] || kodiNeedsAuthentication[kodiHost]) {
					kodiNeedsAuthentication[kodiHost] = false;
					panel.port.emit("kodiAuthenticated", kodiHost);
				//}
			}
		}
		
		firstAuthenticationCheck[kodiHost] = false;
		onCompleteCallback(response, callbackHash);
	  }
	});
	return req;
}