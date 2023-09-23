import browser from "webextension-polyfill";
import { parse } from "yaml";
import { compressString } from "../modules/compression";
// import { getRawConfig, parseConfig, setRawConfig } from "../modules/config/config";
import { getParsedConfig, getRawConfig } from "../modules/config/config";
import example from "../modules/config/example.yaml";
import { teardownOffscreenDocument } from "../modules/offscreen";
import type { ExtensionMessage } from "../typings/message";
import "./options.css";

const form = document.querySelector("form")!;
const textarea = document.querySelector("textarea")!;
const localUsage = document.querySelector<HTMLMeterElement>("#local-usage")!;
const syncUsage = document.querySelector<HTMLMeterElement>("#sync-usage")!;
const localStats = document.querySelector<HTMLSpanElement>("#local-stats")!;
const syncStats = document.querySelector<HTMLSpanElement>("#sync-stats")!;

getRawConfig().then((value) => (textarea.value = value));

reportStorageUsage();
browser.storage.onChanged.addListener(reportStorageUsage);

function reportStorageUsage() {
  (browser.storage.local as any).getBytesInUse().then((bytes: any) => {
    localUsage.max = browser.storage.local.QUOTA_BYTES;
    localUsage.value = bytes;
    localStats.innerText = `${bytes} / ${browser.storage.local.QUOTA_BYTES} (${(
      (100 * bytes) /
      browser.storage.local.QUOTA_BYTES
    ).toFixed(2)}%)`;
  });

  (browser.storage.sync as any).getBytesInUse().then((bytes: any) => {
    syncUsage.max = browser.storage.sync.QUOTA_BYTES_PER_ITEM;
    syncUsage.value = bytes;
    syncStats.innerText = `${bytes} / ${browser.storage.sync.QUOTA_BYTES_PER_ITEM} (${(
      (100 * bytes) /
      browser.storage.sync.QUOTA_BYTES_PER_ITEM
    ).toFixed(2)}%)`;
  });
}

document.body.addEventListener("click", async (e) => {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");

  if (action === "fetch") {
    const config = await getParsedConfig();
    browser.runtime.sendMessage({ fetchAll: config } satisfies ExtensionMessage);
  }

  if (action === "save") {
    if (!validate()) return;

    const compressed = await compressString(textarea.value);
    browser.storage.sync.set({ config: compressed });
  }

  if (action === "validate") {
    validate();
  }

  if (action === "clear") {
    browser.storage.local.clear();
  }

  if (action === "example") {
    textarea.value = example;
    location.reload();
  }

  if (action === "reset-background") {
    await teardownOffscreenDocument();
  }

  if (action === "reset-extension") {
    browser.runtime.reload();
  }
});

form.addEventListener("submit", (e) => e.preventDefault());

function validate() {
  try {
    parse(textarea.value);
    textarea.setCustomValidity("");
    return textarea.reportValidity();
  } catch (e) {
    textarea.setCustomValidity(getErrorMessage(e));
    return textarea.reportValidity();
  }
}

function getErrorMessage(e: unknown) {
  const message = [(e as Error).name, (e as Error).message].join(" ");
  return message ? message : "Unknown error";
}
