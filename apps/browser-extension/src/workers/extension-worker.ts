import browser from "webextension-polyfill";
import { ensureBackgroundPage } from "../modules/bootstrap/ensure-background-page";

const preference = { runOnStartUp: false };
if (preference.runOnStartUp) {
  browser.runtime.onInstalled.addListener(ensureBackgroundPage);
  browser.runtime.onStartup.addListener(ensureBackgroundPage);
}

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");

  if (message.action === "start-vm-background") {
    console.log("will start VM from background script");
    await browser.tabs.create({
      url: "https://bing.com",
    });
    console.log("navigated to new page");

    await waitUntil(async () => {
      const currentTab = await getCurrentTab();
      const injectionResult = await browser.scripting.executeScript({
        target: { tabId: currentTab.id! }, // safe?
        func: () => {
          const button = document.querySelector(`[title="Start"][role="button"][aria-disabled="false"]`);
          return !!button;
        },
      });

      const isFound = !!injectionResult.at(0)?.result;
      console.log("isButtonFound?", isFound);

      return isFound;
    });

    const currentTab = await getCurrentTab();
    await browser.scripting.executeScript({
      target: { tabId: currentTab.id! }, // safe?
      func: () => {
        const button = document.querySelector(`[title="Start"][role="button"][aria-disabled="false"]`);
        (button as HTMLElement).click();
      },
    });
  }
});

// ref: https://developer.chrome.com/docs/extensions/reference/tabs/#get-the-current-tab
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await browser.tabs.query(queryOptions);
  return tab;
}

async function waitUntil(check: () => boolean | Promise<boolean>) {
  // check condition every second until timeout or it becomes true
  return new Promise<void>((resolve, reject) => {
    const poll = setInterval(async () => {
      if (await check()) {
        clearInterval(poll);
        resolve();
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(poll);
      reject(new Error("timeout"));
    }, 10000);
  });
}
