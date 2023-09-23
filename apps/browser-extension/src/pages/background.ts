import browser from "webextension-polyfill";
import { parseXmlFeed } from "../modules/feed-parser/parse";
import type { ChannelData } from "../modules/reader/render-feed";
import type { ExtensionMessage } from "../typings/message";

browser.runtime.onMessage.addListener(handleExtensionMessage);

async function handleExtensionMessage(
  message: ExtensionMessage,
  _sender: browser.Runtime.MessageSender,
  _sendResponse: (...args: any) => any
) {
  if (message.fetchAll) {
    const config = message.fetchAll;

    const results = await Promise.allSettled(
      config.channels.map(async (channel) =>
        fetch(channel.url)
          .then((res) => res.text())
          .then((xml) => {
            const parsedFeed = parseXmlFeed(xml);
            console.log("[background] parsed", parsedFeed);
            return parsedFeed;
          })
          .catch((err) => {
            console.error(`[background] error fetching ${channel.url}`, err);
            throw err;
          })
      )
    ).then((results) => results.filter(isSuccessfullySettled).map((result) => result.value) as ChannelData[]);

    browser.runtime.sendMessage({ channels: results } satisfies ExtensionMessage);
  }
}

function isSuccessfullySettled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}
