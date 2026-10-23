(() => {
  "use strict";

  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".panel"));
  const selectors = Array.from(document.querySelectorAll("[data-field-select]"));
  const fields = {
    esperanza: { name: "La Esperanza", lot: "La Esperanza · Lote 3", crop: "Maíz temprano", stage: "V6 · crecimiento vegetativo", soil: "68%", risk: "Riesgo bajo", title: "Buenas condiciones para recorrer el lote", insight: "La humedad estimada y el pronóstico sugieren priorizar el monitoreo de malezas antes de una nueva lluvia.", note: "Recorrer cabeceras después de las lluvias" },
    ombu: { name: "El Ombú", lot: "El Ombú · Lote 1", crop: "Soja · grupo largo", stage: "V4 · desarrollo vegetativo", soil: "54%", risk: "Riesgo moderado", title: "Conviene verificar la humedad del perfil", insight: "La lectura de muestra es menor en este lote. Revisá el suelo en varios puntos antes de definir labores.", note: "Tomar una nueva lectura de humedad" },
  };

  const showPanel = (name) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== name; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => showPanel(tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[target].focus();
      showPanel(tabs[target].dataset.tab);
    });
  });

  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => showPanel(button.dataset.go));
  });

  const updateField = (key) => {
    const field = fields[key] || fields.esperanza;
    selectors.forEach((select) => { select.value = key; });
    document.querySelector("[data-field-name]").innerHTML = `${field.name} <span>· ${key === "ombu" ? "Lote 1" : "Lote 3"}</span>`;
    document.querySelector("[data-crop-name]").innerHTML = `${field.crop} <span>· ${field.stage}</span>`;
    document.querySelector("[data-soil]").innerHTML = `${field.soil.slice(0, -1)}<em>%</em>`;
    document.querySelector("[data-risk]").textContent = field.risk;
    document.querySelector("[data-insight-title]").textContent = field.title;
    document.querySelector("[data-insight]").textContent = field.insight;
    document.querySelector("[data-lot-detail]").textContent = field.lot;
    document.querySelector("[data-lot-crop]").textContent = field.crop;
    document.querySelector("[data-lot-stage]").textContent = field.stage;
    document.querySelector("[data-lot-soil]").textContent = field.soil;
    document.querySelector("[data-lot-risk]").textContent = field.risk.replace("Riesgo ", "");
    document.querySelector("[data-lot-note]").textContent = field.note;
  };
  selectors.forEach((select) => select.addEventListener("change", () => updateField(select.value)));
})();