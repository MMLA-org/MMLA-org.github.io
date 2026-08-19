(() => {
  const initialAnchorId = window.location.hash.slice(1);
  const initialAnchorTarget = initialAnchorId ? document.getElementById(initialAnchorId) : null;
  if (initialAnchorTarget) document.documentElement.classList.add("anchor-load");
  document.documentElement.classList.add("js-ready");

  const body = document.body;
  const topbar = document.querySelector(".topbar");
  const languageToggle = document.querySelector("[data-language-toggle]");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = siteNav ? [...siteNav.querySelectorAll('a[href^="#"]')] : [];
  const sectionIds = navLinks
    .map((link) => link.getAttribute("href").slice(1))
    .filter(Boolean);
  const navSections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setLanguage = (language) => {
    const nextLanguage = language === "en" ? "en" : "zh";
    body.dataset.lang = nextLanguage;
    document.documentElement.lang = nextLanguage === "en" ? "en" : "zh-CN";
    try {
      window.localStorage.setItem("mmla-language", nextLanguage);
    } catch (_) {
      // Local storage is optional for the static page.
    }
  };

  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      setLanguage(body.dataset.lang === "en" ? "zh" : "en");
    });
  }

  try {
    const savedLanguage = window.localStorage.getItem("mmla-language");
    if (savedLanguage === "en" || savedLanguage === "zh") setLanguage(savedLanguage);
  } catch (_) {
    // Use the Chinese default when storage is unavailable.
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const documentGrid = document.querySelector(".document-grid");
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      if (documentGrid) documentGrid.classList.add("is-filtering");
      document.querySelectorAll(".doc-card").forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hiding", !shouldShow);
      });

      window.setTimeout(() => {
        document.querySelectorAll(".doc-card").forEach((card) => {
          const shouldShow = filter === "all" || card.dataset.category === filter;
          card.hidden = !shouldShow;
          card.classList.remove("is-hiding");
        });
        if (documentGrid) documentGrid.classList.remove("is-filtering");
      }, 220);
    });
  });

  const citation = document.querySelector("#bibtex");
  const copyButton = document.querySelector("[data-copy-citation]");
  if (citation && copyButton) {
    copyButton.addEventListener("click", async () => {
      const original = copyButton.innerHTML;
      const value = citation.textContent.trim();
      try {
        await navigator.clipboard.writeText(value);
      } catch (_) {
        const helper = document.createElement("textarea");
        helper.value = value;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      }
      copyButton.textContent = body.dataset.lang === "en" ? "Copied" : "已复制";
      window.setTimeout(() => { copyButton.innerHTML = original; }, 1700);
    });
  }

  const markVisible = (element) => {
    element.classList.add("is-visible");
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          markVisible(entry.target);
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll(".reveal, .reveal-stagger").forEach((element) => observer.observe(element));

    if (initialAnchorTarget) {
      initialAnchorTarget.querySelectorAll(".reveal, .reveal-stagger").forEach(markVisible);
    }
  } else {
    document.querySelectorAll(".reveal, .reveal-stagger").forEach(markVisible);
  }

  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const updateScrollUi = () => {
    if (topbar) topbar.classList.toggle("is-scrolled", window.scrollY > 12);

    if (!navSections.length) return;
    const offset = window.scrollY + 120;
    let currentId = sectionIds[0];

    navSections.forEach((section, index) => {
      if (section.offsetTop <= offset) currentId = sectionIds[index];
    });

    setActiveNav(currentId);
  };

  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateScrollUi();
      scrollTicking = false;
    });
  }, { passive: true });

  updateScrollUi();
})();
