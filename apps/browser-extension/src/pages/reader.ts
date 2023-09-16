import browser from "webextension-polyfill";
import { getUnreadUrls } from "../modules/bookmarks";
import { FeedsMenuElement } from "../modules/reader/feeds-menu-element";
import type { ExtensionMessage } from "../typings/events";
import "./reader.css";

customElements.define("feeds-menu-element", FeedsMenuElement);

browser.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
  if (message.channelsData) {
    const unreadUrls = new Set(await getUnreadUrls());
    document.querySelector<FeedsMenuElement>(`feeds-menu-element`)?.renderFeeds(message.channelsData, unreadUrls);
  }
});

// fetch on start
// TODO only on non-metered connection
browser.runtime.sendMessage({ requestChannelsUpdate: true } satisfies ExtensionMessage);
browser.runtime.sendMessage({ requestUnreadUrls: true } satisfies ExtensionMessage);

browser.runtime.sendMessage({ requestsChannelsData: true } satisfies ExtensionMessage);
