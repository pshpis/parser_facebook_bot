import {Builder, By} from 'selenium-webdriver';
import * as chrome from "selenium-webdriver/chrome";

const helpScript =
  `
const feed = document.querySelector('[role="feed"]');

async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}
const scrollToBottom = async () => {
    const needsToScroll = 15000;
    const sleepTime = 500;
    while (window.scrollY < needsToScroll){
        window.scrollTo(0, needsToScroll);
        await sleep(sleepTime);
    }
}

const getMoreButtons = () => {
    const moreButtonClass = "x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xt0b8zv xzsf02u x1s688f";
    const morButtonClasses = moreButtonClass.split(" ");

    const moreButtonsParentClass = "x193iq5w xeuugli x13faqbe x1vvkbs xlh3980 xvmahel x1n0sxbx x6prxxf xvq8zen xo1l8bm xzsf02u";
    const moreButtonsParentClasses = moreButtonsParentClass.split(" ");
    const moreButtonsParentSelector = 'span.' + moreButtonsParentClasses.join('.');

    let moreButtonsSelector = moreButtonsParentSelector +' div.' + morButtonClasses.join('.')
    const moreButtons = document.querySelectorAll(moreButtonsSelector);

    return moreButtons;
}

const getPosts = () => {
    const parentClass = "x1iorvi4 x1pi30zi x1swvt13";
    const parentSelector = 'div[role="feed"] div.' + parentClass.split(" ").join(".");
    const postClass = "x193iq5w xeuugli x13faqbe x1vvkbs xlh3980 xvmahel x1n0sxbx x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x4zkp8e x3x7a5m x6prxxf xvq8zen xo1l8bm xzsf02u";
    const postSelector = parentSelector + ' span.' + postClass.split(" ").join(".");

    return document.querySelectorAll(postSelector);

}

async function main() {
    await scrollToBottom();
    await sleep(1000);
    const moreButtons = getMoreButtons();

    moreButtons.forEach(btn => {
        btn.click();
    });

    await sleep(10000);

    // console.log(moreButtons);

    const posts = getPosts();
    const postStorage = document.createElement('div');
    postStorage.classList.add('post-storage');

    for (const p of posts){
        const post = document.createElement('div');
        post.classList.add('post')
        post.innerHTML = p.innerHTML;

        postStorage.appendChild(post);
    }
    document.body.appendChild(postStorage);
}

main();
`;

const hashCode = function(s: string): number {
  return s.split("").reduce(function(a, b) {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
}

function start_handler(post: string) {
  console.log('-------------------');
  console.log(post);
  console.log('-------------------');
}

const chromeOptions = new chrome.Options()
  .windowSize({width: 1920, height: 1080})
  .addArguments('--headless');

const driver = new Builder()
  .forBrowser('chrome')
  .setChromeOptions(chromeOptions)
  .build();

const oldPostsHash = new Set<number>()

const parsePosts = async (url: string, new_post_handler: any) => {
  await driver.get(url);
  await driver.sleep(3000);

  await driver.executeScript(helpScript);
  await driver.sleep(20000);
  const elements= await driver.findElements(By.css('.post'));

  for (const element of elements) {
    const text = await element.getText();
    const hash = hashCode(text);
    if (!oldPostsHash.has(hash)) {
      new_post_handler(text);
      oldPostsHash.add(hash);
    }
  }

}

const urls = ['https://www.facebook.com/groups/278895689675846/', 'https://www.facebook.com/groups/504173917225379']

for (const url of urls) {
  parsePosts(url, start_handler);
  setInterval(async () => await parsePosts(url, start_handler), 300000);
}
