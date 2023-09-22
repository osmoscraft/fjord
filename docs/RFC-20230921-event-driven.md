# Event driven

Motivation: Browser bookmark sync is flaky and conflict-prone

## Event processing

- Write the change
- Derive the state that retains the minimum chronological information to allow history revision

## Example events

- Change events
  - Add source: time + url
  - Remove source: time + url
  - Fetch source: time + title + home page url
  - Fetch item: time + title + url
    - State will truncate based on time and timestamp
  - Mark as unread: time + url
    - By default, newly fetched items are marked as unread
  - Mark as read: time + url

## Example state derivation rules

- Add source urlX @t1: `[t1] source added: urlX`
- Add source urlX @t1 + Remove source urlX @t2, where t1 <= t2: `[t2] tombstone: urlX`
- Fetch item urlX @t1: `[t1] item added urlX`
- Fetch item urlX @t1 + mark as unread @t2: `[t2] item added [t2] unread urlX`
  - By default, when fetching existing source, we mark items as unread using the same timestamp as publish timestamp
  - This convention allows easy mark as read
- Fetch item urlX @t1 + mark as unread @t2 + mark as read @t3: `[t3] item added`