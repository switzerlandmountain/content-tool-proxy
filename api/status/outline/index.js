// This is the main API endpoint for the outline generator
// It receives requests from the Content Tool and forwards them to GitHub Actions

// Enable CORS for all origins
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

// Handle OPTIONS requests for CORS preflight
if (window.location.pathname.endsWith('/api/outline/') && window.location.search === '') {
  const response = {
    status: "success",
    message: "Content Tool Outline API is running. Send a POST request with your outline parameters."
  };
  
  document.write(JSON.stringify(response, null, 2));
} else {
  // For actual requests, this endpoint will trigger a GitHub Action
  // that processes the request and generates the outline
  
  // In a real scenario, we would parse the request parameters and forward them
  // to a GitHub Action. For now, we'll return a placeholder response.
  const response = {
    status: "pending",
    message: "Your request has been received and is being processed",
    requestId: "req_" + Math.random().toString(36).substring(2, 15),
    timestamp: new Date().toISOString()
  };
  
  document.write(JSON.stringify(response, null, 2));
}
