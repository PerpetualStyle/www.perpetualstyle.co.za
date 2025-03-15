const fetch = require('node-fetch');  // You may need to install node-fetch if it's not available

exports.handler = async function(event, context) {
  const { code } = event.queryStringParameters;  // GitHub sends the code as a query parameter

  // Check if the 'code' parameter is provided
  if (!code) {
    return {
      statusCode: 400,
      body: 'Error: Missing authorization code.'
    };
  }

  // GitHub OAuth credentials (keep these secure in your environment variables)
  const clientID = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // Make the POST request to GitHub's OAuth access token endpoint
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // Expecting a JSON response from GitHub
      },
      body: JSON.stringify({
        client_id: clientID,
        client_secret: clientSecret,
        code: code,  // The code GitHub returned in the query string
      }),
    });

    const tokenData = await tokenResponse.json();

    // If there's an error with the token exchange
    if (tokenData.error) {
      return {
        statusCode: 400,
        body: `OAuth Error: ${tokenData.error_description || tokenData.error}`
      };
    }

    // Extract the access token from GitHub's response
    const accessToken = tokenData.access_token;

    // You can use the access token to make GitHub API requests (e.g., to get the user's details)
    // For now, let's just return a success message (you can redirect the user after successful login)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Authentication successful!',
        access_token: accessToken,  // Store this token securely for future API calls
      })
    };
  } catch (error) {
    console.error('Error during token exchange:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error during OAuth exchange.'
    };
  }
};
