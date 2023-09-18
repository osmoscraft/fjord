import browser from "webextension-polyfill";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";

(globalThis.self as any as ServiceWorkerGlobalScope).addEventListener("fetch", (event) => {
  // return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname === "/reader.html") {
    // SSR render html "<h1>Hello World</h1>"
    event.respondWith(new Response(`<pre>SSR HTML Placeholder</pre>`, { headers: { "Content-Type": "text/html" } }));
  }
});

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
