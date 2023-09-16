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

    // TODO handle invalid config
    const config = parseConfig(raw);

    await Promise.all(
      config.channels.map((channelConfig) =>
        fetch(channelConfig.url)
          .then((res) => res.text())
          .then((xml) => parseXmlFeed(channelConfig.url, xml))
          .then(async (channel) => {
            const inMemoryChannel = inMemoryDB.channels.get(channelConfig.url);

            const unreadItems = getUnreadItems(channel, inMemoryChannel);
            console.log(`${channelConfig.url}`, { unreadItems, channel });
            // browser.runtime.sendMessage({ channelUnreadItems: unreadItems } satisfies ExtensionMessage);
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
