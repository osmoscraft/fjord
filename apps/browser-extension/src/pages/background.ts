import browser from "webextension-polyfill";
import { getRawConfig, parseConfig } from "../modules/config";
import { parseXmlFeed } from "../modules/feed-parser/parse";
import type { MessageToBackground } from "../typings/events";

browser.runtime.onMessage.addListener((message: MessageToBackground) => {
  if (message.requestFetchAllFeeds) {
    const raw = getRawConfig();
    if (!raw) throw new Error("Missing config");

    // TODO handle invalid config
    const config = parseConfig<{ channels: any[] }>(raw);
    config.channels.map((channel) =>
      fetch(channel.url)
        .then((res) => res.text())
        .then(parseXmlFeed)
        .then((feed) => {
          browser.runtime.sendMessage({
            feed,
          });
        })
    );
  }
});
