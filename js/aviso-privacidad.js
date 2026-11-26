(() => {
  const notice = document.querySelector(".privacy-notice");
  const closeButton = document.querySelector("#dismiss-privacy-notice");
  const preferenceKey = "soria-privacy-notice-dismissed";

  try {
    if (localStorage.getItem(preferenceKey) === "1") return;
  } catch {
    // Show the notice when storage is unavailable.
  }

  notice.hidden = false;
  closeButton.addEventListener("click", () => {
    try {
      localStorage.setItem(preferenceKey, "1");
    } catch {
      // The visitor can still close the notice on this page.
    }
    notice.hidden = true;
  });
})();
