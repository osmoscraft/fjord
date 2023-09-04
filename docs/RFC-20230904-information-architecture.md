# Information Architecture

Decision: Concept B is adopted for simplicity

## Concept A: Day > Channel > Item

- Pros:
  - Less clutter each day (7+-2) for each day and for each source in a day
  - Each to open all things on a single day
- Cons:
  - 3 clicks to see article titles

Level 1: Organize and sort by day of week (with locale)

- (21) Root
  - (17) Wednesday 9/20/2023
  - (4) Tuesday 9/19/2023
  - Monday 9/18/2023
  - ...

Level 2: Organize by source, sort by recency

- (21) Root
  - (17) Wednesday 9/20/2023
    - (4) Hacker News Frontpage
    - (6) CSS Tricks Blog
    - MDN blog
    - (4) Chrome Developer Blog
    - (3) DistroTube YouTube
  - (4) Tuesday 9/19/2023
  - Monday 9/18/2023
  - ...

Level 3: List items, sort by read status then by timestamp

- (21) Root
  - (17) Wednesday 9/20/2023
    - (4) Hacker News Frontpage
      - (⚹) New article title 1
      - (⚹) New article title 2
      - (⚹) New article title 3
      - (⚹) New article title 4
      - Seen article title 5
      - Seen Article title 6

## Concept B: Channel > Item

- Pros:
  - Each to pick channel of interest
  - Two clicks to view titles
- Cons:
  - Hard to view today's content

Level 1: Organize by channel, sort by read status, then by timestamp

- (21) Root
  - (5) Hacker News Frontpage
  - (7) CSS Tricks Blog
  - (5) Chrome Developer Blog
  - (4) DistroTube YouTube
  - MDN blog
  - Smashing Magazine

Level 2: List items, sort by read status then by timestamp

- (21) Root
  - (5) Hacker News Frontpage
    - (⚹) New article title 1
    - (⚹) New article title 2
    - (⚹) New article title 3
    - (⚹) New article title 4
    - (⚹) New article title 5
    - Seen Article title 6
