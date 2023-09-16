import browser from "webextension-polyfill";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";
import type { ExtensionMessage } from "../typings/events";
import "./popup.css";

document.body.addEventListener("click", async (e) => {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");
  if (action === "fetch") {
    await setupOffscreenDocument(backgroundPageParameters);
    browser.runtime.sendMessage({ requestFetchAllFeeds: true } satisfies ExtensionMessage);
  }

  if (action === "options") {
    window.open(browser.runtime.getURL("options.html"));
  }

  if (action === "open-reader") {
    window.open(browser.runtime.getURL("reader.html"));
  }
});
