import browser from "webextension-polyfill";
import { parse } from "yaml";
import { decompressString } from "../compression";
import type { Config } from "./type";

export async function getRawConfig() {
  const configString = await browser.storage.sync.get(["config"]).then((result) => result.config as string);
  if (!configString) throw new Error("missing config");
  const yamlString = await decompressString(configString);
  return yamlString;
}

export async function getParsedConfig(): Promise<Config> {
  const yamlString = await getRawConfig();
  return parse(yamlString);
}

export function parseConfig(yamlString: string): Config {
  return parse(yamlString);
}
