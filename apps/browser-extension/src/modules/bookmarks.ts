import browser from "webextension-polyfill";
import { dataUrlToObject, objectToDataUrl } from "./codec";
import type { ChannelData } from "./reader/render-feed";

export async function getChannels(): Promise<ChannelData[]> {
  const root = await browser.bookmarks.create({
    title: "Feed",
    parentId: "1",
  });

  const channelFolders = (await browser.bookmarks.getChildren(root.id)).filter((item) => Boolean(item.url));

  const channels = await Promise.all(
    channelFolders.map((channelFolder) => dataUrlToObject<ChannelData>(channelFolder.url!))
  );

  return channels;
}

export async function setChannelBookmark(channelData: ChannelData) {
  const root = await browser.bookmarks.create({
    title: "Feed",
    parentId: "1",
  });
  const dataUrl = await objectToDataUrl(JSON.stringify(channelData));

  const existingBookmark = (await browser.bookmarks.getChildren(root.id)).find(
    (child) => child.title === channelData.url
  );
  if (existingBookmark) {
    await browser.bookmarks.update(existingBookmark.id, {
      url: dataUrl,
    });
  } else {
    await browser.bookmarks.create({
      title: channelData.url,
      url: dataUrl,
      parentId: root.id,
    });
  }
}

export async function markAsSeen(url: string) {
  const root = await browser.bookmarks.create({
    title: "Feed",
    parentId: "1",
  });

  const channelFolders = (await browser.bookmarks.getSubTree(root.id)).at(0)?.children ?? [];
  const pageMatches = channelFolders
    .map((channel) => channel.children?.find((child) => child.url === url))
    .filter(isNonNullish);

  const foundId = pageMatches.at(0)?.id;
  if (foundId) {
    await browser.bookmarks.remove(foundId);
  }
}

export async function getUnreadUrls() {
  const root = await browser.bookmarks.create({
    title: "Feed",
    parentId: "1",
  });

  const channels = (await browser.bookmarks.getSubTree(root.id))?.[0].children ?? [];
  const urls = channels.flatMap((channel) => channel.children?.map((child) => child.url)).filter(isNonNullish);

  return urls;
}

export async function getChannelFolderUrls() {
  const root = await browser.bookmarks.create({
    title: "Feed",
    parentId: "1",
  });

  const channels = (await browser.bookmarks.getSubTree(root.id))?.[0].children ?? [];
  const urls = channels
    .map((channel) => channel.title)
    .filter(isNonNullish)
    .filter(isUrl);

  return urls;
}

function isNonNullish<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

function isUrl(maybeUrl: string): boolean {
  try {
    new URL(maybeUrl);
    return true;
  } catch {
    return false;
  }
}
