import type { Config } from "../modules/config/type";
import type { ChannelData } from "../modules/reader/render-feed";

export type ExtensionMessage = {
  fetchAll?: Config;
  fetchCacheNewerThan?: number;
  channels?: ChannelData[];
  getChannels?: boolean;
};
