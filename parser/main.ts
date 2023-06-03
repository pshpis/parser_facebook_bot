import {Builder, By, IWebElement, IWebElementId, Key, until, WebElement} from 'selenium-webdriver';
import * as chrome from "selenium-webdriver/chrome";



const baseUrl = 'https://www.facebook.com/groups/504173917225379/';

const parsePosts = async (url) => {
  const chromeOptions = new chrome.Options()
    .windowSize({width: 1920, height: 1080})
    .addArguments('--headless');

  const driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  try {
    await driver.get(url);
    await driver.sleep(3000);
    const script: string = `
      const feed = document.querySelector('[role="feed"]');
      const lastPost = feed.children[1];
      lastPost.querySelector('[role="button"]').click();
    `;
    await driver.executeScript(script);
    await driver.sleep(3000);
    const element = driver.findElement(By.css('.x1yztbdb'));
    console.log(element);
    console.log(await element.getText());
    console.log(JSON.stringify(element));
  }
  finally {
    await driver.quit();
  }
}

parsePosts(baseUrl);