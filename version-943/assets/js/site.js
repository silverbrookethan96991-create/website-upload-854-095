(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
            var prev = carousel.querySelector("[data-carousel-prev]");
            var next = carousel.querySelector("[data-carousel-next]");
            var index = 0;
            var timer;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-search-area]").forEach(function (area) {
            var input = area.querySelector("[data-search-input]");
            var root = area.parentElement || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
            var category = "all";
            var year = "all";

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchCategory = category === "all" || card.dataset.category === category;
                    var matchYear = year === "all" || card.dataset.year === year;
                    card.classList.toggle("is-filtered-out", !(matchQuery && matchCategory && matchYear));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            area.querySelectorAll("[data-filter-value]").forEach(function (button) {
                button.addEventListener("click", function () {
                    category = button.dataset.filterValue || "all";
                    area.querySelectorAll("[data-filter-value]").forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });

            area.querySelectorAll("[data-year-value]").forEach(function (button) {
                button.addEventListener("click", function () {
                    year = button.dataset.yearValue || "all";
                    area.querySelectorAll("[data-year-value]").forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
        });
    });

    window.initStaticPlayer = function (source) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        if (!video || !source) {
            return;
        }

        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function begin() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", begin);
        }

        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                begin();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();