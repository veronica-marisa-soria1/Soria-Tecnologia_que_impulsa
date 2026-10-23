(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector("#nav-menu");
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  const currentYear = document.querySelector("#current-year");
  const themeToggle = document.querySelector("#theme-toggle");
  const contactEmail = "soriav449veronica@gmail.com";

  if (currentYear) currentYear.textContent = new Date().getFullYear();

  if (themeToggle) {
    const root = document.documentElement;
    const themeLabel = document.querySelector("#theme-toggle-label");
    const applyTheme = (theme) => {
      const nextTheme = theme === "dark" ? "dark" : "light";
      const label = nextTheme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
      root.dataset.theme = nextTheme;
      themeToggle.setAttribute("aria-label", label);
      themeToggle.setAttribute("title", label);
      if (themeLabel) themeLabel.textContent = label;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", nextTheme === "dark" ? "#0b1421" : "#f7faff");
    };

    applyTheme(root.dataset.theme);
    themeToggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      try {
        localStorage.setItem("wm-theme", nextTheme);
      } catch {
      }
    });
  }

  const brandOrb = document.querySelector(".brand-orb");
  const heroVisual = brandOrb?.closest(".hero-visual");
  if (brandOrb && heroVisual) {
    brandOrb.addEventListener("click", () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      heroVisual.classList.remove("is-animating");
      void heroVisual.offsetWidth;
      heroVisual.classList.add("is-animating");
    });
  }

  const setHeaderState = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.querySelector(".sr-only").textContent = "Abrir menú";
    navMenu.classList.remove("is-open");
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.querySelector(".sr-only").textContent = isOpen ? "Cerrar menú" : "Abrir menú";
    });

    navMenu.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const validators = {
    name: (value) => value.trim() ? "" : "Contanos tu nombre.",
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Ingresá un email válido.",
    message: (value) => value.trim() ? "" : "Contanos brevemente sobre tu idea.",
  };

  const validateField = (field) => {
    const error = validators[field.name]?.(field.value) || "";
    const message = document.querySelector("#" + field.id + "-error");
    field.setAttribute("aria-invalid", String(Boolean(error)));
    if (message) message.textContent = error;
    return !error;
  };

  if (form && status) {
    const fields = Array.from(form.querySelectorAll("input, textarea"));
    fields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        validateField(field);
        status.textContent = "";
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const invalid = fields.filter((field) => !validateField(field));

      if (invalid.length) {
        status.textContent = "Revisá los campos marcados antes de enviar.";
        invalid[0].focus();
        return;
      }

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();
      const subject = "Consulta para SORIA — " + name;
      const body = message + "\n\n—\n" + name + "\n" + email;

      window.location.href = "mailto:" + contactEmail
        + "?subject=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(body);
      status.textContent = "Abrimos tu cliente de correo con el mensaje listo para enviar.";
    });
  }
})();
