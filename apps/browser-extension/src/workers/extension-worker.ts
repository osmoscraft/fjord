import browser from "webextension-polyfill";
import { getParsedConfig } from "../modules/config/config";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";
import { renderCommandBar } from "../modules/reader/render-command-bar";
import { renderChannels, type ChannelData } from "../modules/reader/render-feed";
import { getSensibleAbsoluteTime } from "../modules/time";
import type { ExtensionMessage } from "../typings/message";

browser.runtime.onMessage.addListener(handleExtensionMessage);
browser.runtime.onInstalled.addListener(handleExtensionInstall);
browser.runtime.onStartup.addListener(handleBrowserStart);
browser.storage.sync.onChanged.addListener(handleSyncStorageChange);
(globalThis.self as any as ServiceWorkerGlobalScope).addEventListener("fetch", handleFetchEvent);

function handleSyncStorageChange(e: browser.Storage.StorageAreaSyncOnChangedChangesType) {
  console.log(`[worker] config changed, will refetch`);
  getParsedConfig()
    .then((parsedConfig) => {
      browser.runtime.sendMessage({ fetchAll: parsedConfig } satisfies ExtensionMessage);
    })
    .catch((e) => console.error(`[worker] error reading config, skip refetch`, e));
}

async function handleExtensionMessage(message: ExtensionMessage) {
  if (message.channels) {
    const now = Date.now();
    browser.storage.local.set({ channelsCache: message.channels, channelsUpdatedAt: now });
  }

  if (message.fetchCacheNewerThan !== undefined) {
    const { channelsCache, channelsUpdatedAt } = await browser.storage.local.get([
      "channelsCache",
      "channelsUpdatedAt",
    ]);
    if (!channelsUpdatedAt || !channelsCache) {
      console.log(`[worker] Cache does not exist. Fetch all`);
      const config = await getParsedConfig();
      browser.runtime.sendMessage({ fetchAll: config } satisfies ExtensionMessage);
      return;
    }

    if (message.fetchCacheNewerThan < channelsUpdatedAt) {
      console.log(`[worker] UI@${message.fetchCacheNewerThan} | Worker@${channelsUpdatedAt} | Newer cache available`);
      browser.runtime.sendMessage({ channels: channelsCache } satisfies ExtensionMessage);
    } else {
      console.log(`[worker] UI@${message.fetchCacheNewerThan} | Worker@${channelsUpdatedAt} | Cache up to date`);
    }

    browser.runtime.sendMessage({
      status: `Last updated: ${getSensibleAbsoluteTime(channelsUpdatedAt)}`,
    } satisfies ExtensionMessage);
  }
}

async function handleExtensionInstall() {
  await setupOffscreenDocument(backgroundPageParameters);
  try {
    const config = await getParsedConfig();
    browser.runtime.sendMessage({ fetchAll: config } satisfies ExtensionMessage);
  } catch (e) {
    console.log(`Error loading config, opening options`, e);
    browser.tabs.create({ url: browser.runtime.getURL("options.html") });
  }
}

async function handleBrowserStart() {
  await setupOffscreenDocument(backgroundPageParameters);
  try {
    const config = await getParsedConfig();
    browser.runtime.sendMessage({ fetchAll: config } satisfies ExtensionMessage);
  } catch (e) {
    console.log(`Error loading config, opening options`, e);
    browser.tabs.create({ url: browser.runtime.getURL("options.html") });
  }
}

function handleFetchEvent(event: FetchEvent) {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname === "/reader.html") {
    const responseAsync = new Promise<Response>(async (resolve) => {
      const results = await browser.storage.local.get(["channelsCache", "channelsUpdatedAt"]);

      const channelsCache = (results.channelsCache ?? []) as ChannelData[];
      const channelsUpdatedAt = (results.channelsUpdatedAt ?? 0) as number;

      const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fjord</title>
    <link rel="icon" type="image/svg+xml" href="./images/icon.svg" />
    <link rel="stylesheet" href="./reader.css" />
    <meta name="channelsUpdatedAt" content="${channelsUpdatedAt}" />
  </head>
  <body>
    ${renderCommandBar()}
    ${renderChannels(channelsCache)}
    <script type="module" src="./reader.js"></script>
  </body>
</html>`;

      resolve(new Response(html, { headers: { "Content-Type": "text/html" } }));
    });

    event.respondWith(responseAsync);
  }
}
