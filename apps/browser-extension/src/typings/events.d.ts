import type { FeedChannel } from "../modules/feed-parser/types";

export interface ExtensionMessage {
  requestsChannelsData?: boolean;
  requestChannelsUpdate?: {
    channelFolderUrls: string[];
  };
  requestUnreadUrls?: boolean;
  channelsData?: FeedChannel[];
  channelsUpdated?: FeedChannel[];
  channelUnreadItems?: {
    channelUrl: string;
    items: { title: string; url: string }[];
  };
  unreadUrls?: string[];
}
