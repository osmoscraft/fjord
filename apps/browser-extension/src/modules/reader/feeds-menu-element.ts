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
              return channel.items
                .map(
                  (item) => `<article class="c-item">
                    <a href="${channel.url}" title="${channel.title}"><img class="c-item-icon" alt="" src="${
                    channel.icon ?? getGoogleFaviconUrl(item.url)
                  }"></a> <a href="${item.url}" class="c-item-title">${item.title}</a></article>`
                )
                .join("");
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
    icon?: string;
    url: string;
    items: {
      title: string;
      url: string;
    }[];
  }[];
}

interface FlatItem {
  date: number;
  channel: {
    url: string;
    title: string;
    icon?: string;
  };
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
          channel: {
            url: channel.url,
            title: channel.title,
            icon: channel.icon,
          },
          title: item.title,
          url: item.url,
        }))
    )
    .sort((a, b) => b.date - a.date);

  const feedsByDate = flatItems.reduce((acc, item) => {
    const existingDate = acc.find((group) => group.startDate === item.date);
    if (existingDate) {
      const existingFeed = existingDate.channels.find((channel) => channel.url === item.channel.url);

      if (existingFeed) {
        existingFeed.items.push(item);
      } else {
        existingDate.channels.push({
          title: item.channel.title,
          url: item.channel.url,
          icon: item.channel.icon,
          items: [item],
        });
      }
    } else {
      acc.push({
        startDate: item.date,
        channels: [{ title: item.channel.title, url: item.channel.url, items: [item] }],
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

function getFaviconUrl(pageUrl: string) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", pageUrl);
  url.searchParams.set("size", "32");
  return url.toString();
}

function getGoogleFaviconUrl(pageUrl: string) {
  return `https://www.google.com/s2/favicons?domain=${new URL(pageUrl).host}&sz=32`;
}
