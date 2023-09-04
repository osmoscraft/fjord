import { getRawConfig, parseConfig, setRawConfig } from "../modules/config";
import "./options.css";

const form = document.querySelector("form")!;
const textarea = document.querySelector("textarea")!;

textarea.value = getRawConfig();

document.body.addEventListener("click", async (e) => {
  const action = (e.target as HTMLElement)?.closest("[data-action]")?.getAttribute("data-action");
  if (action === "validate") {
    try {
      parseConfig(getRawConfig());
      textarea.setCustomValidity("");
      textarea.reportValidity();
    } catch (e) {
      textarea.setCustomValidity(getErrorMessage(e));
      textarea.reportValidity();
    }
  }
});

form.addEventListener("submit", (e) => e.preventDefault());
textarea.addEventListener("input", () => setRawConfig(textarea.value));

function getErrorMessage(e: unknown) {
  const message = [(e as Error).name, (e as Error).message].join(" ");
  return message ? message : "Unknown error";
}
