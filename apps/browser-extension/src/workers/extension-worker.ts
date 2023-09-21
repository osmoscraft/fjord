import browser from "webextension-polyfill";
import { getAllUnreadUrls, getChannels, setChannelBookmark, setIsUnread } from "../modules/bookmarks";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";
import { renderChannels } from "../modules/reader/render-feed";
import type { ExtensionMessage } from "../typings/message";

(globalThis.self as any as ServiceWorkerGlobalScope).addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname === "/reader.html") {
    const responseAsync = new Promise<Response>(async (resolve) => {
      const channels = await getChannels();
      const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fjord</title>
    <link rel="icon" type="image/svg+xml" href="./images/icon.svg" />
    <link rel="stylesheet" href="./reader.css" />
  </head>
  <body>
    ${renderChannels(channels)}
    <script type="module" src="./reader.js"></script>
  </body>
</html>`;
      console.log("channels", { channels, html });
      resolve(new Response(html, { headers: { "Content-Type": "text/html" } }));
    });

    event.respondWith(responseAsync);
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

async function handleBookmarksChange() {
  const unreadUrls = await getAllUnreadUrls();
  browser.runtime.sendMessage({ unreadUrls: [...unreadUrls] } satisfies ExtensionMessage);
}

async function handleExtensionWorkerMessage(message: ExtensionMessage) {
  if (message.channelData) {
    setChannelBookmark(message.channelData);
  }
}

function handleVisit(result: browser.History.HistoryItem) {
  if (!result.url) return;
  console.log(`[read status] marked as read: ${result.url}`);
  setIsUnread(result.url, false);
}
