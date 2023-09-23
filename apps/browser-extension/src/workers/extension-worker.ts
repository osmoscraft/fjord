import browser from "webextension-polyfill";
import { getParsedConfig } from "../modules/config/config";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";
import { renderCommandBar } from "../modules/reader/render-command-bar";
import { renderChannels, type ChannelData } from "../modules/reader/render-feed";
import type { ExtensionMessage } from "../typings/message";

browser.runtime.onMessage.addListener(handleExtensionMessage);
browser.runtime.onInstalled.addListener(handleExtensionInstall);
browser.runtime.onStartup.addListener(handleBrowserStart);
(globalThis.self as any as ServiceWorkerGlobalScope).addEventListener("fetch", handleFetchEvent);

function handleExtensionMessage(message: ExtensionMessage) {
  if (message.channels) {
    browser.storage.local.set({ channelsCache: message.channels, channelsUpdatedAt: Date.now() });
  }
}

async function handleExtensionInstall() {
  await setupOffscreenDocument(backgroundPageParameters);
  const config = await getParsedConfig();
  browser.runtime.sendMessage({ fetchAll: config } satisfies ExtensionMessage);
}

async function handleBrowserStart() {
  await setupOffscreenDocument(backgroundPageParameters);
  const config = await getParsedConfig();
  browser.runtime.sendMessage({ fetchAll: config } satisfies ExtensionMessage);
}

function handleFetchEvent(event: FetchEvent) {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname === "/reader.html") {
    const responseAsync = new Promise<Response>(async (resolve) => {
      const channels = await browser.storage.local
        .get(["channelsCache"])
        .then((result) => (result.channelsCache ?? []) as ChannelData[]);

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
    ${renderCommandBar()}
    ${renderChannels(channels)}
    <script type="module" src="./reader.js"></script>
  </body>
</html>`;

      resolve(new Response(html, { headers: { "Content-Type": "text/html" } }));
    });

    event.respondWith(responseAsync);
  }
}
