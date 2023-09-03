export const backgroundPageParameters: chrome.offscreen.CreateParameters = {
  url: chrome.runtime.getURL("background.html"),
  reasons: [chrome.offscreen.Reason.DOM_PARSER],
  justification: "Parse RSS feed in the background",
};
