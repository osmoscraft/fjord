let creating: null | Promise<void> = null;

export async function setupOffscreenDocument(createParameters: chrome.offscreen.CreateParameters) {
  const offscreenUrl = createParameters.url;
  // TODO pending typescript support
  const existingContexts = await (chrome.runtime as any).getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({ ...createParameters });
    await creating;
    creating = null;
  }
}

export async function teardownOffscreenDocument() {
  if (creating) await creating;

  if (await chrome.offscreen.hasDocument()) {
    return chrome.offscreen.closeDocument();
  }
}
