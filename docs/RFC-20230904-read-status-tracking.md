# Read Status Tracking

- Naive strategy: rely on title string prefix to determine read/unread status
  - Simple to implement
  - Difficult to customize the mark character
  - Error prone with unread number format parsing
- Sophisticated strategy: rely on hidden state associates all three (URL, Bookmark item, Status)
  - Works with customization of status display
  - Additional complexity from browser native bookmark sync

## Naive strategy

- Implement decoratedNameToCanonicalName: string => string
- Implement canonicalNameToDecoratedName: (string, boolean) => string
- On sync (on start, on interval, manual, browser native sync)
  - If a channel's canonical name does not exist in bookmarks bar
    - Create folder
    - Mark all items as read
    - Truncate to limit
  - If a channel's canonical name exists
    - Determine which items are "new" comparing URL with existing items (from all channels)
    - Mark new items as read
    - Truncate to limit

## Hybrid strategy

- Use local storage to track channel URL <-> bookmark folder id
- Use article URL to track item identity
- After downloading the content of a channel
  - If a folder with matching name exists
    - ?
  - If the channel's URL does not exist
    - Create the folder and add (folder id, url) to local storage
    - Mark new items as seen
    - Truncate to `maxItemsPerChannel`
  - If the channel's URL exists
    - Mark items with new urls as unseen
    - Prepend to the folder
    - Truncate to `maxItemsPerChannel`
- After browser syncs bookmark (with onchange event?)
  - If the folder id does not exist
    - No op
  - If the folder id exists
    - Based on the mark, infer unseen and seen URLs and update local storage
    - Truncate to `maxItemsPerChannel`
