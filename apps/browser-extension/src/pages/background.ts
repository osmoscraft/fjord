import browser from "webextension-polyfill";
import { getRawConfig, parseConfig } from "../modules/config/config";
import { parseXmlFeed } from "../modules/feed-parser/parse";
import type { FeedChannel } from "../modules/feed-parser/types";
import type { ExtensionMessage } from "../typings/events";

const inMemoryDB = {
  channels: new Map<string, FeedChannel>(),
};

browser.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
  if (message.requestChannelsUpdate) {
    const raw = getRawConfig();
    if (!raw) throw new Error("Missing config");

    console.log("requestChannelsUpdate", message.requestChannelsUpdate);
    const channelFolderUrlMap = new Set(message.requestChannelsUpdate.channelFolderUrls);

    // TODO handle invalid config
    const config = parseConfig(raw);

    await Promise.all(
      config.channels.map((channelConfig) =>
        fetch(channelConfig.url)
          .then((res) => res.text())
          .then((xml) => parseXmlFeed(channelConfig.url, xml))
          .then((channel) => ({
            ...channel,
            items: channel.items
              // HACK: prevent perf issue with count freshness limit
              .filter((item) => item.timePublished > new Date(Date.now() - 365 * 24 * 3600 * 1000).getTime())
              .slice(0, 10),
          }))
          .then(async (channel) => {
            const inMemoryChannel = inMemoryDB.channels.get(channelConfig.url);
            const unreadItems = channelFolderUrlMap.has(channel.url) ? getUnreadItems(channel, inMemoryChannel) : [];
            console.log(`Merge ${channelConfig.url}`, { unreadItems, channel });
            browser.runtime.sendMessage({
              channelUnreadItems: { channelUrl: channel.url, items: unreadItems },
            } satisfies ExtensionMessage);
            inMemoryDB.channels.set(channelConfig.url, channel);
          })
      )
    );

    browser.runtime.sendMessage({
      channelsData: [...inMemoryDB.channels.values()],
    } satisfies ExtensionMessage);
  }

  if (message.requestsChannelsData) {
    browser.runtime.sendMessage({
      channelsData: [...inMemoryDB.channels.values()],
    } satisfies ExtensionMessage);
  }
});

function getUnreadItems(incomingChannel: FeedChannel, existingChannel?: FeedChannel): { url: string; title: string }[] {
  const unreadItems = incomingChannel.items
    .filter((item) =>
      existingChannel ? existingChannel.items.every((existingItem) => existingItem.url !== item.url) : true
    )
    .map((item) => ({
      url: item.url,
      title: item.title,
    }));

  return unreadItems;
}
