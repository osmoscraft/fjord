import browser from "webextension-polyfill";
import { FeedsMenuElement } from "../modules/reader/feeds-menu-element";
import type { ExtensionMessage } from "../typings/events";
import "./reader.css";

customElements.define("feeds-menu-element", FeedsMenuElement);

interface State {
  channelsData?: ExtensionMessage["channelsData"];
  unreadUrls?: Set<string>;
}
const state: State = {};

browser.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
  if (message.channelsData) {
    state.channelsData = message.channelsData;
    render(state);
  }

  if (message.unreadUrls) {
    state.unreadUrls = new Set(message.unreadUrls);
    render(state);
  }
});

function render(state: State) {
  if (!state.channelsData || !state.unreadUrls) return;
  document.querySelector<FeedsMenuElement>(`feeds-menu-element`)?.renderFeeds(state.channelsData, state.unreadUrls);
}

// fetch on start
// TODO only on non-metered connection
browser.runtime.sendMessage({ requestChannelsUpdate: true } satisfies ExtensionMessage);
browser.runtime.sendMessage({ requestUnreadUrls: true } satisfies ExtensionMessage);

browser.runtime.sendMessage({ requestsChannelsData: true } satisfies ExtensionMessage);
