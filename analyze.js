const { TwitterApi } = require('twitter-api-v2');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables from .env file
dotenv.config();

// Initialize Twitter API client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// Function to analyze a Twitter profile
async function analyzeProfile(username) {
  try {
    // Fetch user information
    const user = await client.v2.getUserByUsername(username);

    // Display profile information
    console.log(`Profile Analysis for @${username}:`);
    console.log(`Full Name: ${user.data.name}`);
    console.log(`Username: @${user.data.username}`);
    console.log(`Bio: ${user.data.description || 'Not provided'}`);
    console.log(`Location: ${user.data.location || 'Not provided'}`);
    console.log(`Followers Count: ${user.data.public_metrics.followers_count}`);
    console.log(`Following Count: ${user.data.public_metrics.following_count}`);
    console.log(`Tweet Count: ${user.data.public_metrics.tweet_count}`);
  } catch (error) {
    console.error('Error analyzing profile:', error);
  }
}

// Function to prompt user for a Twitter username
function promptForUsername() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter a Twitter username to analyze: ', async (username) => {
    rl.close();
    await analyzeProfile(username);
  });
}

// Start the profile analysis process
promptForUsername();


