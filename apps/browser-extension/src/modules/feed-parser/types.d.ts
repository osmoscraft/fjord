export type FeedChannel = {
  homeUrl?: string;
  title: string;
  items: FeedItem[];
};

export type FeedItem = {
  url: string;
  title: string;
  timePublished: number;
};
