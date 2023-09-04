import browser from "webextension-polyfill";
import { parseXmlFeed } from "../modules/feed-parser/parse";
import type { MessageToBackground } from "../typings/events";

browser.runtime.onMessage.addListener((message: MessageToBackground) => {
  if (message.requestFetchAllFeeds) {
    testFeedUrls.map((url) =>
      fetch(url)
        .then((res) => res.text())
        .then(parseXmlFeed)
        .then((feed) => {
          browser.runtime.sendMessage({
            feed,
          });
        })
    );
  }
});

const testFeedUrls = [
  "https://ntietz.com/atom.xml",
  "https://ploum.net/atom_en.xml",
  "https://mmazzarolo.com/blog/index.xml",
  "https://www.spicyweb.dev/feed.xml",
  "https://blogs.gnome.org/tbernard/feed/",
  "https://thesephist.com/index.xml",
  "https://sive.rs/en.atom",
  "https://ishadeed.com/feed.xml",
  "https://cprimozic.net/rss.xml",
  "https://simonwillison.net/atom/everything/",
  "https://lilianweng.github.io/index.xml",
  "https://writings.stephenwolfram.com/feed/",
  "https://the.scapegoat.dev/feed/?type=rss",
  "https://thevaluable.dev/index.xml",
  "https://onethingwell.org/rss",
  "https://www.hillelwayne.com/post/index.xml",
  "https://christianheilmann.com/feed/",
  "https://daverupert.com/atom.xml",
  "https://www.taniarascia.com/rss.xml",
  "https://ishadeed.com/feed.xml",
  "https://gomakethings.com/feed/index.xml",
  "https://lea.verou.me/feed/",
  "https://www.baldurbjarnason.com/index.xml",
  "https://maggieappleton.com/rss.xml",
  "https://subconscious.substack.com/feed",
  "https://seirdy.one/posts/atom.xml",
  "https://rpeszek.github.io/RSS.xml",
  "https://stratechery.com/feed/",
  "https://ryanmulligan.dev/blog/feed.xml",
  "https://ciechanow.ski/atom.xml",
  "https://www.unixsheikh.com/feed.rss",
  "https://css-tricks.com/feed/",
  "https://www.smashingmagazine.com/feed/",
  "https://logicmag.io/rss.xml",
  "https://increment.com/feed.xml",
  "https://wdrl.info/feed",
  "https://alistapart.com/main/feed/",
  "https://tympanus.net/codrops/feed/",
  "https://www.thisiscolossal.com/feed/",
  "https://blog.tubikstudio.com/feed/",
  "https://www.loversmagazine.com/feed",
  "https://github.com/readme.rss",
  "https://feeds.feedburner.com/logodesignlove",
  "https://blog.rust-lang.org/feed.xml",
  "https://www.figma.com/blog/feed/atom.xml",
  "https://developer.chrome.com/feeds/blog.xml",
  "https://webkit.org/feed/atom/",
  "https://hacks.mozilla.org/feed/",
  "https://cprss.s3.amazonaws.com/golangweekly.com.xml",
  "https://go.dev/blog/feed.atom",
];
