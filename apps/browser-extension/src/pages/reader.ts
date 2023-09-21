import browser from "webextension-polyfill";
import { updateStatus } from "../modules/bookmarks";
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

document.body.addEventListener("click", (e) => {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");

  if (action === "toggle-daily") {
    const relatedUrls = [...((e.target as HTMLElement)?.closest("fieldset")?.querySelectorAll("a[data-unread]") ?? [])];
    const unreadUrls = relatedUrls
      .filter((element) => element.getAttribute("data-unread") === "true")
      .map((element) => element.getAttribute("href")!);
    const readUrls = relatedUrls
      .filter((element) => element.getAttribute("data-unread") === "false")
      .map((element) => element.getAttribute("href")!);

    if (!unreadUrls.length) {
      updateStatus(readUrls.map((url) => ({ url, isUnread: true })));
    } else {
      updateStatus(unreadUrls.map((url) => ({ url, isUnread: false })));
    }
  }
});
