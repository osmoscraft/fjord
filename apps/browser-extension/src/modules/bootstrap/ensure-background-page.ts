import { setupOffscreenDocument } from "../extension-utils/offscreen";

export async function ensureBackgroundPage() {
  return setupOffscreenDocument({
    url: chrome.runtime.getURL("background.html"),
    reasons: [chrome.offscreen.Reason.DOM_PARSER],
    justification: "Parse RSS feed in the background",
  });
}
