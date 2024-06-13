const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Increase the limit for JSON payloads
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Serve static files from the "data" directory
app.use('/data', express.static(path.join(__dirname, 'data')));

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const dataset = req.body.dataset;
  const metadata = req.body.metadata;

  console.log(`Received message from user: ${userMessage}`);
  console.log(`Received dataset and metadata from user`);

  try {
    const metadataString = JSON.stringify(metadata);

    const prompt = `
      Here is the metadata from the dataset: ${metadataString}.
      Please generate JavaScript code using Chart.js to plot a graph based on the user's request: ${userMessage}.
      The code should use the variable 'dataset' (already defined in the outer scope) to reference the data, and ensure the code uses this variable to populate the chart.
      The code should be ready to execute in a React component and render the graph inside a given HTML container with id 'graph-container'.
      Ensure the code handles undefined or null values appropriately, avoiding errors such as trying to call methods on undefined or null values.
      Do not redeclare the 'dataset' variable in the code. Do not include import statements, React component definitions, or any other extraneous content. Only include the JavaScript code to initialize and render the chart inside the 'graph-container' element.
    `;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-2024-05-13',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that creates custom code for graphing data.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        n: 1,
        stop: null,
        temperature: 0.2,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ICED_DEMO_API_KEY}`,
        },
      }
    );

    const botMessage = response.data.choices[0].message.content.trim();
    const codeMatch = botMessage.match(/```javascript([\s\S]*?)```/);

    let code = '';
    if (codeMatch && codeMatch[1]) {
      code = codeMatch[1].trim();
    } else {
      code = botMessage; // Fallback in case the code is not wrapped in ```javascript
    }

    // Remove 'const ctx = document.getElementById('graph-container').getContext('2d');' if present
    code = code.replace(/const ctx = document\.getElementById\('graph-container'\)\.getContext\('2d'\);/, '').trim();

    res.json({ reply: botMessage, graphCode: code });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error.response ? error.response.data : error.message);
    res.status(500).send('Error communicating with OpenAI');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
