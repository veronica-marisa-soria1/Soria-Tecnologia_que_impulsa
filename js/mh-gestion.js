(() => {
  "use strict";

  const navItems = Array.from(document.querySelectorAll("[data-view]"));
  const views = Array.from(document.querySelectorAll("[data-panel]"));
  const toast = document.querySelector("#toast");
  const dialog = document.querySelector("#sale-dialog");
  const saleForm = document.querySelector("#sale-form");
  let saleNumber = 1049;
  let toastTimer;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };

  const showView = (name) => {
    views.forEach((view) => {
      const active = view.dataset.panel === name;
      view.classList.toggle("is-visible", active);
      view.hidden = !active;
    });
    navItems.forEach((item) => {
      const active = item.dataset.view === name;
      item.classList.toggle("is-active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  navItems.forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
  document.querySelectorAll("[data-view-link]").forEach((item) => item.addEventListener("click", () => showView(item.dataset.viewLink)));

  document.querySelectorAll("[data-search]").forEach((input) => {
    input.addEventListener("input", () => {
      const name = input.dataset.search;
      const query = input.value.trim().toLocaleLowerCase("es");
      const rows = Array.from(document.querySelectorAll(`[data-table="${name}"] [data-searchable]`));
      let matches = 0;
      rows.forEach((row) => {
        const visible = row.textContent.toLocaleLowerCase("es").includes(query);
        row.hidden = !visible;
        if (visible) matches += 1;
      });
      document.querySelector(`[data-empty="${name}"]`).hidden = matches > 0;
    });
  });

  document.querySelectorAll("[data-open-sale]").forEach((button) => button.addEventListener("click", () => dialog.showModal()));
  document.querySelectorAll("[data-close-sale]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  saleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(saleForm);
    const client = String(formData.get("client")).trim();
    const detail = String(formData.get("detail")).trim();
    const amount = Number(formData.get("amount"));
    const formattedAmount = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(amount);
    const row = document.createElement("tr");
    row.dataset.searchable = "";
    row.innerHTML = `<td><strong>V-${saleNumber}</strong><small>${detail.replace(/[<>]/g, "")}</small></td><td>${client.replace(/[<>]/g, "")}</td><td>Hoy, recién</td><td><span class="status status-pending">Pendiente</span></td><td class="amount-col">$ ${formattedAmount}</td>`;
    document.querySelector('[data-table="ventas"]').prepend(row);
    document.querySelector("#recent-sales").prepend(row.cloneNode(true));
    document.querySelector("#today-total").textContent = "$ " + formattedAmount;
    saleNumber += 1;
    saleForm.reset();
    dialog.close();
    showToast("Venta registrada en esta sesión.");
  });

  document.querySelectorAll("[data-add-product], [data-add-client]").forEach((button) => {
    button.addEventListener("click", () => showToast("La gestión de registros estará disponible en la versión conectada."));
  });
})();