import browser from "webextension-polyfill";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";
import type { MessageToExtensionWorker } from "../typings/events";

const preference = { runOnStartUp: false };

if (preference.runOnStartUp) {
  browser.runtime.onInstalled.addListener(() => setupOffscreenDocument(backgroundPageParameters));
  browser.runtime.onStartup.addListener(() => setupOffscreenDocument(backgroundPageParameters));
}

browser.history.onVisited.addListener(async (result) => {
  if (!result.url) return;
  console.log("visited", result.url);
});

// merge bookmarks
browser.runtime.onMessage.addListener(async (message: MessageToExtensionWorker) => {
  if (message.didFetchFeed) {
    console.log("did fetch feed", message.didFetchFeed);
  }

  if (message.didFetchAllFeeds) {
    console.log("did fetch all feeds", message.didFetchAllFeeds);
  }
});
