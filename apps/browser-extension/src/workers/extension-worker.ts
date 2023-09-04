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
    });

    console.log("search", existingRootFolder);
  }

  if (message.didFetchFeed) {
    // TODO implement declarative merge: compute latest value, then resolve difference

    const feed = message.didFetchFeed;
    const rootFolder = await browser.bookmarks.create({ title: "Fjord", parentId: "1", index: 0 }); // HACK: 1 is the "Favorites bar"

    const existingChannels = (await browser.bookmarks.getSubTree(rootFolder.id))[0]?.children ?? [];
    const existingChannel = existingChannels.find(
      (node) => !node.url && (node.title === feed.title || undecorateFeedTitle(node.title) === feed.title)
    );

    const channelFolder =
      existingChannel ?? (await browser.bookmarks.create({ title: feed.title, parentId: rootFolder.id }));
    const existingItems = (await browser.bookmarks.getSubTree(channelFolder.id))[0]?.children ?? [];

    const sortedNewItems = feed.items.sort((a, b) => a.timePublished - b.timePublished).slice(-10);

    for (const newItem of sortedNewItems) {
      const existingItem = existingItems.find((existingItem) => existingItem.url === newItem.url);

      // update existing item
      if (existingItem) {
        await browser.bookmarks.update(existingItem.id, {
          title: setItemTitleIsUnread(newItem.title, isItemTitleUnread(existingItem.title)),
          url: newItem.url,
        });
      } else {
        await browser.bookmarks.create({
          title: setItemTitleIsUnread(newItem.title, !!existingChannel),
          index: 0,
          url: newItem.url,
          parentId: channelFolder.id,
        });
      }
    }

    const allChannelItems = (await browser.bookmarks.getSubTree(channelFolder.id))[0]?.children ?? [];
    const remainingItems = allChannelItems.slice(0, 10);
    const removeItems = allChannelItems.slice(10);
    await Promise.all(removeItems.map((item) => browser.bookmarks.remove(item.id)));

    const newCount = remainingItems.reduce((count, item) => {
      return count + (isItemTitleUnread(item.title) ? 1 : 0);
    }, 0);

    browser.bookmarks.update(channelFolder.id, { title: newCount ? `(${newCount}) ${feed.title}` : feed.title });
  }
});

function undecorateFeedTitle(title: string) {
  if (title.match(/^\(\d+\)\s.*/)) {
    return title.replace(/^\(\d+\)\s/, "");
  } else {
    return title;
  }
}

function isItemTitleUnread(title: string) {
  return title.startsWith("• ");
}

function setItemTitleIsUnread(title: string, isUnread: boolean) {
  const undecoratedTitel = title.startsWith("• ") ? title.slice(2) : title;
  return isUnread ? `• ${undecoratedTitel}` : undecoratedTitel;
}
