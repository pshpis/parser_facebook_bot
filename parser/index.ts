import {Builder, By, ThenableWebDriver, WebDriver} from 'selenium-webdriver';
import * as chrome from "selenium-webdriver/chrome";
import * as fs from "fs";

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

const loginScript = `
  document.querySelector('input[name="email"]').value='ebanyjkonc@gmail.com';
  document.querySelector('input[name="pass"]').value='Oppayuppa0';
  document.querySelector('button[name="login"]').click();
`;

type NewPostHandler = (newPost: string) => void;


export const allParsers: Array<FacebookParser> = []


interface IFacebookParserConfig{
  newPostHandler: NewPostHandler;
  endlessParsingTimeout: number;
}

export class FacebookParser {
  private chromeOptions: chrome.Options;
  private driver: ThenableWebDriver;
  private oldPostsHash: Set<number>;
  private newPostHandler: NewPostHandler;
  private endlessParsingTimeout: number;
  private loggedIn: boolean;
  private loginStarted: boolean;

  constructor(config: IFacebookParserConfig) {
    this.chromeOptions = new chrome.Options()
      .windowSize({width: 1920, height: 1080})
      .addArguments('--headless');

    this.driver = new Builder()
      .forBrowser('chrome')
      .usingServer('http://78.40.219.74:4444/')
      .setChromeOptions(this.chromeOptions)
      .build();

    this.oldPostsHash = new Set<number>()
    this.newPostHandler = config.newPostHandler;
    this.endlessParsingTimeout = config.endlessParsingTimeout;

    allParsers.push(this);

    this.loggedIn = true;
    this.loginStarted = false;
  }

  private getPostHashCode(s: string) {
    return s.split("").reduce(function(a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  private async openUrl(url: string) {
    await this.driver.get(url);
    await this.driver.sleep(3000);
  }

  private async saveHtml(filename: string) {
    const page = await this.driver.getPageSource();
    await fs.promises.writeFile(filename, page, 'utf8');
  }
  
  
  private async login(){
    if (this.loggedIn || this.loginStarted){
      return;
    }
    this.loginStarted = true;

    console.log('login starting');

    await this.openUrl('https://www.facebook.com/login');
    console.log('has opened');

    await this.saveHtml("fb_login.html");
    await this.driver.executeScript(loginScript);
    await this.driver.sleep(10000);
    console.log("logining finished");
    this.loginStarted = false;
    this.loggedIn = true;
  }

  public async parsePosts(url: string){
    console.log('Starting to parse posts...');

    await this.openUrl(url);

    console.log('Getting posts...');
    await this.driver.executeScript(helpScript);
    await this.driver.sleep(20000);

    const elements= await this.driver.findElements(By.css('.post'));

    await this.saveHtml('fb.html')

    console.log(elements)
    
    if (elements.length === 0) {
      this.loggedIn = false;
      await this.login();
      this.parsePosts(url);
      return;
    }
    for (const element of elements) {
      const text = await element.getText();
      const hash = this.getPostHashCode(text);
      if (!this.oldPostsHash.has(hash)) {
        this.newPostHandler(text);
        this.oldPostsHash.add(hash);
      }
    }

    console.log('Finished to parse posts');
  }

  public async close() {
    await this.driver.quit();
  }

  public async startEndlessParser(urls: Array<string>) {
    for (const url of urls) {
      await this.parsePosts(url);
    }
    for (const url of urls) {
      setInterval(async () => this.parsePosts(url));
    }
  }
}

export function closeAllParsers() {
  allParsers.forEach(fbParser => fbParser.close());
}


process.once('SIGINT', () => closeAllParsers());
process.once('SIGTERM', () => closeAllParsers());