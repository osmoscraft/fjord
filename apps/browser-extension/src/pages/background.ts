import browser from "webextension-polyfill";
import { getRawConfig, parseConfig } from "../modules/config/config";
import { parseXmlFeed } from "../modules/feed-parser/parse";
import type { FeedChannel } from "../modules/feed-parser/types";
import type { ExtensionMessage } from "../typings/events";

browser.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
  if (message.requestFetchAllFeeds) {
    const raw = getRawConfig();
    if (!raw) throw new Error("Missing config");

    // TODO handle invalid config
    const config = parseConfig(raw);

    const feeds: FeedChannel[] = [];

    await Promise.all(
      config.channels.map((channel) =>
        fetch(channel.url)
          .then((res) => res.text())
          .then((xml) => parseXmlFeed(channel.url, xml))
          .then((feed) => {
            feeds.push(feed);
            browser.runtime.sendMessage({
              didFetchFeed: feed,
            } satisfies ExtensionMessage);
          })
      )
    );

    browser.runtime.sendMessage({
      didFetchAllFeeds: feeds,
    } satisfies ExtensionMessage);
  }
});
