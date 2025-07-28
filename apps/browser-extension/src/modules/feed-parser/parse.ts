import type { FeedChannel, FeedItem } from "./types";

const domParser = new DOMParser();

export function parseXmlFeed(xml: string): FeedChannel {
  const trimmedInput = xml.trim();
  const dom = domParser.parseFromString(trimmedInput, "application/xml");
  const parser = [rssParser, atomParser].find((parser) => parser.isMatch(dom));
  if (!parser) {
    throw new Error("No parser found");
  }

  const { selectChannel, resolveChannel, selectItems, resolveItem } = parser;

  const channelElement = selectChannel(dom);
  const channel = resolveChannel(channelElement);

  return {
    ...channel,
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

    const rawUrl = itemChildren.find((node) => node.tagName === "link")?.textContent?.trim();

    // Get the base URL from the parent channel element
    const channelElement = item.closest("channel");
    const channelChildren = channelElement ? [...channelElement.children] : [];
    const baseUrl = channelChildren.find((node) => node.tagName === "link")?.textContent;

    // Convert relative URLs to absolute URLs using the utility function
    const resolvedUrl = rawUrl && baseUrl ? resolveToAbsoluteUrl(rawUrl, baseUrl) : rawUrl;

    return {
      url: resolvedUrl ?? undefined,
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

    const rawUrl = itemChildren
      .find((node) => node.tagName === "link")
      ?.getAttribute("href")
      ?.trim();

    // Get the base URL from the parent feed element
    const feedElement = item.closest("feed");
    const feedChildren = feedElement ? [...feedElement.children] : [];
    const baseUrl = feedChildren
      .find((node) => node.tagName === "link" && node.getAttribute("rel") !== "self")
      ?.getAttribute("href");

    // Convert relative URLs to absolute URLs using the utility function
    const resolvedUrl = rawUrl && baseUrl ? resolveToAbsoluteUrl(rawUrl, baseUrl) : rawUrl;

    return {
      url: resolvedUrl ?? undefined,
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

function resolveToAbsoluteUrl(maybeRelative: string, rootUrl: string): string {
  // If URL is already absolute or empty, return as-is
  if (!maybeRelative || !maybeRelative.startsWith("/")) {
    return maybeRelative;
  }

  try {
    const baseUrlObj = new URL(rootUrl);
    return new URL(maybeRelative, baseUrlObj.origin).toString();
  } catch {
    // If URL construction fails, fallback to the original URL
    return maybeRelative;
  }
}
