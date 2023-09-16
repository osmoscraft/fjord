export type Feed = {
  title: string;
  entries: Entry[];
};

export type Entry = {
  link: string;
  title: string;
  timePublished: number;
};
