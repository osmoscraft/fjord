# User Config

- Meta config: local or remote
- Add/remove subscriptions
- Sync trigger
  - On start
    - Disable on metered network
  - On interval
- Feed titles
  - Default to server provided string
  - Reduce menu width
- Retention policy
  - By item limit
- Read status tracking
  - Root level: number | mark (default) | none
  - Channel level: number | mark (default) | none
  - Item level: mark (default) | none
  - Unread mark: ◉ | • | custom string

## Config format

Minimum example

```yaml
channels:
  - url: https://example.com/feed.xml
  - url: https://example2.com/feed.xml
  - url: https://example3.com/feed.xml
```

Maximum example

```yaml
syncOnStart: false
syncIntervalSeconds: 180
maxItemsPerChannel: 30
statusIndicator:
  root: unreadCount
  channel: none
  item: unreadIndicator
  unreadIndicate: ◉
channels:
  - url: https://example.com/feed.xml
    title: Custom feed title
    maxItems: 20
  - url: https://example2.com/feed.xml
    syncOnStart: true
    syncInterval: 60
  - url: https://example3.com/feed.xml
```
