import browser from "webextension-polyfill";

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
