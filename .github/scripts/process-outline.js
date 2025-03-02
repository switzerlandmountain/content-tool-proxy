const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI with API key from environment variables
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Helper function to process WDF*IDF data
function processWdfIdf(wdfIdf) {
  if (!wdfIdf) return null;
  
  // Extract top keywords based on TF*IDF
  const topKeywords = wdfIdf.analysis.topTerms
    .map(term => ({ 
      term, 
      weight: wdfIdf.terms.find(t => t.term === term)?.tfidf || 0 
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map(k => k.term);
    
  // Create prompt context from WDF*IDF analysis
  const promptContext = `
    Important topics according to WDF*IDF analysis:
    ${topKeywords.join(', ')}
    
    Underused terms that should be incorporated more:
    ${wdfIdf.analysis.underusedTerms.join(', ')}
    
    Overused terms that should be reduced:
    ${wdfIdf.analysis.overusedTerms.join(', ')}
  `;
  
  return {
    promptContext,
    enhancedKeywords: topKeywords
  };
}

async function processOutlineRequest() {
  try {
    // Parse request data from environment variable
    const requestData = JSON.parse(process.env.REQUEST_DATA || '{}');
    const { 
      eventId, 
      title, 
      mainKeyword, 
      secondaryKeywords, 
      companyInfo, 
      internalLinks, 
      additionalContent,
      wdfIdf 
    } = requestData;

    // Validate required fields
    if (!eventId || !title || !mainKeyword) {
      console.error('Missing required fields');
      process.exit(1);
    }

    // Process WDF*IDF data if available
    const wdfIdfData = wdfIdf ? processWdfIdf(wdfIdf) : null;
    
    // Prepare keywords for the prompt
    const allKeywords = [
      mainKeyword,
      ...(secondaryKeywords || []),
      ...(wdfIdfData?.enhancedKeywords || [])
    ];
    
    // Create the system prompt
    const systemPrompt = `You are an expert content strategist and SEO specialist. 
    Your task is to create a detailed, SEO-optimized outline for an article.
    Focus on creating a well-structured, comprehensive outline that covers the topic thoroughly.`;
    
    // Create the user prompt
    const userPrompt = `Create a detailed SEO-optimized outline for: "${title}"
    
    Main Keyword: ${mainKeyword}
    Secondary Keywords: ${allKeywords.join(', ')}
    
    Company Context: ${companyInfo || ''}
    
    ${wdfIdfData ? `WDF*IDF Analysis:\n${wdfIdfData.promptContext}` : ''}
    
    ${internalLinks ? `Internal Links to include:\n${internalLinks}` : ''}
    
    ${additionalContent ? `Additional Context:\n${additionalContent}` : ''}
    
    Please provide:
    1. A comprehensive outline with H1, H2, and H3 headings
    2. Brief descriptions of what each section should cover
    3. SEO analysis with optimization suggestions
    `;

    // Call OpenAI API to generate the outline
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Extract the generated outline
    const generatedText = completion.data.choices[0]?.message?.content || "";
    
    // Split the response into outline and SEO analysis
    const parts = generatedText.split(/#{1,3}\s*SEO Analysis/i);
    const outline = parts[0].trim();
    const seoAnalysis = parts.length > 1 ? `# SEO Analysis\n\n${parts[1].trim()}` : "";

    // Prepare the response
    const response = {
      eventId,
      status: "completed",
      outline,
      seoAnalysis,
      metadata: {
        processedKeywords: allKeywords,
        aiConfidence: 0.85,
        suggestions: seoAnalysis.split('\n').filter(line => line.trim().startsWith('-')).slice(0, 3),
        timestamp: new Date().toISOString(),
        version: "1.0",
        wdfIdfAnalysis: wdfIdf ? {
          score: wdfIdf.analysis.coverageStats.good / 
                (wdfIdf.analysis.coverageStats.good + 
                 wdfIdf.analysis.coverageStats.medium + 
                 wdfIdf.analysis.coverageStats.poor),
          recommendations: [
            `Important underused terms: ${wdfIdf.analysis.underusedTerms.join(', ')}`,
            `Potentially overused terms: ${wdfIdf.analysis.overusedTerms.join(', ')}`
          ],
          terms: wdfIdf.terms,
          topTerms: wdfIdf.analysis.topTerms,
          underusedTerms: wdfIdf.analysis.underusedTerms,
          overusedTerms: wdfIdf.analysis.overusedTerms,
          coverageStats: wdfIdf.analysis.coverageStats
        } : null
      }
    };

    // Save response to output for GitHub Actions
    console.log(`::set-output name=response::${JSON.stringify(response)}`);
    
    // Also save to a JSON file as a backup
    const responsePath = path.join(__dirname, '..', '..', 'api', 'responses', `${eventId}.json`);
    fs.mkdirSync(path.dirname(responsePath), { recursive: true });
    fs.writeFileSync(responsePath, JSON.stringify(response, null, 2));
    
    console.log('Outline processed successfully');
  } catch (error) {
    console.error('Error processing outline:', error);
    process.exit(1);
  }
}

// Run the function
processOutlineRequest();
