import browser from "webextension-polyfill";
import type { ExtensionMessage } from "../typings/message";
import "./reader.css";

browser.storage.local.onChanged.addListener(() => location.reload());

document.body.addEventListener("click", async (e) => {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");

  if (action === "options") {
    window.open(browser.runtime.getURL("options.html"));
  }

  if (action === "fetch") {
    browser.runtime.sendMessage({ fetchAll: true } satisfies ExtensionMessage);
  }
});
