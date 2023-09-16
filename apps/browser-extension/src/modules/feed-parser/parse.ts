import type { FeedChannel, FeedItem } from "./types";

const domParser = new DOMParser();

export function parseXmlFeed(url: string, xml: string): FeedChannel {
  const trimmedInput = xml.trim();
  const dom = domParser.parseFromString(trimmedInput, "application/xml");
  const parser = [rssParser, atomParser].find((parser) => parser.isMatch(dom));
  if (!parser) {
    throw new Error("No parser found");
  }

  const { selectChannel, resolveChannel, selectItems, resolveItem } = parser;

  const channelElement = selectChannel(dom);

  return {
    url,
    ...resolveChannel(channelElement),
    items: [...selectItems(dom)].map(resolveItem).filter(isArticle),
  };
}

export const rssParser = {
  isMatch: (root: Document) => ["rss", "rdf:RDF"].includes(root.children?.[0]?.tagName),
  selectChannel: (root: Document) => root.getElementsByTagName("channel")[0],
  selectItems: (root: Document) => root.getElementsByTagName("item"),
  resolveChannel: (channelElement: Element) => {
    const channelChildren = [...channelElement.children];
    const homeUrl = channelChildren.find((node) => node.tagName === "link")?.textContent ?? undefined;

    return {
      title: parseChildByTagName(channelElement, "title")?.text() ?? "",
      homeUrl,
      items: [],
    };
  },
  resolveItem: (item: Element) => {
    const itemChildren = [...item.children];
    const decodedTitle = parseChildByTagName(item, "title")?.text();
    const date = itemChildren.find((node) => ["pubDate", "dc:date"].includes(node.tagName))?.textContent?.trim() ?? "";

    return {
      url: itemChildren.find((node) => node.tagName === "link")?.textContent?.trim() ?? undefined,
      title: decodedTitle,
      timePublished: coerceError(() => new Date(date ?? "").getTime(), Date.now()),
    };
  },
};

export const atomParser = {
  isMatch: (root: Document) => root.children?.[0]?.tagName === "feed",
  selectChannel: (root: Document) => root.getElementsByTagName("feed")[0],
  selectItems: (root: Document) => root.getElementsByTagName("entry"),
  resolveChannel: (channelElement: Element) => {
    const channelChildren = [...channelElement.children];
    const homeUrl =
      channelChildren
        .find((node) => node.tagName === "link" && node.getAttribute("rel") !== "self")
        ?.getAttribute("href") ?? undefined;

    return {
      title: channelChildren.find((node) => node.tagName === "title")?.textContent ?? "",
      homeUrl,
      items: [],
    };
  },
  resolveItem: (item: Element) => {
    const itemChildren = [...item.children];
    const decodedTitle = itemChildren.find((node) => node.tagName === "title")?.textContent;
    const publishedDate = itemChildren.find((node) => node.tagName === "published")?.textContent;
    const modifedDate = itemChildren.find((node) => node.tagName === "updated")?.textContent;

    return {
      url:
        itemChildren
          .find((node) => node.tagName === "link")
          ?.getAttribute("href")
          ?.trim() ?? undefined,
      title: decodedTitle ?? undefined,
      timePublished: coerceError(() => new Date(publishedDate ?? modifedDate ?? "").getTime(), Date.now()),
    };
  },
};

function isArticle(item: Partial<FeedItem>): item is FeedItem {
  return !!item.title && !!item.url;
}

function parseChildByTagName(node: Element, tagName: string): ParsedXmlNode | undefined {
  return safeCall(
    parseXmlNode,
    [...node.children].find((node) => node.tagName === tagName)
  );
}

function safeCall<T, K, P = undefined>(
  fn: (value: T) => K,
  maybeValue: T | null | undefined,
  fallbackValue?: P
): K | P {
  if (maybeValue === null || maybeValue === undefined) {
    return fallbackValue as P;
  } else {
    return fn(maybeValue);
  }
}

function parseXmlNode(node: Element): ParsedXmlNode {
  const text = () => xmlNodeToText(node);
  const html = () => xmlNodeToHtml(node);

  return {
    text,
    html,
  };
}

interface ParsedXmlNode {
  text: () => string;
  html: () => string;
}

function xmlNodeToHtml(node: Element) {
  if ([...node.childNodes].some((node) => node instanceof CDATASection)) {
    return node.textContent?.trim() ?? "";
  } else {
    return unescapeString(node.innerHTML.trim());
  }
}

function unescapeString(escapedString: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = escapedString;
  return textarea.value;
}

function xmlNodeToText(node: Element) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(node.textContent?.trim() ?? "", "text/html");
  return dom.body.textContent ?? "";
}

function coerceError<T, K>(fn: () => T, coerceTo: K) {
  try {
    return fn();
  } catch {
    return coerceTo;
  }
}
