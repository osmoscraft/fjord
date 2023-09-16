import type { FeedChannel } from "../feed-parser/types";
import "./feeds-menu-element.css";

export class FeedsMenuElement extends HTMLElement {
  renderFeeds(feeds: FeedChannel[]) {
    this.innerHTML = `<nav class="c-feeds-menu">${groupByDate(feeds)
      .map((feedByDate) => {
        return `
        <div class="c-date-view">
          <div class="c-date-title">${new Date(feedByDate.startDate).toLocaleDateString()}</div>
          <div class="c-date-content">
          ${feedByDate.channels
            .map((channel) => {
              const url = new URL(location.href);
              url.searchParams.set("feedUrl", channel.url);
              return `
              <div class="c-channel">
                <div class="c-channel-title" data-url=${url.toString()}>${channel.title}</div>
                <div class="c-channel-items">
                  ${channel.items.map((item) => `<article class="c-channel-item">${item.title}</article>`).join("")}
                </div>
              </div>
              `;
            })
            .join("")}
          </div>
        </div>`;
      })
      .join("")}</nav>`;
  }
}

interface FeedsByDate {
  startDate: number;
  channels: {
    title: string;
    url: string;
    items: {
      title: string;
      url: string;
    }[];
  }[];
}

interface FlatItem {
  date: number;
  channelUrl: string;
  channelTitle: string;
  title: string;
  url: string;
}

function groupByDate(channels: FeedChannel[]): FeedsByDate[] {
  const flatItems: FlatItem[] = channels
    .flatMap((channel) =>
      // HACK: prevent perf issue with count freshness limit
      channel.items
        .filter((item) => item.timePublished > new Date(Date.now() - 365 * 24 * 3600 * 1000).getTime())
        .slice(0, 10)
        .map((item) => ({
          date: getStartOfDayDate(item.timePublished),
          channelUrl: channel.url,
          channelTitle: channel.title,
          title: item.title,
          url: item.url,
        }))
    )
    .sort((a, b) => b.date - a.date);

  const feedsByDate = flatItems.reduce((acc, item) => {
    const existingDate = acc.find((group) => group.startDate === item.date);
    if (existingDate) {
      const existingFeed = existingDate.channels.find((channel) => channel.url === item.channelUrl);

      if (existingFeed) {
        existingFeed.items.push(item);
      } else {
        existingDate.channels.push({
          title: item.channelTitle,
          url: item.channelUrl,
          items: [item],
        });
      }
    } else {
      acc.push({
        startDate: item.date,
        channels: [{ title: item.channelTitle, url: item.channelUrl, items: [item] }],
      });
    }
    return acc;
  }, [] as FeedsByDate[]);

  return feedsByDate;
}

function getStartOfDayDate(date: number) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
