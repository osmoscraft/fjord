import browser from "webextension-polyfill";
import { getUnreadUrls, markAsSeen } from "../modules/bookmarks";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";
import type { ExtensionMessage } from "../typings/events";

browser.runtime.onInstalled.addListener(() => setupOffscreenDocument(backgroundPageParameters));
browser.runtime.onStartup.addListener(() => setupOffscreenDocument(backgroundPageParameters));
browser.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
  if (message.requestUnreadUrls) {
    emitUnseenUrls();
  }

  if (message.channelUnreadItems) {
    const root = await browser.bookmarks.create({
      title: "Feed",
      parentId: "1",
    });

    const channelFolder = await browser.bookmarks.create({
      title: message.channelUnreadItems.channelUrl,
      parentId: root.id,
    });

    message.channelUnreadItems.items.map((item) =>
      browser.bookmarks.create({
        title: item.title,
        url: item.url,
        parentId: channelFolder.id,
      })
    );
  }
});

browser.bookmarks.onChanged.addListener(emitUnseenUrls);
browser.bookmarks.onRemoved.addListener(emitUnseenUrls);
browser.bookmarks.onCreated.addListener(emitUnseenUrls);
browser.bookmarks.onMoved.addListener(emitUnseenUrls);

browser.history.onVisited.addListener(async (result) => {
  if (!result.url) return;
  markAsSeen(result.url);
});

async function emitUnseenUrls() {
  const unreadUrls = await getUnreadUrls();
  console.log("unreadUrls changed", { unreadUrls });
  browser.runtime.sendMessage({ unreadUrls } satisfies ExtensionMessage);
}
