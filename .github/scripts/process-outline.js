// This script processes outline requests using OpenAI API
const axios = require('axios');
require('dotenv').config();

async function generateOutline() {
  // Get input parameters from environment variables
  const topic = process.env.TOPIC || 'Content Marketing';
  const keywords = process.env.KEYWORDS || '';
  const numSections = parseInt(process.env.SECTIONS || '5', 10);
  
  // Log the received parameters
  console.log(`Generating outline for topic: ${topic}`);
  console.log(`Keywords: ${keywords}`);
  console.log(`Number of sections: ${numSections}`);
  
  // Check if OpenAI API key is available
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY is not set. Please add this secret to your GitHub repository.');
    process.exit(1);
  }
  
  try {
    // Prepare the prompt for OpenAI
    const prompt = `Create a detailed content outline for an article about "${topic}".
The outline should have ${numSections} main sections.
${keywords ? `Include these keywords: ${keywords}` : ''}
Format the response as a JSON object with title, description, and sections array.`;

    // Make a request to OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a content outline generator.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract the generated outline from the response
    const generatedOutline = response.data.choices[0].message.content;
    
    // Log success
    console.log('Outline generated successfully:');
    console.log(generatedOutline);
    
    // Here you would typically save the outline to a file or database
    // For this example, we're just logging it to the console
    
  } catch (error) {
    console.error('Error generating outline:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run the outline generator
generateOutline();
