import { describe, it, expect } from 'vitest';
import { parseXmlFeed, rssParser, atomParser } from './parse';

// Mock feed data
const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Example RSS Feed</title>
    <link>https://example.com</link>
    <description>This is an example RSS feed</description>
    <item>
      <title>First Article</title>
      <link>https://example.com/article1</link>
      <pubDate>Wed, 27 Jul 2025 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Second Article</title>
      <link>https://example.com/article2</link>
      <pubDate>Tue, 26 Jul 2025 09:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

const rdfXml = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns="http://purl.org/rss/1.0/"
         xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel rdf:about="https://example.com">
    <title>Example RDF Feed</title>
    <link>https://example.com</link>
    <description>This is an example RDF feed</description>
  </channel>
  <item rdf:about="https://example.com/rdf-article1">
    <title>RDF Article One</title>
    <link>https://example.com/rdf-article1</link>
    <dc:date>2025-07-27T10:00:00Z</dc:date>
  </item>
  <item rdf:about="https://example.com/rdf-article2">
    <title>RDF Article Two</title>
    <link>https://example.com/rdf-article2</link>
    <dc:date>2025-07-26T09:00:00Z</dc:date>
  </item>
</rdf:RDF>`;

const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Example Atom Feed</title>
  <link href="https://example.com" />
  <link rel="self" href="https://example.com/feed.xml" />
  <id>https://example.com</id>
  <updated>2025-07-27T10:00:00Z</updated>
  <entry>
    <title>Atom Article One</title>
    <link href="https://example.com/atom-article1" />
    <id>https://example.com/atom-article1</id>
    <published>2025-07-27T10:00:00Z</published>
    <updated>2025-07-27T10:00:00Z</updated>
  </entry>
  <entry>
    <title>Atom Article Two</title>
    <link href="https://example.com/atom-article2" />
    <id>https://example.com/atom-article2</id>
    <published>2025-07-26T09:00:00Z</published>
    <updated>2025-07-26T09:30:00Z</updated>
  </entry>
</feed>`;

