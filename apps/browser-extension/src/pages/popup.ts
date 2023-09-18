import browser from "webextension-polyfill";
import "./popup.css";

document.body.addEventListener("click", async (e) => {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");

  if (action === "options") {
    window.open(browser.runtime.getURL("options.html"));
  }

  if (action === "open-reader") {
    window.open(browser.runtime.getURL("reader.html"));
  }

  if (action === "reset") {
    browser.runtime.reload();
  }
});
