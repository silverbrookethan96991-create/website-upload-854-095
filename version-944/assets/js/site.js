(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupHeader();
    setupMenu();
    setupHero();
    setupFilters();
  });

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) {
      return;
    }
    var update = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid"));
    if (!grids.length) {
      return;
    }
    var searchInput = document.querySelector("[data-movie-search]");
    var regionInput = document.querySelector("[data-filter-region]");
    var yearInput = document.querySelector("[data-filter-year]");
    var categoryInput = document.querySelector("[data-filter-category]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && searchInput) {
      searchInput.value = query;
    }

    function lower(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var queryValue = lower(searchInput && searchInput.value);
      var regionValue = lower(regionInput && regionInput.value);
      var yearValue = lower(yearInput && yearInput.value);
      var categoryValue = lower(categoryInput && categoryInput.value);
      grids.forEach(function (grid) {
        Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]")).forEach(function (card) {
          var haystack = lower([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category"),
            card.getAttribute("data-tags")
          ].join(" "));
          var visible = true;
          if (queryValue && haystack.indexOf(queryValue) === -1) {
            visible = false;
          }
          if (regionValue && lower(card.getAttribute("data-region")).indexOf(regionValue) === -1) {
            visible = false;
          }
          if (yearValue && lower(card.getAttribute("data-year")).indexOf(yearValue) === -1) {
            visible = false;
          }
          if (categoryValue && lower(card.getAttribute("data-category")) !== categoryValue) {
            visible = false;
          }
          card.classList.toggle("is-hidden", !visible);
        });
      });
    }

    [searchInput, regionInput, yearInput, categoryInput].forEach(function (input) {
      if (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      }
    });

    apply();
  }
})();
