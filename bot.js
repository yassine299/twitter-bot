const { TwitterApi } = require('twitter-api-v2');
const request = require('request');
require('dotenv').config();

const client = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET
});

function getRandomLifeQuote() {
  return new Promise((resolve, reject) => {
    const category = 'movie';
    request.get({
      url: 'https://api.api-ninjas.com/v1/quotes?category=' + category,
      headers: {
        'X-Api-Key': process.env.NINJA_KEY
      },
    }, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode !== 200) {
        reject(new Error('Error: ' + response.statusCode + ' ' + body.toString('utf8')));
      } else {
        const quotes = JSON.parse(body);
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];
        resolve(randomQuote);
      }
    });
  });
}

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength - 4) + '...';
  }
  return text;
}

async function sendTweet() {
  try {
    const quote = await getRandomLifeQuote();
    const maxTweetLength = 280;
    const maxQuoteLength = maxTweetLength - 5; // Reserve 5 characters for the author

    const truncatedQuote = truncateText(quote.quote, maxQuoteLength);
    const tweetText = `${truncatedQuote}\n- ${quote.author}`;
    const truncatedTweet = truncateText(tweetText, maxTweetLength);

    const tweet = await client.v2.tweet(truncatedTweet);
    console.log('Tweet sent successfully:', tweet.data.text);
  } catch (error) {
    console.error('Error sending tweet:', error.errors);
  }
}

sendTweet();
