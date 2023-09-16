export type FeedChannel = {
  url: string;
  homeUrl?: string;
  title: string;
  items: FeedItem[];
};

export type FeedItem = {
  url: string;
  title: string;
  timePublished: number;
};
