import browser from "webextension-polyfill";
import { backgroundPageParameters } from "../modules/background/parameters";
import { setupOffscreenDocument } from "../modules/extension/offscreen";
import type { MessageToBackground } from "../typings/events";
import "./popup.css";

(async () => {
  document.body.addEventListener("click", async (e) => {
    const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");
    if (action === "sync") {
      await setupOffscreenDocument(backgroundPageParameters);
      browser.runtime.sendMessage({ requestFetchAllFeeds: true } satisfies MessageToBackground);
    }
  });
})();
