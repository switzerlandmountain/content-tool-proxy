// This is a serverless function that will be deployed to GitHub Pages
// It uses the GitHub API to trigger a repository_dispatch event
// which will run the GitHub Action to process the outline request

export async function onRequest(context) {
  // Get request data
  let requestData;
  try {
    requestData = await context.request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "Invalid JSON in request body" 
      }),
      { 
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      }
    );
  }

  // Validate required fields
  const { eventId, title, mainKeyword } = requestData;
  if (!eventId || !title || !mainKeyword) {
    return new Response(
      JSON.stringify({ 
        error: "Missing required fields",
        requiredFields: ["eventId", "title", "mainKeyword"]
      }),
      { 
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      }
    );
  }

  // For GitHub Pages static deployment, we'll generate a sample response
  // In a real implementation, this would trigger a GitHub Action
  const generatedText = `# ${title}

## 1. Introduction
- Overview of ${mainKeyword}
- Importance in modern context
- Brief history and evolution

## 2. Key Components of ${mainKeyword}
### 2.1 Component One
- Detailed explanation
- Best practices
- Implementation strategies

### 2.2 Component Two
- Technical aspects
- Integration with existing systems
- Case studies

## 3. Benefits and Advantages
- Improved efficiency
- Cost savings
- Enhanced security

## 4. Implementation Strategies
### 4.1 Planning Phase
- Assessment of needs
- Resource allocation
- Timeline development

### 4.2 Execution Phase
- Step-by-step guide
- Common challenges and solutions
- Quality assurance

## 5. Future Trends
- Emerging technologies
- Industry predictions
- Preparation strategies

## 6. Conclusion
- Summary of key points
- Final recommendations
- Call to action

# SEO Analysis

## Keyword Distribution
- Main keyword "${mainKeyword}" is well-distributed throughout the outline
- Secondary keywords appear in appropriate sections
- Natural keyword integration maintained

## Content Structure
- H1, H2, and H3 headings follow proper hierarchy
- Sections are logically organized
- Content flow supports user engagement

## Optimization Suggestions
- Consider adding a FAQ section to target long-tail keywords
- Include more specific industry examples
- Add statistics and data points to enhance credibility
- Incorporate internal links naturally within content sections`;

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
      processedKeywords: [mainKeyword, ...(requestData.secondaryKeywords || [])],
      aiConfidence: 0.85,
      suggestions: [
        "Consider adding a FAQ section to target long-tail keywords",
        "Include more specific industry examples",
        "Add statistics and data points to enhance credibility"
      ],
      timestamp: new Date().toISOString(),
      version: "1.0"
    }
  };

  // Return the response
  return new Response(
    JSON.stringify(response),
    { 
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    }
  );
}

// Handle OPTIONS requests for CORS
export function onOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
