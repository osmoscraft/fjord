import browser from "webextension-polyfill";
import { getRawConfig, parseConfig, setRawConfig } from "../modules/config/config";
import example from "../modules/config/example.yaml";
import { teardownOffscreenDocument } from "../modules/offscreen";
import "./options.css";

const form = document.querySelector("form")!;
const textarea = document.querySelector("textarea")!;

textarea.value = getInitalConfig();
validate();

document.body.addEventListener("click", async (e) => {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");

  if (action === "validate") {
    validate();
  }

  if (action === "example") {
    setRawConfig(example);
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
