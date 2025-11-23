/**
 * AI Configuration
 * 
 * Replace the webhook URL with your actual n8n webhook endpoint
 */

export const AI_CONFIG = {
  // Your n8n webhook URL
  // Example: "https://your-n8n-instance.com/webhook/calwiz-ai"
  webhookUrl: import.meta.env.VITE_AI_WEBHOOK_URL || "YOUR_N8N_WEBHOOK_URL_HERE",
  
  // Timeout for AI requests (in milliseconds)
  timeout: 30000,
  
  // Enable demo mode (uses fallback responses instead of calling webhook)
  demoMode: true,
};

/**
 * To configure your webhook:
 * 
 * 1. Create a .env.local file in the root of your project
 * 2. Add: VITE_AI_WEBHOOK_URL=https://your-n8n-instance.com/webhook/calwiz-ai
 * 3. Restart your dev server
 * 
 * Or set demoMode to false and update the webhookUrl directly above
 */
