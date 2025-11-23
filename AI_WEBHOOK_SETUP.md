# AI Webhook Setup Guide

This guide explains how to set up the AI integration with your n8n webhook for CalWiz.

## Overview

The AI feature allows users to get personalized insights about any day by clicking "Ask AI about this day" in the day detail popup. The app sends structured data to your n8n webhook, which can then forward it to any AI service (OpenAI, Claude, local LLM, etc.).

## Quick Setup

### 1. Configure the Webhook URL

**Option A: Using Environment Variables (Recommended)**

1. Create a `.env.local` file in the root of your project:
```bash
VITE_AI_WEBHOOK_URL=https://your-n8n-instance.com/webhook/calwiz-ai
```

2. Restart your dev server

**Option B: Direct Configuration**

Edit `src/config/ai.config.ts`:
```typescript
export const AI_CONFIG = {
  webhookUrl: "https://your-n8n-instance.com/webhook/calwiz-ai",
  timeout: 30000,
  demoMode: false, // Set to false to use real webhook
};
```

### 2. Create n8n Workflow

1. **Create a new workflow in n8n**
2. **Add a Webhook node** with these settings:
   - HTTP Method: POST
   - Path: `calwiz-ai` (or your preferred path)
   - Response Mode: "When Last Node Finishes"

3. **Add your AI service node** (OpenAI, Anthropic, etc.)
   - Use the webhook body data as input
   - Configure your AI model and parameters

4. **Add a response node** to return the AI's text response

## Data Structure

### Request Payload

The app sends this JSON structure to your webhook:

```json
{
  "type": "numerology" | "astrology",
  "date": "YYYY-MM-DD",
  "data": {
    // For numerology:
    "primaryNumber": number,
    "secondaryNumber": number | null,
    "personalNumber": number | null,
    "lifePathNumber": number | null
    
    // For astrology:
    "zodiacSign": string,
    "chineseSign": string,
    "planetaryInfluence": string,
    "moonPhase": number,
    "sunPosition": number,
    "planetaryPositions": Array,
    "aspects": Array
  },
  "userQuestion": string | null
}
```

### Example Numerology Request

```json
{
  "type": "numerology",
  "date": "2025-11-23",
  "data": {
    "primaryNumber": 7,
    "secondaryNumber": 25,
    "personalNumber": 9,
    "lifePathNumber": 2
  },
  "userQuestion": null
}
```

### Example Astrology Request

```json
{
  "type": "astrology",
  "date": "2025-11-23",
  "data": {
    "zodiacSign": "Sagittarius",
    "chineseSign": "Snake",
    "planetaryInfluence": "Jupiter",
    "moonPhase": 67.5,
    "sunPosition": 241.2,
    "planetaryPositions": [],
    "aspects": []
  },
  "userQuestion": null
}
```

### Expected Response

Your webhook should return **plain text** (not JSON) that will be displayed directly to the user.

Example response:
```
Today's energy resonates with the number 7, inviting deep introspection and spiritual insight. This is a powerful day for meditation, research, and connecting with your inner wisdom. The 7 vibration heightens your intuition, making it an excellent time to trust your gut feelings and explore life's deeper mysteries.

Your personal number 9 amplifies this energy, creating a unique opportunity for completion and transformation. Consider what cycles in your life are ready to close, making space for new beginnings.

Best activities: Morning meditation, afternoon study or research, evening journaling. Avoid: Major social commitments, impulsive decisions.

Affirmation: "I trust the wisdom that flows from my inner knowing."
```

## n8n Workflow Examples

### Basic OpenAI Integration

```
Webhook (POST)
  ↓
Set Variables (extract type, date, data)
  ↓
OpenAI Chat
  - Model: gpt-4
  - System Message: [Use the system prompt from AI_AGENT_SYSTEM_PROMPT.md]
  - User Message: {{ JSON.stringify($json) }}
  ↓
Respond to Webhook
  - Response Body: {{ $json.choices[0].message.content }}
```

### Advanced with Claude

