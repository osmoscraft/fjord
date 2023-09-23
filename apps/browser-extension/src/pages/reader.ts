import browser from "webextension-polyfill";
import { getParsedConfig } from "../modules/config/config";
import type { ExtensionMessage } from "../typings/message";
import "./reader.css";

browser.storage.local.onChanged.addListener(() => location.reload());

document.body.addEventListener("click", async (e) => {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");

  if (action === "options") {
    window.open(browser.runtime.getURL("options.html"));
  }

  if (action === "fetch") {
    const config = await getParsedConfig();
    browser.runtime.sendMessage({ fetchAll: config } satisfies ExtensionMessage);
  }
});
