import browser from "webextension-polyfill";
import { parseXmlFeed } from "../modules/feed-parser/parse";
import type { ExtensionMessage } from "../typings/message";

browser.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
  if (message.fetchAll) {
    const xml = await fetch("https://css-tricks.com/feed/").then((res) => res.text());
    const parsedFeed = parseXmlFeed(xml);
    console.log("background parsed", parsedFeed);

    await browser.runtime.sendMessage({
      channelData: { ...parsedFeed, url: "https://css-tricks.com/feed/" },
    } satisfies ExtensionMessage);
  }
});
