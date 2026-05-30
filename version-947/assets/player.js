import { H as Hls } from "./hls-dru42stk.js";

export function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var action = document.getElementById(config.actionId);
  var cover = document.getElementById(config.coverId);

  if (!video || !config.source) {
    return;
  }

  var shell = video.closest(".player-shell");
  var prepared = false;
  var hls = null;

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.source;
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(config.source);
      hls.attachMedia(video);
    } else {
      video.src = config.source;
    }
  }

  function play() {
    prepare();
    if (shell) {
      shell.classList.add("is-playing");
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (shell) {
          shell.classList.remove("is-playing");
        }
      });
    }
  }

  if (action) {
    action.addEventListener("click", play);
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  video.addEventListener("play", function () {
    if (shell) {
      shell.classList.add("is-playing");
    }
  });

  video.addEventListener("pause", function () {
    if (video.currentTime === 0 && shell) {
      shell.classList.remove("is-playing");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
