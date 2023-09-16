import browser from "webextension-polyfill";
import { FeedsMenuElement } from "../modules/reader/feeds-menu-element";
import type { ExtensionMessage } from "../typings/events";
import "./reader.css";

customElements.define("feeds-menu-element", FeedsMenuElement);

browser.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
  if (message.channelsUpdated) {
    document.querySelector<FeedsMenuElement>(`feeds-menu-element`)?.renderFeeds(message.channelsUpdated);
  }

  if (message.channelsData) {
    document.querySelector<FeedsMenuElement>(`feeds-menu-element`)?.renderFeeds(message.channelsData);
  }
});

// fetch on start
browser.runtime.sendMessage({ requestsChannelsData: true } satisfies ExtensionMessage);