```
Webhook (POST)
  ↓
Switch (based on type)
  ├─ numerology → Format Numerology Prompt
  └─ astrology → Format Astrology Prompt
  ↓
Anthropic Claude
  - Model: claude-3-sonnet
  - System: [System prompt]
  - Messages: [Formatted prompt]
  ↓
Respond to Webhook
```

### With Caching/Database

```
Webhook (POST)
  ↓
Check Cache (MongoDB/Redis)
  - Query: date + type
  ↓
IF cached:
  └─ Return cached response
ELSE:
  ├─ Call AI Service
  ├─ Save to Cache
  └─ Return response
```

## System Prompt

Use the comprehensive system prompt from `AI_AGENT_SYSTEM_PROMPT.md` in your AI service configuration. This prompt:

- Defines the AI's role as a spiritual advisor
- Specifies response format and tone
- Provides interpretation guidelines
- Includes examples for both numerology and astrology

## Testing

### Demo Mode (Default)

The app starts in demo mode with fallback responses. This lets you test the UI without configuring a webhook.

To test with demo mode:
1. Click any day in the calendar
2. Click "Ask AI about this day"
3. See the demo response

### Testing Your Webhook

1. Set `demoMode: false` in `ai.config.ts`
2. Configure your webhook URL
3. Click "Ask AI about this day"
4. Check the browser console for any errors
5. Verify the response displays correctly

### Debugging

Check browser console for:
```javascript
// Request payload
console.log("AI request payload:", payload);

// Response
console.log("AI response:", data);

// Errors
console.error("AI request error:", error);
```

## Security Considerations

### 1. Rate Limiting
Add rate limiting in your n8n workflow to prevent abuse:
```
IF requests > 10 per minute from same IP:
  Return "Too many requests, please try again later"
```

### 2. Authentication (Optional)
Add an API key to secure your webhook:

In `ai.config.ts`:
```typescript
export const AI_CONFIG = {
  webhookUrl: "https://your-n8n-instance.com/webhook/calwiz-ai",
  apiKey: import.meta.env.VITE_AI_API_KEY,
  // ...
};
```

In your fetch call:
```typescript
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${AI_CONFIG.apiKey}`,
}
```

### 3. CORS
Ensure your n8n instance allows requests from your domain:
```
Access-Control-Allow-Origin: https://your-calwiz-domain.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
```

## Cost Optimization

### 1. Caching
Cache responses for identical requests (same date + type):
- Reduces API calls
- Faster response times
- Lower costs

### 2. Token Limits
Set max tokens in your AI service:
- OpenAI: `max_tokens: 500`
- Claude: `max_tokens: 600`

### 3. Model Selection
Choose appropriate models:
- **High quality**: GPT-4, Claude-3-Opus
- **Balanced**: GPT-3.5-Turbo, Claude-3-Sonnet
- **Fast/cheap**: GPT-3.5-Turbo-16k, Claude-3-Haiku

## Troubleshooting

### "Unable to connect to AI service"
- Check webhook URL is correct
- Verify n8n workflow is active
- Check network/CORS issues
- Ensure webhook is publicly accessible

### "Response is empty"
- Verify AI service is returning text
- Check response format in n8n
- Ensure "Respond to Webhook" node is configured

### "Timeout error"
- Increase timeout in `ai.config.ts`
- Optimize AI service response time
- Consider async processing for complex requests

### "Demo response always shows"
- Set `demoMode: false` in config
- Verify webhook URL is not the default placeholder
- Check browser console for errors

## Advanced Features

### User Questions
Future enhancement: Allow users to ask specific questions:
```json
{
  "type": "numerology",
  "date": "2025-11-23",
  "data": { /* ... */ },
  "userQuestion": "What should I focus on today?"
}
```

### Personalization
Include user's birth chart or life path in all requests for more personalized responses.

### Multi-language Support
Add language parameter and translate responses:
```json
{
  "language": "es",
  // ...
}
```

### Voice Responses
Convert text responses to speech using TTS services.

## Support

For issues or questions:
1. Check browser console for errors
2. Test webhook with tools like Postman
3. Verify n8n workflow execution logs
4. Review the system prompt alignment

## Example n8n Workflow JSON

See `n8n-workflow-example.json` (create this file with your working workflow export) for a complete working example.
