import type { ChannelData } from "../modules/reader/render-feed";

export type ExtensionMessage = {
  fetchAll?: boolean;
  channelData?: ChannelData;
};
