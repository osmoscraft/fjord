import browser from "webextension-polyfill";
import { getParsedConfig } from "../modules/config/config";
import type { ExtensionMessage } from "../typings/message";
import "./reader.css";

browser.storage.local.onChanged.addListener(() => location.reload());

document.body.addEventListener("click", async (e) => {
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
});
