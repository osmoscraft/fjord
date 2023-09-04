import type { Config } from "../modules/config/type";
import type { Feed } from "../modules/feed-parser/types";

export interface MessageToBackground {
  requestFetchAllFeeds?: boolean;
}

export interface MessageToExtensionWorker {
  willFetchAllFeeds?: Config;
  didFetchFeed?: Feed;
  didFetchAllFeeds?: Feed[];
}
