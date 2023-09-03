# Event flow

## Sync flow

1. Manual entry:
   1. User clicks "sync"
   2. UI thread send `requestSync`
2. Auto entry:
   1. User opens browser or installs plugin
   2. Extension worker behaves as if `requestSync` is sent by the user
3. Extension worker ensures background page exists
4. Extension worker requests background page to start sync
5. Background page emit `willFetchAllFeeds` event
6. Extension worker handle `willFetchAllFeeds` event by ensuring rootFolder exists
7. Background page emits a series of `didFetchFeed` events
8. Extension worker merge the fetched feed with the items in the corresponding folder
9. Background page emits `didFetchAllFeeds` event
10. Extension worker removes feeds folders that are in active

## Read/unread tracking flow
