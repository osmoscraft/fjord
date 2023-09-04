import { parse } from "yaml";

export function setRawConfig(config: string) {
  localStorage.setItem("config", config);
}

export function getRawConfig() {
  return localStorage.getItem("config");
}

export function parseConfig<T>(raw: string) {
  return parse(raw) as T;
}
