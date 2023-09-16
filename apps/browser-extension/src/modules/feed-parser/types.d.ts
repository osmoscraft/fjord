export type FeedChannel = {
  url: string;
  title: string;
  items: FeedItem[];
};

export type FeedItem = {
  url: string;
  title: string;
  timePublished: number;
};
