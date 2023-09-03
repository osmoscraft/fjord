import browser from "webextension-polyfill";
import { ensureBackgroundPage } from "../modules/bootstrap/ensure-background-page";
import "./popup.css";

(async () => {
  document.body.addEventListener("click", async (e) => {
    const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");
    if (action === "sync") {
      await ensureBackgroundPage();
      browser.runtime.sendMessage({ syncAll: true });
    }

    if (action === "start-vm") {
      console.log("will start vm");
      await browser.tabs.update({
        url: "https://bing.com",
      });
      console.log("navigated to new page");

      await waitUntil(async () => {
        const injectionResult = await browser.scripting.executeScript({
          target: { tabId: await getActiveTabId() },
          func: () => {
            const button = document.querySelector(`[title="Start"][role="button"][aria-disabled="false"]`);
            return !!button;
          },
        });

        const isFound = !!injectionResult.at(0)?.result;
        console.log("isButtonFound?", isFound);

        return isFound;
      });

      await browser.scripting.executeScript({
        target: { tabId: await getActiveTabId() },
        func: () => {
          const button = document.querySelector(`[title="Start"][role="button"][aria-disabled="false"]`);
          (button as HTMLElement).click();
        },
      });

      console.log("button clicked");
    }

    if (action === "start-vm-background") {
      browser.runtime.sendMessage({ action: "start-vm-background" });
    }
  });
})();

async function getActiveTabId() {
  return browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs.length === 0) {
      throw new Error("no active tab");
    }
    return tabs[0].id as number; // safe?
  });
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