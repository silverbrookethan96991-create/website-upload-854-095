import { H as Hls } from "./hls.js";

function bindPlayer(card) {
  var video = card.querySelector("video");
  var start = card.querySelector("[data-play]");
  var loading = card.querySelector("[data-loading]");
  var message = card.querySelector("[data-message]");
  var stream = card.getAttribute("data-stream");
  var hls = null;
  var initialized = false;

  if (!video || !stream) {
    return;
  }

  function setLoading(state) {
    if (loading) {
      loading.hidden = !state;
    }
  }

  function setMessage(state) {
    if (message) {
      message.hidden = !state;
    }
  }

  function setup() {
    if (initialized) {
      return;
    }

    initialized = true;
    setLoading(true);
    setMessage(false);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.addEventListener("loadedmetadata", function () {
        setLoading(false);
      }, { once: true });
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setLoading(false);
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          setLoading(false);
          setMessage(true);
        }
      });
      return;
    }

    setLoading(false);
    setMessage(true);
  }

  function play() {
    setup();
    card.classList.add("playing");
    if (start) {
      start.hidden = true;
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        if (start) {
          start.hidden = false;
        }
        card.classList.remove("playing");
      });
    }
  }

  if (start) {
    start.addEventListener("click", play);
  }

  video.addEventListener("play", function () {
    card.classList.add("playing");
    if (start) {
      start.hidden = true;
    }
  });

  video.addEventListener("pause", function () {
    if (!video.ended) {
      card.classList.remove("playing");
      if (start) {
        start.hidden = false;
      }
    }
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".player-card").forEach(bindPlayer);
});
