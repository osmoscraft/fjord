import browser from "webextension-polyfill";
import { getRawConfig, parseConfig } from "../modules/config/config";
import { parseXmlFeed } from "../modules/feed-parser/parse";
import type { ExtensionMessage } from "../typings/message";

browser.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
  if (message.fetchAll) {
    const rawConfig = getRawConfig();
    if (!rawConfig) throw new Error("missing config");

    const config = parseConfig(rawConfig);

    config.channels.map(async (channel) => {
      await fetch(channel.url)
        .then((res) => res.text())
        .then((xml) => {
          const parsedFeed = parseXmlFeed(xml);
          console.log("[background] parsed", parsedFeed);

          browser.runtime.sendMessage({
            channelData: { ...parsedFeed, url: channel.url },
          } satisfies ExtensionMessage);
        })
        .catch((e) => console.log("[background] parse error", { channel }));
    });
  }
});
