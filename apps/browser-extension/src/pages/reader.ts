import browser from "webextension-polyfill";
import { getParsedConfig } from "../modules/config/config";
import type { ExtensionMessage } from "../typings/message";
import "./reader.css";

browser.storage.local.onChanged.addListener(() => location.reload());
browser.runtime.sendMessage({ fetchCacheNewerThan: getChannelsUpdatedAt() } satisfies ExtensionMessage);
browser.runtime.onMessage.addListener(handleExtensionMessage);

document.body.addEventListener("click", handleClickEvent);

const status = document.querySelector<HTMLSpanElement>("#status")!;

async function handleClickEvent(e: MouseEvent) {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");

  if (action === "options") {
    location.assign(browser.runtime.getURL("options.html"));
  }

  if (action === "fetch") {
    const config = await getParsedConfig();
    browser.runtime.sendMessage({ fetchAll: config } satisfies ExtensionMessage);
  }

  if (action === "toggle-date-visit") {
    const relatedUrlList = [
      ...((e.target as HTMLElement)?.closest("fieldset")?.querySelectorAll<HTMLAnchorElement>("a.js-visit-target") ??
        []),
    ].map((anchor) => anchor.href);

    console.log("toggle", relatedUrlList);

    const records = await Promise.all(
      relatedUrlList.map(async (url) =>
        browser.history.getVisits({ url }).then((visits) => ({
          url,
          isVisited: visits.length,
        }))
      )
    );

    const unvisited = records.filter((record) => !record.isVisited);

    if (unvisited.length) {
      // set all as visited
      unvisited.map((record) => record.url).map((url) => browser.history.addUrl({ url }));
    } else {
      records.map((record) => record.url).map((url) => browser.history.deleteUrl({ url }));
    }
  }

  if (action === "mark-all-as-read") {
    const relatedUrlList = [...(document.querySelectorAll<HTMLAnchorElement>("a.js-visit-target") ?? [])].map(
      (anchor) => anchor.href
    );

    relatedUrlList.map((url) => browser.history.addUrl({ url }));
  }
}

function getChannelsUpdatedAt() {
  const timeString = document.querySelector(`meta[name="channelsUpdatedAt"]`)?.getAttribute("content") ?? "0";
  try {
    return parseInt(timeString);
  } catch (e) {
    console.error(`Error parsing timestamp`, e);
    return 0;
  }
}

function handleExtensionMessage(e: ExtensionMessage) {
  if (e.status !== undefined) {
    status.textContent = e.status;
  }
}
