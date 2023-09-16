export type FeedChannel = {
  url: string;
  title: string;
  items: FeedItem[];
  icon?: string;
};

export type FeedItem = {
  url: string;
  title: string;
  timePublished: number;
};
