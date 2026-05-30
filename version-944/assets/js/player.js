(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initPlayer);
  });

  function initPlayer(root) {
    var video = root.querySelector("video");
    var button = root.querySelector("[data-play-trigger]");
    var loading = root.querySelector("[data-player-loading]");
    var message = root.querySelector("[data-player-message]");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var hls = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function setLoading(active) {
      if (loading) {
        loading.classList.toggle("is-hidden", !active);
      }
    }

    function setReady() {
      setLoading(false);
      video.setAttribute("controls", "controls");
    }

    function setError() {
      setLoading(false);
      showMessage("视频暂时无法播放，请稍后重试");
    }

    if (!stream) {
      setError();
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.addEventListener("loadedmetadata", setReady, { once: true });
      video.addEventListener("error", setError);
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, setReady);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setError();
          if (hls) {
            hls.destroy();
            hls = null;
          }
        }
      });
    } else {
      setError();
      return;
    }

    function play() {
      if (button) {
        button.classList.add("is-hidden");
      }
      var started = video.play();
      if (started && typeof started.catch === "function") {
        started.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
          showMessage("请再次点击播放");
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }
})();
