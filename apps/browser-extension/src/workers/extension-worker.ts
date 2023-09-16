import browser from "webextension-polyfill";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";

browser.runtime.onInstalled.addListener(() => setupOffscreenDocument(backgroundPageParameters));
browser.runtime.onStartup.addListener(() => setupOffscreenDocument(backgroundPageParameters));

browser.history.onVisited.addListener(async (result) => {
  if (!result.url) return;
  console.log("visited", result.url);
});
