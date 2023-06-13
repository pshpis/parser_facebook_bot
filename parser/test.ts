import {closeAllParsers, FacebookParser} from "./index";

function start_handler(post: string) {
  console.log('-------------------');
  console.log(post);
  console.log('-------------------');
}

const urls = ['https://www.facebook.com/groups/278895689675846/', 'https://www.facebook.com/groups/504173917225379']

const fbParser = new FacebookParser({
  newPostHandler: start_handler,
  endlessParsingTimeout: 300000
});

fbParser.startEndlessParser(urls);


process.once('SIGINT', () => closeAllParsers());
process.once('SIGTERM', () => closeAllParsers());