const { TwitterApi } = require('twitter-api-v2');
const request = require('request');
const readline = require('readline');
require('dotenv').config();

const client = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET
});

function getRandomQuoteByCategory(category) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.api-ninjas.com/v1/quotes?category=${category}`;

    request.get({
      url: apiUrl,
      headers: {
        'X-Api-Key': process.env.NINJA_KEY
      },
    }, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode !== 200) {
        reject(new Error(`Error: ${response.statusCode} ${body.toString('utf8')}`));
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
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Prompt user to enter quote category
    rl.question('Enter the category of quotes you want (e.g., movies, life, love): ', async (category) => {
      rl.close();

      // Fetch a random quote based on user-entered category
      const quote = await getRandomQuoteByCategory(category.trim().toLowerCase());

      if (!quote) {
        console.log(`No quotes found for category: ${category}`);
        return;
      }

      const maxTweetLength = 280;
      const maxQuoteLength = maxTweetLength - 5; // Reserve 5 characters for the author

      const truncatedQuote = truncateText(quote.quote, maxQuoteLength);
      const tweetText = `${truncatedQuote}\n- ${quote.author}`;

      // Retrieve hashtags based on the selected category
      const hashtags = getHashtagsForCategory(category.trim().toLowerCase());
      const hashtagString = hashtags.length > 0 ? ` ${hashtags.join(' ')}` : '';

      // Append hashtags to the tweet text
      const tweetWithHashtags = tweetText + hashtagString;

      // Prompt user for confirmation before tweeting
      const confirmation = await askForConfirmation(tweetWithHashtags);
      if (confirmation) {
        const truncatedTweet = truncateText(tweetWithHashtags, maxTweetLength);
        const tweet = await client.v2.tweet(truncatedTweet);
        console.log('Tweet sent successfully:', tweet.data.text);
      } else {
        console.log('Tweet cancelled by user.');
      }
    });
  } catch (error) {
    console.error('Error sending tweet:', error.errors);
  }
}

function askForConfirmation(tweetText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`Tweet the following?\n\n${tweetText}\n\nConfirm (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim() === 'yes');
    });
  });
}

function getHashtagsForCategory(category) {
  const hashtagMap = {
    movies: ['#MovieQuotes', '#Film'],
    life: ['#LifeQuotes', '#Inspiration'],
    love: ['#LoveQuotes', '#Romance'],
    books: ['#BookQuotes', '#Reading'],
    travel: ['#TravelQuotes', '#Adventure']
    // Add more categories and corresponding hashtags as needed
  };

  return hashtagMap[category] || [];
}

// Call sendTweet() to start the process of tweeting a quote
sendTweet();
