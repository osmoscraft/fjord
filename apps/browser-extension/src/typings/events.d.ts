import type { FeedChannel } from "../modules/feed-parser/types";

export interface ExtensionMessage {
  requestsChannelsData?: boolean;
  requestChannelsUpdate?: boolean;
  channelsData?: FeedChannel[];
  channelsUpdated?: FeedChannel[];
}
