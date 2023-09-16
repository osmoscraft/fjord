import browser from "webextension-polyfill";
import { getChannelFolderUrls, getUnreadUrls } from "../modules/bookmarks";
import { FeedsMenuElement } from "../modules/reader/feeds-menu-element";
import type { ExtensionMessage } from "../typings/events";
import "./reader.css";

customElements.define("feeds-menu-element", FeedsMenuElement);

browser.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
  if (message.channelsData) {
    const unreadUrls = new Set(await getUnreadUrls());
    document.querySelector<FeedsMenuElement>(`feeds-menu-element`)?.renderFeeds(message.channelsData, unreadUrls);
  }

  if (message.unreadUrls) {
    // re-render when unreadUrls change
    browser.runtime.sendMessage({ requestsChannelsData: true } satisfies ExtensionMessage);
  }
});

// fetch on start
// TODO only on non-metered connection
getChannelFolderUrls().then((channelFolderUrls) => {
  browser.runtime.sendMessage({ requestChannelsUpdate: { channelFolderUrls } } satisfies ExtensionMessage);
});

browser.runtime.sendMessage({ requestUnreadUrls: true } satisfies ExtensionMessage);

browser.runtime.sendMessage({ requestsChannelsData: true } satisfies ExtensionMessage);
