import browser from "webextension-polyfill";
import type { ExtensionMessage } from "../typings/message";
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

  if (action === "clear") {
    browser.storage.local.clear();
  }

  if (action === "fetch") {
    browser.runtime.sendMessage({ fetchAll: true } satisfies ExtensionMessage);
  }
});
