(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = selectAll('[data-hero-slide]');
        var thumbs = selectAll('[data-hero-thumb]');
        if (!slides.length || !thumbs.length) {
            return;
        }
        var activeIndex = 0;
        var timer = null;

        function activate(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle('is-active', currentIndex === activeIndex);
            });
            thumbs.forEach(function (thumb, currentIndex) {
                thumb.classList.toggle('is-active', currentIndex === activeIndex);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                activate(activeIndex + 1);
            }, 5200);
        }

        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                activate(index);
                startTimer();
            });
        });

        activate(0);
        startTimer();
    }

    function setupGlobalSearch() {
        var input = document.getElementById('global-search');
        var results = document.getElementById('global-search-results');
        var movies = window.searchMovies || [];
        if (!input || !results || !movies.length) {
            return;
        }

        function render(items) {
            results.innerHTML = items.map(function (item) {
                return [
                    '<a class="search-result-item" href="' + item.url + '">',
                    '<span class="search-result-title">' + item.title + '</span>',
                    '<span class="search-result-meta">' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span>',
                    '</a>'
                ].join('');
            }).join('');
            results.classList.toggle('is-open', items.length > 0);
        }

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            if (keyword.length < 1) {
                render([]);
                return;
            }
            var matched = movies.filter(function (item) {
                return item.searchText.indexOf(keyword) !== -1;
            }).slice(0, 12);
            render(matched);
        });

        document.addEventListener('click', function (event) {
            if (!results.contains(event.target) && event.target !== input) {
                results.classList.remove('is-open');
            }
        });
    }

    function setupCategoryFilters() {
        var input = document.getElementById('category-search');
        var typeSelect = document.getElementById('category-type');
        var yearSelect = document.getElementById('category-year');
        var cards = selectAll('[data-movie-card]');
        var empty = document.getElementById('category-empty');
        if (!cards.length) {
            return;
        }

        function filterCards() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var yearValue = yearSelect ? yearSelect.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var searchText = card.getAttribute('data-search') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var visible = true;

                if (keyword && searchText.indexOf(keyword) === -1) {
                    visible = false;
                }
                if (typeValue && cardType !== typeValue) {
                    visible = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    visible = false;
                }

                card.classList.toggle('hidden-card', !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupGlobalSearch();
        setupCategoryFilters();
    });
})();

function initializePlayer(source) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-player-button]');
    var message = document.querySelector('[data-player-message]');
    var hls = null;

    if (!video || !source) {
        return;
    }

    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.classList.add('is-visible');
        }
    }

    function hideMessage() {
        if (message) {
            message.classList.remove('is-visible');
        }
    }

    function playVideo() {
        hideMessage();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                showMessage('点击播放按钮即可开始观看');
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    function attachSource() {
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    showMessage('视频加载遇到网络问题，正在重新连接');
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    showMessage('视频加载遇到异常，正在恢复播放');
                    hls.recoverMediaError();
                } else {
                    showMessage('当前视频暂时无法播放，请稍后再试');
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            showMessage('当前视频暂时无法播放，请稍后再试');
        }
    }

    attachSource();

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            playVideo();
        });
    }

    if (cover) {
        cover.addEventListener('click', function () {
            playVideo();
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
