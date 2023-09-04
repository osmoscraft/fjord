# Principles

- Native: Browser bookmark bar provides hierarchy, navigation, storage and sync
- Headless: Background script for feed fetching, scraping, and bookmark manipulation
- Interop: Bookmark can interop with other systems

# Ideas

- Background page can update feeds on browser start
- User can perform on-demand sync
- Merge with existing bookmarks, with limit on total count
- Per-article read receipt tracking with microcopy (e.g. "(\*)" prefix for unread articles)
- Per-folder unread count with (N) Folder name
- Customize folder name per feed
- Customize retention policy per feed
- Config sources in a single file (yaml, opml, json, xml)
- Source modes
  - Local first: Use one of the bookmarks as source of feeds
    - In each folder, a "source" item contains the url of the atom/rss feed
    - Export entire bookmark bar as OPML for manual sharing/syncing across profiles
  - Remote first: Use remote OPML/YAML url. User must manually edit remote to propagate changes
- Use external URL as source of feeds
- Add current page to feed
- UI can detect and add current site as RSS source
- UI can toggle page between "unread/read"
- An offline storage mode that fetches and caches article content (might be a premium feature due to cost of maintenance)
- UI can one-click to mark all items older than X days/hours as read
- Remove utm, referrer tracking string in the URL
- Use a bookmarklet to run javascript that marks each category as read/unread
