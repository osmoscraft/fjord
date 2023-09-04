import browser from "webextension-polyfill";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";
import type { MessageToExtensionWorker } from "../typings/events";

const preference = { runOnStartUp: false };

if (preference.runOnStartUp) {
  browser.runtime.onInstalled.addListener(() => setupOffscreenDocument(backgroundPageParameters));
  browser.runtime.onStartup.addListener(() => setupOffscreenDocument(backgroundPageParameters));
}

browser.runtime.onMessage.addListener(async (message: MessageToExtensionWorker) => {
  if (message.willFetchAllFeeds) {
    // ensure root folder exists
    const existingRootFolder = await browser.bookmarks.search({
      title: "Fjord",
      url: "",
    });

    console.log("search", existingRootFolder);
  }

  if (message.didFetchFeed) {
    const feed = message.didFetchFeed;
    const rootFolder = await browser.bookmarks.create({ title: "Fjord", parentId: "1", index: 0 }); // HACK: 1 is the "Favorites bar"
    const feedFolder = await browser.bookmarks.create({ title: feed.title, parentId: rootFolder.id });
    console.log("fetched", { feed, rootFolder, feedFolder });

    Promise.all(
      feed.items
        .slice(0, 10)
        .map((item, index) => browser.bookmarks.create({ title: item.title, url: item.url, parentId: feedFolder.id }))
    );
  }
});
