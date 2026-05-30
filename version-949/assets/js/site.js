(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    var searchInput = document.querySelector("[data-site-search]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function matchYear(cardYear, selected) {
      if (!selected) {
        return true;
      }
      if (selected === "1990") {
        return /^199/.test(cardYear);
      }
      if (selected === "1980") {
        return /^198/.test(cardYear);
      }
      return cardYear.indexOf(selected) !== -1;
    }

    function filterCards() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var selectedYear = yearFilter ? yearFilter.value : "";

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var year = card.getAttribute("data-year") || "";
        var visible = (!keyword || haystack.indexOf(keyword) !== -1) && matchYear(year, selectedYear);
        card.classList.toggle("is-filtered-out", !visible);
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", filterCards);
    }

    if (yearFilter) {
      yearFilter.addEventListener("change", filterCards);
    }
  });
})();
