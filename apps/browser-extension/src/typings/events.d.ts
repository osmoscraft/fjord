import type { FeedChannel } from "../modules/feed-parser/types";

export interface ExtensionMessage {
  requestsChannelsData?: boolean;
  requestChannelsUpdate?: boolean;
  requestUnreadUrls?: boolean;
  channelsData?: FeedChannel[];
  channelsUpdated?: FeedChannel[];
  channelUnreadItems?: { title: string; url: string }[];
  unreadUrls?: string[];
}
