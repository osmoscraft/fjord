import type { Feed } from "../modules/feed-parser/types";

export interface MessageToBackground {
  requestFetchAllFeeds?: boolean;
}

export interface MessageToExtensionWorker {
  willFetchAllFeeds?: boolean;
  didFetchFeed?: Feed;
  didFetchAllFeeds?: Feed[];
}
