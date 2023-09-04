import browser from "webextension-polyfill";
import { getRawConfig, parseConfig, setRawConfig } from "../modules/config";
import example from "../modules/example.yaml";
import { setupOffscreenDocument } from "../modules/offscreen";
import { backgroundPageParameters } from "../modules/parameters";
import type { MessageToBackground } from "../typings/events";
import "./options.css";

const form = document.querySelector("form")!;
const textarea = document.querySelector("textarea")!;

textarea.value = getInitalConfig();
validate();

document.body.addEventListener("click", async (e) => {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");

  if (action === "fetch") {
    await setupOffscreenDocument(backgroundPageParameters);
    browser.runtime.sendMessage({ requestFetchAllFeeds: true } satisfies MessageToBackground);
  }

  if (action === "validate") {
    validate();
  }

  if (action === "example") {
    setRawConfig(example);
    location.reload();
  }
});

form.addEventListener("submit", (e) => e.preventDefault());
textarea.addEventListener("input", () => setRawConfig(textarea.value));

function getInitalConfig() {
  const existing = getRawConfig();
  return existing !== null ? existing : example;
}

function validate() {
  try {
    parseConfig(getRawConfig() ?? "");
    textarea.setCustomValidity("");
    textarea.reportValidity();
  } catch (e) {
    textarea.setCustomValidity(getErrorMessage(e));
    textarea.reportValidity();
  }
}

function getErrorMessage(e: unknown) {
  const message = [(e as Error).name, (e as Error).message].join(" ");
  return message ? message : "Unknown error";
}
