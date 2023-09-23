import type { FeedChannel } from "../feed-parser/types";

export function renderChannels(channels: ChannelData[]): string {
  return /*html*/ `<nav class="c-feeds-menu">${groupByDate(channels)
    .map((feedByDate) => {
      return `
        <fieldset class="c-date-view">
          <legend class="c-date-title"><time datetime="${new Date(feedByDate.startDate).toISOString()}">${new Date(
        feedByDate.startDate
      ).toLocaleDateString()}</time></legend>
          <div class="c-date-content">
          ${feedByDate.channels
            .map((channel) => {
              const url = new URL(location.href);
              url.searchParams.set("feedUrl", channel.url);
              return channel.items
                .map(
                  (item) => `<article class="c-item">
                    <a href="${channel.homeUrl}" title="${
                    channel.title
                  }"><img class="c-item-icon" alt="" loading="lazy" src="${getGoogleFaviconUrl(
                    item.url
                  )}"></a><a href="${item.url}" class="c-item-title">${item.title}</a></article>`
                )
                .join("");
            })
            .join("")}
          </div>
        </fieldset>`;
    })
    .join("")}</nav>`;
}

interface FeedsByDate {
  startDate: number;
  channels: {
    title: string;
    url: string;
    homeUrl: string;
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
    homeUrl: string;
  };
  icon: string;
  title: string;
  url: string;
}

export interface ChannelData extends FeedChannel {
  url: string;
}

function groupByDate(channels: ChannelData[]): FeedsByDate[] {
  const flatItems: FlatItem[] = channels
    .flatMap((channel) =>
      channel.items.map((item) => ({
        date: getStartOfDayDate(item.timePublished),
        channel: {
          url: channel.url,
          title: channel.title,
          homeUrl: channel.homeUrl ?? item.url,
        },
        icon: getGoogleFaviconUrl(item.url),
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
          homeUrl: item.channel.homeUrl,
          items: [item],
        });
      }
    } else {
      acc.push({
        startDate: item.date,
        channels: [{ title: item.channel.title, url: item.channel.url, homeUrl: item.channel.homeUrl, items: [item] }],
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

function getGoogleFaviconUrl(pageUrl: string) {
  return `https://www.google.com/s2/favicons?domain=${new URL(pageUrl).host}&sz=32`;
}
