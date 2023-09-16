import type { FeedChannel } from "../modules/feed-parser/types";

export interface ExtensionMessage {
  requestFetchAllFeeds?: boolean;
  didFetchFeed?: FeedChannel;
  didFetchAllFeeds?: FeedChannel[];
}
