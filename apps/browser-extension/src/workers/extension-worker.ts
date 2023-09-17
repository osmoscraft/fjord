import browser from "webextension-polyfill";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";

browser.runtime.onInstalled.addListener(handleExtensionInstall);
browser.runtime.onStartup.addListener(handleBrowserStart);
browser.runtime.onMessage.addListener(handleExtensionWorkerMessage);
browser.bookmarks.onChanged.addListener(handleBookmarksChange);
browser.bookmarks.onRemoved.addListener(handleBookmarksChange);
browser.bookmarks.onCreated.addListener(handleBookmarksChange);
browser.bookmarks.onMoved.addListener(handleBookmarksChange);
browser.history.onVisited.addListener(handleVisit);

function handleExtensionInstall() {
  return setupOffscreenDocument(backgroundPageParameters);
}

function handleBrowserStart() {
  return setupOffscreenDocument(backgroundPageParameters);
}

function handleBookmarksChange() {}

function handleExtensionWorkerMessage(message: any, sender: browser.Runtime.MessageSender, sendResponse: () => void) {}

function handleVisit(result: browser.History.HistoryItem) {}
