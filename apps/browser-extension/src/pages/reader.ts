import browser from "webextension-polyfill";
import { FeedsMenuElement } from "../modules/reader/feeds-menu-element";
import type { ExtensionMessage } from "../typings/events";
import "./reader.css";

customElements.define("feeds-menu-element", FeedsMenuElement);

browser.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
  if (message.didFetchFeed) {
    console.log(message.didFetchFeed);
  }

  if (message.didFetchAllFeeds) {
    document.querySelector<FeedsMenuElement>(`feeds-menu-element`)?.renderFeeds(message.didFetchAllFeeds);
    console.log(message.didFetchAllFeeds);
  }
});

// fetch on start
browser.runtime.sendMessage({ requestFetchAllFeeds: true } satisfies ExtensionMessage);
