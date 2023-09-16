import browser from "webextension-polyfill";
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

    message.channelUnreadItems.map((item) =>
      browser.bookmarks.create({
        title: item.title,
        url: item.url,
        parentId: root.id,
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
  browser.runtime.sendMessage({ unreadUrls } satisfies ExtensionMessage);
}

async function markAsSeen(url: string) {
  const root = await browser.bookmarks.create({
    title: "Feed",
    parentId: "1",
  });

  const items = await browser.bookmarks.getSubTree(root.id);
  const treeNode = items.flatMap((item) => item.children?.find((child) => child.url === url)).filter(isNonNullish);

  const foundId = treeNode.at(0)?.id;
  if (foundId) {
    await browser.bookmarks.remove(foundId);
  }
}

async function getUnreadUrls() {
  const root = await browser.bookmarks.create({
    title: "Feed",
    parentId: "1",
  });

  const items = await browser.bookmarks.getSubTree(root.id);
  const urls = items.flatMap((item) => item.children?.map((child) => child.url)).filter(isNonNullish);

  return urls;
}

function isNonNullish<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
