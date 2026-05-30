(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function getRootPrefix() {
    return document.body.getAttribute("data-root-prefix") || "./";
  }

  function makeHref(path) {
    if (!path) {
      return "#";
    }
    if (/^(https?:)?\/\//.test(path) || path.startsWith("/") || path.startsWith("#")) {
      return path;
    }
    return getRootPrefix() + path;
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 6000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearchInputs() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    var index = window.MovieSearchIndex || [];
    inputs.forEach(function (input) {
      var holder = input.parentElement ? input.parentElement.querySelector("[data-search-results]") : null;
      if (!holder) {
        return;
      }
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        if (!q) {
          holder.classList.remove("is-open");
          holder.innerHTML = "";
          return;
        }
        var results = index.filter(function (item) {
          var text = [item.title, item.region, item.type, item.year, item.category, item.tags].join(" ").toLowerCase();
          return text.indexOf(q) !== -1;
        }).slice(0, 8);
        if (!results.length) {
          holder.innerHTML = '<a href="' + makeHref("categories.html") + '"><strong>未找到完全匹配</strong><small>进入分类频道继续浏览</small></a>';
          holder.classList.add("is-open");
          return;
        }
        holder.innerHTML = results.map(function (item) {
          return '<a href="' + makeHref(item.href) + '"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.region + " · " + item.type + " · " + item.year) + '</small></a>';
        }).join("");
        holder.classList.add("is-open");
      });
      document.addEventListener("click", function (event) {
        if (!input.parentElement || input.parentElement.contains(event.target)) {
          return;
        }
        holder.classList.remove("is-open");
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupLocalFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    areas.forEach(function (area) {
      var scope = area.parentElement || document;
      var list = scope.querySelector("[data-card-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-item"));
      var search = area.querySelector("[data-local-search]");
      var region = area.querySelector("[data-filter-region]");
      var type = area.querySelector("[data-filter-type]");
      var year = area.querySelector("[data-filter-year]");
      fillSelect(region, cards, "region");
      fillSelect(type, cards, "type");
      fillSelect(year, cards, "year");

      function apply() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.category].join(" ").toLowerCase();
          var matched = true;
          if (q && text.indexOf(q) === -1) {
            matched = false;
          }
          if (regionValue && card.dataset.region !== regionValue) {
            matched = false;
          }
          if (typeValue && card.dataset.type !== typeValue) {
            matched = false;
          }
          if (yearValue && card.dataset.year !== yearValue) {
            matched = false;
          }
          card.classList.toggle("is-filtered-out", !matched);
        });
      }

      [search, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function fillSelect(select, cards, key) {
    if (!select || select.options.length > 1) {
      return;
    }
    var values = [];
    cards.forEach(function (card) {
      var value = card.dataset[key];
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort().forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchInputs();
    setupLocalFilters();
  });
})();