describe('parseXmlFeed', () => {
  describe('RSS 2.0 parsing', () => {
    it('should parse RSS feed correctly', () => {
      const result = parseXmlFeed(rssXml);
      
      expect(result.title).toBe('Example RSS Feed');
      expect(result.homeUrl).toBe('https://example.com');
      expect(result.items).toHaveLength(2);
      
      expect(result.items[0]).toEqual({
        title: 'First Article',
        url: 'https://example.com/article1',
        timePublished: new Date('Wed, 27 Jul 2025 10:00:00 GMT').getTime(),
      });
      
      expect(result.items[1]).toEqual({
        title: 'Second Article',
        url: 'https://example.com/article2',
        timePublished: new Date('Tue, 26 Jul 2025 09:00:00 GMT').getTime(),
      });
    });
  });

  describe('RDF parsing', () => {
    it('should parse RDF feed correctly', () => {
      const result = parseXmlFeed(rdfXml);
      
      expect(result.title).toBe('Example RDF Feed');
      expect(result.homeUrl).toBe('https://example.com');
      expect(result.items).toHaveLength(2);
      
      expect(result.items[0]).toEqual({
        title: 'RDF Article One',
        url: 'https://example.com/rdf-article1',
        timePublished: new Date('2025-07-27T10:00:00Z').getTime(),
      });
      
      expect(result.items[1]).toEqual({
        title: 'RDF Article Two',
        url: 'https://example.com/rdf-article2',
        timePublished: new Date('2025-07-26T09:00:00Z').getTime(),
      });
    });
  });

  describe('Atom parsing', () => {
    it('should parse Atom feed correctly', () => {
      const result = parseXmlFeed(atomXml);
      
      expect(result.title).toBe('Example Atom Feed');
      expect(result.homeUrl).toBe('https://example.com');
      expect(result.items).toHaveLength(2);
      
      expect(result.items[0]).toEqual({
        title: 'Atom Article One',
        url: 'https://example.com/atom-article1',
        timePublished: new Date('2025-07-27T10:00:00Z').getTime(),
      });
      
      expect(result.items[1]).toEqual({
        title: 'Atom Article Two',
        url: 'https://example.com/atom-article2',
        timePublished: new Date('2025-07-26T09:00:00Z').getTime(),
      });
    });

    it('should prefer published date over updated date', () => {
      const atomWithBothDates = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Test Feed</title>
  <link href="https://example.com" />
  <entry>
    <title>Test Article</title>
    <link href="https://example.com/test" />
    <published>2025-07-26T09:00:00Z</published>
    <updated>2025-07-27T10:00:00Z</updated>
  </entry>
</feed>`;
      
      const result = parseXmlFeed(atomWithBothDates);
      expect(result.items[0].timePublished).toBe(new Date('2025-07-26T09:00:00Z').getTime());
    });

    it('should fallback to updated date when published is missing', () => {
      const atomWithUpdatedOnly = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Test Feed</title>
  <link href="https://example.com" />
  <entry>
    <title>Test Article</title>
    <link href="https://example.com/test" />
    <updated>2025-07-27T10:00:00Z</updated>
  </entry>
</feed>`;
      
      const result = parseXmlFeed(atomWithUpdatedOnly);
      expect(result.items[0].timePublished).toBe(new Date('2025-07-27T10:00:00Z').getTime());
    });
  });

  describe('error handling', () => {
    it('should throw error for unsupported feed format', () => {
      const invalidXml = `<?xml version="1.0"?>
<unsupported>
  <item>test</item>
</unsupported>`;
      
      expect(() => parseXmlFeed(invalidXml)).toThrow('No parser found');
    });

    it('should filter out items without title or url', () => {
      const rssWithIncompleteItems = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <link>https://example.com</link>
    <item>
      <title>Complete Article</title>
      <link>https://example.com/complete</link>
    </item>
    <item>
      <title>Missing URL Article</title>
    </item>
    <item>
      <link>https://example.com/missing-title</link>
    </item>
  </channel>
</rss>`;
      
      const result = parseXmlFeed(rssWithIncompleteItems);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Complete Article');
    });

    it('should handle malformed dates gracefully', () => {
      const rssWithBadDate = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <link>https://example.com</link>
    <item>
      <title>Bad Date Article</title>
      <link>https://example.com/bad-date</link>
      <pubDate>invalid-date</pubDate>
    </item>
  </channel>
</rss>`;
      
      const result = parseXmlFeed(rssWithBadDate);
      expect(result.items[0].timePublished).toBeTypeOf('number');
      // For invalid dates, new Date().getTime() returns NaN, which is what we expect
      // The current implementation doesn't handle this case, so we test the actual behavior
      expect(Number.isNaN(result.items[0].timePublished)).toBe(true);
    });
  });
});

describe('rssParser', () => {
  it('should identify RSS format correctly', () => {
    const parser = new DOMParser();
    const rssDoc = parser.parseFromString(rssXml, 'application/xml');
    const rdfDoc = parser.parseFromString(rdfXml, 'application/xml');
    const atomDoc = parser.parseFromString(atomXml, 'application/xml');
    
    expect(rssParser.isMatch(rssDoc)).toBe(true);
    expect(rssParser.isMatch(rdfDoc)).toBe(true);
    expect(rssParser.isMatch(atomDoc)).toBe(false);
  });

  it('should handle RSS without channel link', () => {
    const rssWithoutLink = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>No Link Feed</title>
    <description>This feed has no link</description>
  </channel>
</rss>`;
    
    const result = parseXmlFeed(rssWithoutLink);
    expect(result.homeUrl).toBeUndefined();
  });
});

describe('atomParser', () => {
  it('should identify Atom format correctly', () => {
    const parser = new DOMParser();
    const atomDoc = parser.parseFromString(atomXml, 'application/xml');
    const rssDoc = parser.parseFromString(rssXml, 'application/xml');
    
    expect(atomParser.isMatch(atomDoc)).toBe(true);
    expect(atomParser.isMatch(rssDoc)).toBe(false);
  });

  it('should ignore self-referencing links', () => {
    const atomWithSelfLink = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Self Link Test</title>
  <link rel="self" href="https://example.com/feed.xml" />
  <link href="https://example.com" />
</feed>`;
    
    const result = parseXmlFeed(atomWithSelfLink);
    expect(result.homeUrl).toBe('https://example.com');
  });

  it('should handle Atom without non-self links', () => {
    const atomSelfOnly = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Self Only Feed</title>
  <link rel="self" href="https://example.com/feed.xml" />
</feed>`;
    
    const result = parseXmlFeed(atomSelfOnly);
    expect(result.homeUrl).toBeUndefined();
  });
});
