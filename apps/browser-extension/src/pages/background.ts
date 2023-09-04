import browser from "webextension-polyfill";
import { getRawConfig, parseConfig } from "../modules/config/config";
import { parseXmlFeed } from "../modules/feed-parser/parse";
import type { MessageToBackground, MessageToExtensionWorker } from "../typings/events";

browser.runtime.onMessage.addListener((message: MessageToBackground) => {
  if (message.requestFetchAllFeeds) {
    const raw = getRawConfig();
    if (!raw) throw new Error("Missing config");

    // TODO handle invalid config
    const config = parseConfig(raw);
    browser.runtime.sendMessage({
      willFetchAllFeeds: config,
    } satisfies MessageToExtensionWorker);

    config.channels.map((channel) =>
      fetch(channel.url)
        .then((res) => res.text())
        .then(parseXmlFeed)
        .then((feed) => {
          browser.runtime.sendMessage({
            didFetchFeed: feed,
          } satisfies MessageToExtensionWorker);
        })
    );
  }
});
