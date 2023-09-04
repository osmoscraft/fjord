import browser from "webextension-polyfill";
import type { Feed } from "../modules/feed-parser/types";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";

const preference = { runOnStartUp: false };

if (preference.runOnStartUp) {
  browser.runtime.onInstalled.addListener(() => setupOffscreenDocument(backgroundPageParameters));
  browser.runtime.onStartup.addListener(() => setupOffscreenDocument(backgroundPageParameters));
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message.feed) {
    const feed = message.feed as Feed;
    console.log("parsed", feed);
    const rootFolder = await browser.bookmarks.create({ title: "Fjord", parentId: "1", index: 0 }); // HACK: 1 is the "Favorites bar"
    console.log(rootFolder);

    const feedFolder = await browser.bookmarks.create({ title: feed.title, parentId: rootFolder.id });

    Promise.all(
      feed.items
        .slice(0, 10)
        .map((item, index) => browser.bookmarks.create({ title: item.title, url: item.url, parentId: feedFolder.id }))
    );
  }
});
