import browser from "webextension-polyfill";
import { compressString } from "../modules/compression";
import exampleYaml from "../modules/config/example.yaml";
import placeholderYaml from "../modules/config/placeholder.yaml";
// import { getRawConfig, parseConfig, setRawConfig } from "../modules/config/config";
import { getRawConfig, parseConfig } from "../modules/config/config";
import { teardownOffscreenDocument } from "../modules/offscreen";
import "./options.css";

const form = document.querySelector("form")!;
const myConfig = document.querySelector<HTMLTextAreaElement>("#my-config")!;
const localUsage = document.querySelector<HTMLMeterElement>("#local-usage")!;
const syncUsage = document.querySelector<HTMLMeterElement>("#sync-usage")!;
const localStats = document.querySelector<HTMLSpanElement>("#local-stats")!;
const syncStats = document.querySelector<HTMLSpanElement>("#sync-stats")!;
const examplesPanel = document.querySelector<HTMLDivElement>("#examples-container")!;
const exampleConfig = document.querySelector<HTMLTextAreaElement>("#example-config")!;

getRawConfig()
  .then((value) => {
    myConfig.value = value;
  })
  .catch((e) => {
    console.log(`Error loading config`, e);
    examplesPanel.hidden = false;
  });
exampleConfig.value = exampleYaml;
myConfig.placeholder = placeholderYaml;

reportStorageUsage();
getValidConfig();

browser.storage.onChanged.addListener(reportStorageUsage);
browser.storage.sync.onChanged.addListener(handleSyncStorageChange);

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

function handleSyncStorageChange(e: browser.Storage.StorageAreaSyncOnChangedChangesType) {
  getRawConfig()
    .then((rawConfig) => {
      if (rawConfig) {
        myConfig.value = rawConfig;
      }
    })
    .catch((e) => {
      console.error(`Error loading config. UI value is stale`, e);
    });
}

document.body.addEventListener("click", async (e) => {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");

  if (action === "save-and-read") {
    const validConfig = getValidConfig();
    if (!validConfig) return;

    const compressed = await compressString(myConfig.value);
    browser.storage.sync.set({ config: compressed });

    location.assign(browser.runtime.getURL("reader.html"));
  }

  if (action === "save") {
    const validConfig = getValidConfig();
    if (!validConfig) return;

    const compressed = await compressString(myConfig.value);
    browser.storage.sync.set({ config: compressed });
  }

  if (action === "clear") {
    browser.storage.local.clear();
  }

  if (action === "reset-background") {
    await teardownOffscreenDocument();
  }

  if (action === "reset-extension") {
    browser.runtime.reload();
  }

  if (action === "toggle-examples") {
    examplesPanel.hidden = !examplesPanel.hidden;
  }
});

form.addEventListener("submit", (e) => e.preventDefault());

function getValidConfig() {
  try {
    const parsed = parseConfig(myConfig.value);
    myConfig.setCustomValidity("");
    if (!myConfig.reportValidity()) {
      return null;
    }

    return parsed;
  } catch (e) {
    myConfig.setCustomValidity(getErrorMessage(e));
    myConfig.reportValidity();
    return null;
  }
}

function getErrorMessage(e: unknown) {
  const message = [(e as Error).name, (e as Error).message].join(" ");
  return message ? message : "Unknown error";
}
