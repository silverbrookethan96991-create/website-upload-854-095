(function () {
  var header = document.getElementById("siteHeader");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
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

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  var categoryFilters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
  var yearFilters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .wide-item"));
  var emptyStates = Array.prototype.slice.call(document.querySelectorAll("[data-empty-state]"));

  function normalized(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    var term = normalized(searchInputs.map(function (input) { return input.value; }).find(Boolean));
    var category = normalized(categoryFilters.map(function (select) { return select.value; }).find(Boolean));
    var year = normalized(yearFilters.map(function (select) { return select.value; }).find(Boolean));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalized([
        card.getAttribute("data-title"),
        card.getAttribute("data-category"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.textContent
      ].join(" "));
      var cardCategory = normalized(card.getAttribute("data-category"));
      var cardYear = normalized(card.getAttribute("data-year"));
      var match = (!term || haystack.indexOf(term) !== -1) && (!category || cardCategory === category) && (!year || cardYear === year);
      card.style.display = match ? "" : "none";
      if (match) {
        visible += 1;
      }
    });

    emptyStates.forEach(function (state) {
      state.classList.toggle("is-visible", visible === 0 && cards.length > 0);
    });
  }

  searchInputs.concat(categoryFilters).concat(yearFilters).forEach(function (control) {
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  });
})();
