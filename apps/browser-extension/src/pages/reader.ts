import browser from "webextension-polyfill";
import type { ExtensionMessage } from "../typings/message";
import "./reader.css";

browser.runtime.onMessage.addListener(handleExtensionWorkerMessage);

function handleExtensionWorkerMessage(message: ExtensionMessage) {
  if (message.unreadUrls) {
    const unreadSet = new Set(message.unreadUrls);
    document.querySelectorAll(`a[data-unread]`).forEach((element) => {
      const url = element.getAttribute("href");
      if (!url) return;

      const isUnread = unreadSet.has(url);
      element.setAttribute("data-unread", String(isUnread));
    });
  }
}
