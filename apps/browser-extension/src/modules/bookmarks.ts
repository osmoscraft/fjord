import browser from "webextension-polyfill";
import { dataUrlToObject, objectToDataUrl } from "./codec";
import type { ChannelData, ChannelDataWithUnreadUrls } from "./reader/render-feed";

export async function getChannels(): Promise<ChannelDataWithUnreadUrls[]> {
  const root = await getRoot();
  const channelBookmarks = (await browser.bookmarks.getChildren(root.id)).filter((item) => Boolean(item.url));

  const channels = await Promise.all(
    channelBookmarks.map((channelBookmark) => dataUrlToObject<ChannelDataWithUnreadUrls>(channelBookmark.url!))
  );

  return channels;
}

export async function setChannelBookmark(channelData: ChannelData) {
  const root = await getRoot();
  const existingBookmark = (await browser.bookmarks.getChildren(root.id)).find(
    (child) => child.title === channelData.url
  );

  if (existingBookmark) {
    // new items to be marked as unread
    const unreadUrls = await getAllUnreadUrls();
    console.log("unread", unreadUrls);

    const existingChannelData = await dataUrlToObject<ChannelDataWithUnreadUrls>(existingBookmark.url!);
    const mergedChannelData = mergeBookmark(channelData, existingChannelData, unreadUrls);

    const dataUrl = await objectToDataUrl(mergedChannelData);
    await browser.bookmarks.update(existingBookmark.id, {
      url: dataUrl,
    });
  } else {
    // when creating a channel, consider all urls as read

    const dataUrl = await objectToDataUrl({ ...channelData, unreadUrls: [] } satisfies ChannelDataWithUnreadUrls);
    await browser.bookmarks.create({
      title: channelData.url,
      url: dataUrl,
      parentId: root.id,
    });
  }
}

export async function setIsUnread(url: string, isUnread: boolean) {
  // iterate over all channels, remove url from unreadUrls
  const root = await getRoot();
  const channelBookmarks = (await browser.bookmarks.getChildren(root.id)).filter((item) => Boolean(item.url));
  await Promise.all(
    channelBookmarks.map(async (channelBookmark) => {
      const channelData = await dataUrlToObject<ChannelDataWithUnreadUrls>(channelBookmark.url!);
      const updatedChannelData = {
        ...channelData,
        unreadUrls: isUnread
          ? [...new Set([...channelData.unreadUrls, url])]
          : channelData.unreadUrls.filter((unreadUrl) => unreadUrl !== url),
      };

      await browser.bookmarks.update(channelBookmark.id, {
        url: await objectToDataUrl(updatedChannelData),
      });
    })
  );
}

function isNonNullish<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

async function getAllUnreadUrls(): Promise<Set<string>> {
  const root = await getRoot();

  const existingChannelDataList = await Promise.all(
    (
      await browser.bookmarks.getChildren(root.id)
    ).map((channel) => dataUrlToObject<ChannelDataWithUnreadUrls>(channel.url!))
  );

  const allUnreadUrls = existingChannelDataList.flatMap((channelData) => channelData.unreadUrls ?? []);
  const uniqueUnreadUrls = new Set(allUnreadUrls);

  return uniqueUnreadUrls;
}

function mergeBookmark(
  incoming: ChannelData,
  existing: ChannelDataWithUnreadUrls,
  unreadUrls: Set<string>
): ChannelDataWithUnreadUrls {
  const existingItemUrls = new Set(existing.items.map((item) => item.url));
  const channelItemUrls = new Set([
    ...incoming.items.map((item) => item.url),
    ...existing.items.map((item) => item.url),
  ]);

  const newItems = incoming.items.filter((item) => !existingItemUrls.has(item.url));

  const mergedChannelData: ChannelDataWithUnreadUrls = {
    ...incoming,
    items: [...incoming.items, ...existing.items].filter(
      (item, index, arr) => arr.findIndex((i) => i.url === item.url) === index
    ),
    unreadUrls: [...newItems.map((item) => item.url), ...unreadUrls].filter((url) => channelItemUrls.has(url)),
  };

  return mergedChannelData;
}

export async function getRoot() {
  const root = await browser.bookmarks.create({
    title: "Feed",
    parentId: "1",
  });

  return root;
}
