(function () {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('mobile-toggle');
  const panel = document.getElementById('mobile-panel');

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  const hero = document.getElementById('hero-slider');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });

      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const target = Number(dot.getAttribute('data-hero-target') || 0);
        showSlide(target);
        startTimer();
      });
    });

    startTimer();
  }

  function textOf(card) {
    const values = [
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.genre,
      card.dataset.tags,
      card.textContent
    ];

    return values.join(' ').toLowerCase();
  }

  function uniqueValues(cards, key) {
    const values = [];

    cards.forEach(function (card) {
      const value = card.dataset[key];
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });

    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    const current = select.value;

    values.forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });

    select.value = current;
  }

  const filterPanel = document.querySelector('.filter-panel');
  const filterTarget = document.querySelector('.filter-target');

  if (filterPanel && filterTarget) {
    const cards = Array.from(filterTarget.querySelectorAll('.movie-card'));
    const keywordInput = filterPanel.querySelector('.filter-input');
    const selects = Array.from(filterPanel.querySelectorAll('.filter-select'));
    const emptyState = document.getElementById('empty-state');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    selects.forEach(function (select) {
      const key = select.getAttribute('data-filter-key');
      fillSelect(select, uniqueValues(cards, key));
    });

    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    function applyFilters() {
      const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      const active = {};
      let visible = 0;

      selects.forEach(function (select) {
        const key = select.getAttribute('data-filter-key');
        active[key] = select.value;
      });

      cards.forEach(function (card) {
        let matched = true;

        if (keyword && textOf(card).indexOf(keyword) === -1) {
          matched = false;
        }

        Object.keys(active).forEach(function (key) {
          if (active[key] && card.dataset[key] !== active[key]) {
            matched = false;
          }
        });

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }
})();
