import browser from "webextension-polyfill";

console.log(browser);

browser.action.onClicked.addListener(async () => {
  const currentTab = await getCurrentTab();

  const notebookMutableUrl = new URL(browser.runtime.getURL("options.html"));
  if (currentTab?.title) {
    notebookMutableUrl.searchParams.set("title", currentTab.title);
  }
  if (currentTab?.url) {
    notebookMutableUrl.searchParams.set("url", currentTab.url);
  }

  browser.tabs.create({ url: notebookMutableUrl.toString() });
});

// ref: https://developer.chrome.com/docs/extensions/reference/tabs/#get-the-current-tab
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await browser.tabs.query(queryOptions);
  return tab;
}
