(function ($) {
	var root = this;
	var iFrameAttribute = "";
	var timeOut = Number.NaN;
	var modalContent = "";
	var width = Number.NaN;
	var height = Number.NaN;
	var delay = Number.NaN;
	var log = [];
	var SENS = 20;
	var hasFired = 0;
	var enableModal = false;
	var enableExitAlert = false;
	var exitAlertText = "Before you go, please take a look at this special offer...";
	var maxModalFires = 1;
	var popupUseAjax = false;
	var targetUseIframe = false;
	var dialog = false;
	var dialogOpened = false;
	var popupIsRedirect = false;
	var popupIsSwapTarget = false;
	var iFrameLoads = 0;

	function start() {
		var matches = modalContent.match(/embed\/[a-zA-Z0-9\-_]+/);
		if (matches) {
			var tag = document.createElement('script');
			tag.src = "//www.youtube.com/player_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
		}
		if (targetUseIframe) {
			initIframe()
		}
		if (modalContent != '') {
			initModal()
		}
	}
	function initIframe() {
		$('<iframe  />', iFrameAttribute).appendTo('body')
	}
	function initModal() {
		if (!popupIsRedirect) {
			var pop = '';
			if (modalContent != null && modalContent.indexOf("http://") == 0) {
				if (popupUseAjax) {
					pop = '<div style="display: none;"><a id="btnForm" href="' + modalContent + '"></a></div>'
				} else {
					$('<iframe id="exit-content" src="' + modalContent + '" class="iframe-load" style="height:100%"></iframe>').appendTo('body');
					$('#exit-content').load(function () {
						$(this).modal({
							onOpen: function (dl) {
								dialog = dl
							},
							onClose: modalClose
						});
						if (width && height) {
							$('#simplemodal-container').width(width).height(height)
						}
						$(this).removeClass('iframe-load')
					})
				}
			} else {
				$('<div id="exit-content"></div>').append(modalContent).appendTo('body')
			}
			$('#exit-content').removeClass('iframe-load').modal({
				onOpen: function (dl) {
					dialog = dl
				},
				onClose: modalClose
			});
			if (width && height) {
				$('#simplemodal-container').width(width).height(height)
			}
		}
		$('#authFrame').mouseenter(enableIframeOut);
		$('#authFrame').mouseleave(triggerIframeOut);
		iframeLoad();
		$(document).mousemove(onMouseMovePredictOut);
		windowUnloadTimeout = setInterval(setWindowUnload, 330)
	}
	function onMouseMovePredictOut(e) {
		enableModal = true;
		var ct = new Date().getTime();
		if (log.length > 1) {
			var o = log[log.length - 1];
			var dt = ct - o.time;
			var ny = e.pageY + (((e.pageY - o.y) / dt) * SENS);
			if (ny < 5) {
				triggerModal()
			}
		}
		log.push({
			x: e.pageX,
			y: e.pageY,
			time: ct
		})
	}
	function setWindowUnload() {
		if (window.onbeforeunload != triggerExitAlert) {
			window.onbeforeunload = triggerExitAlert
		}
	}
	function clearWindowUnload() {
		clearInterval(windowUnloadTimeout);
		windowUnloadTimeout = null;
		window.onbeforeunload = null
	}
	function setWindowAlert() {
		window.alert = nullalert
	}
	function nullalert(message) {}
	function enableIframeOut() {
		enableModal = true
	}
	function triggerIframeOut() {
		if (enableModal) {
			triggerModal()
		}
	}
	function clickedInIframe() {}
	function iframeLoad() {
		iFrameLoads++;
		switch (iFrameLoads) {
		case 1:
			if (!isNaN(delay)) {
				if (delay > 0) {
					timeOut = setTimeout(triggerModal, 1000 * delay)
				} else if (delay == 0) {
					triggerModal()
				}
			}
			break;
		default:
			clearWindowUnload()
		}
	}
	function triggerExitAlert() {
		if (enableExitAlert) {
			if (popupIsRedirect) {}
			triggerModal();
			enableExitAlert = false;
			return exitAlertText + "\n\nClick the 'Stay on this Page' button"
		}
	}
	function triggerModal() {
		if (!dialogOpened && hasFired < maxModalFires) {
			dialogOpened = true;
			if (popupIsRedirect) {
				window.alert(exitAlertText);
				window.location = unescape(modalContent);
				setTimeout(triggerRedirect, 150)
			} else {
				modalOpen(dialog)
			}
		}
		clearTimeout(timeOut);
		clearTimeout(windowUnloadTimeout);
		window.onbeforeunload = null;
		windowUnloadTimeout = setTimeout(setWindowAlert, 150);
		$(document).unbind('mousemove', onMouseMovePredictOut)
	}
	function triggerRedirect() {
		window.location = unescape(modalContent)
	}
	function stopPlayer() {
		try {
			player.pauseVideo()
		} catch (err) {}
	}
	function play_if_not_playing() {
		var isiPad = navigator.userAgent.match(/iPad/i) != null;
		var isiPod = navigator.userAgent.match(/iPod/i) != null;
		if (isiPad || isiPod) {} else {
			try {
				if (player != null && player.getPlayerState() != 1) player.playVideo()
			} catch (err) {}
		}
	}
	function modalOpen(dialog, speed) {
		play_if_not_playing();
		window.scrollTo(0, 0);
		$(window).trigger('resize');
		if (!popupIsRedirect) {
			if (speed == "fast") {
				dialog.overlay.show();
				dialog.container.show();
				dialog.data.show()
			} else {
				dialog.overlay.fadeIn('fast', function () {
					dialog.container.fadeIn('fast', function () {
						dialog.data.show().slideDown('fast', function () {})
					})
				})
			}
		}
	}
	function modalClose(dialog) {
		stopPlayer();
		dialogOpened = false;
		hasFired++;
		if (!popupIsRedirect) {
			dialog.data.fadeOut('fast', function () {
				dialog.container.hide('fast', function () {
					dialog.overlay.slideUp('fast', function () {
						$.modal.close();
						$('#exit-content').remove()
					})
				})
			})
		}
	}
	function initFrameBuster() {
		new authover.FrameBuster({})
	}
	root.authover = root.authover || {};
	root.authover.triggerModal = function () {
		dialogOpened = true;
		if (popupIsRedirect) {
			window.alert(exitAlertText);
			window.location = unescape(modalContent);
			setTimeout(triggerRedirect, 150)
		} else {
			modalOpen(dialog)
		}
	};
	root.authover.getFrameID = function (id) {
		var elem = document.getElementById(id);
		if (elem) {
			if (/^iframe$/i.test(elem.tagName)) return id;
			var elems = elem.getElementsByTagName("iframe");
			if (!elems.length) return null;
			for (var i = 0; i < elems.length; i++) {
				if (/^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com(\/|$)/i.test(elems[i].src)) break
			}
			elem = elems[i];
			if (elem.id) return elem.id;
			do {
				id += "-frame"
			} while (document.getElementById(id));
			elem.id = id;
			return id
		}
		return null
	};
	root.authover.call = function () {
		if ($("#exit-content").is(":visible")) {
			play_if_not_playing()
		}
	};
	root.authover.configure = function (p) {
		if (typeof p.iFrameAttribute != "undefined" && p.iFrameAttribute != '' && p.iFrameAttribute != null) {
			iFrameAttribute = p.iFrameAttribute
		}
		if (typeof p.targetUseIframe != "undefined" && p.targetUseIframe != '' && p.targetUseIframe != null) {
			if (p.targetUseIframe == '0') {
				targetUseIframe = false
			} else if (p.targetUseIframe == '1') {
				targetUseIframe = true
			} else {
				targetUseIframe = p.targetUseIframe
			}
		}
		if (typeof p.modalContent != "undefined" && p.modalContent != '' && p.modalContent != null) {
			modalContent = p.modalContent
		}
		if (typeof p.exitAlertText != "undefined" && p.exitAlertText != '' && p.exitAlertText != null) {
			exitAlertText = p.exitAlertText;
			exitAlertText = exitAlertText.split("<br>").join("\n");
			exitAlertText = exitAlertText.split("<br />").join("\n");
			exitAlertText = exitAlertText.split("<br/>").join("\n");
			exitAlertText = exitAlertText.split("\r").join("\n")
		}
		if (typeof p.width != "undefined" && p.width != '' && p.width != null) {
			width = Number(p.width)
		}
		if (typeof p.height != "undefined" && p.height != '' && p.height != null) {
			height = Number(p.height)
		}
		if (typeof p.delay != "undefined" && p.delay != '' && p.delay != null) {
			delay = Number(p.delay)
		}
		if (typeof p.popupUseAjax != "undefined" && p.popupUseAjax != '' && p.popupUseAjax != null) {
			if (p.popupUseAjax == '0') {
				popupUseAjax = false
			} else if (p.popupUseAjax == '1') {
				popupUseAjax = true
			} else {
				popupUseAjax = p.popupUseAjax
			}
		}
		if (typeof p.popupIsRedirect != "undefined" && p.popupIsRedirect != '' && p.popupIsRedirect != null) {
			if (p.popupIsRedirect == '0' || p.popupIsRedirect == 0) {
				popupIsRedirect = false
			} else if (p.popupIsRedirect == '1' || p.popupIsRedirect == 1) {
				popupIsRedirect = true
			} else {
				popupIsRedirect = p.popupIsRedirect
			}
		}
		if (typeof p.popupIsSwapTarget != "undefined" && p.popupIsSwapTarget != '' && p.popupIsSwapTarget != null) {
			if (p.popupIsSwapTarget == '0' || p.popupIsSwapTarget == 0) {
				popupIsSwapTarget = false
			} else if (p.popupIsSwapTarget == '1' || p.popupIsSwapTarget == 1) {
				popupIsSwapTarget = true
			} else {
				popupIsSwapTarget = p.popupIsSwapTarget
			}
		}
		start()
	}
}).call(this, jQuery);

function onYouTubePlayerAPIReady() {
	var frameID = authover.getFrameID("exit-content");
	if (frameID) {
		player = new YT.Player(frameID, {
			events: {
				'onReady': authover.call
			}
		})
	}
}