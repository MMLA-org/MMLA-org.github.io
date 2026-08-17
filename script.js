(() => {
  document.documentElement.classList.add("js-ready");

  const body = document.body;
  const languageToggle = document.querySelector("[data-language-toggle]");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

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

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll(".doc-card").forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
      });
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

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  }
})();
