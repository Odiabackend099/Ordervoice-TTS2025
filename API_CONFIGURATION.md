# API Configuration Documentation
## OrderVoice AI Backend Integration

**Date:** October 21, 2025
**Status:** 🔴 CRITICAL - Backend API endpoints not deployed
**Impact:** Voice AI features on homepage are non-functional

---

## Problem Summary

The TestSprite report identified that the homepage (`index.html`) attempts to connect to backend API endpoints that return 404 errors:

1. `https://api.odia.dev/v1/analytics/agent-selection` - Analytics tracking
2. `https://api.odia.dev/v1/agents/{agent_id}/conversations` - Conversation session creation

### Current State

- **Frontend Code:** Located in `index.html` (lines 2658-2688, 2875-2887)
- **API Domain:** `https://api.odia.dev`
- **Authentication:** Uses hardcoded Bearer token `odia_prod_key_2024_atlas_lexi_v1`
- **Voice Provider:** ElevenLabs WebSocket API
- **Issue:** ODIA API endpoints are not deployed/accessible

### Files Affected

- `/index.html` - Homepage with embedded voice demo (contains API calls)
- `/demo.html` - Demo page (correctly uses WhatsApp/phone only - no API calls)
- `/contact.html` - Contact page (now fixed with Netlify Forms)

---

## Solutions (Choose One)

### Option 1: Deploy ODIA Backend API (Recommended for Production)

**Pros:**
- Full control over analytics and conversation management
- Can implement custom business logic
- Better security and data privacy

**Cons:**
- Requires backend development and deployment
- Higher complexity and maintenance

**Implementation Steps:**

1. **Set up backend infrastructure** (e.g., Node.js + Express, Python + FastAPI)

2. **Create API endpoints:**

   ```
   POST /v1/analytics/agent-selection
   - Tracks which AI agent users select
   - Stores analytics data in your database

   POST /v1/agents/{agent_id}/conversations
   - Creates new conversation session
   - Returns conversation_id for tracking
   - Manages session configuration
   ```

3. **Deploy to production:**
   - Use Vercel Serverless Functions, Railway, or AWS Lambda
   - Configure DNS: `api.odia.dev` → your backend
   - Add environment variables for API keys

4. **Update authentication:**
   - Replace hardcoded token with environment variable
   - Implement proper token validation on backend

---

### Option 2: Remove API Calls & Use Direct ElevenLabs Integration (Quick Fix)

**Pros:**
- No backend required
- Works immediately
- Simpler architecture

**Cons:**
- No analytics tracking
- No conversation management
- Limited customization

**Implementation Steps:**

1. **Remove ODIA API calls from `index.html`:**
   - Remove analytics tracking function (lines 2873-2888)
   - Simplify conversation start to directly connect to ElevenLabs WebSocket
   - Remove conversation session creation (lines 2658-2677)

2. **Update voice demo to connect directly to ElevenLabs:**

   ```javascript
   async function startConversation() {
       try {
           // Connect directly to ElevenLabs
           const agentId = getElevenLabsAgentId(currentAgent);
           const websocketUrl = `wss://api.elevenlabs.io/v1/convai/conversation?authorization=Bearer ${ELEVENLABS_API_KEY}&agent_id=${agentId}`;

           websocket = new WebSocket(websocketUrl);
           // ... rest of WebSocket handling
       } catch (error) {
           console.error('Failed to start conversation:', error);
       }
   }
   ```

3. **Move API keys to environment variables:**
   - Create `.env` file (already in `.gitignore`)
   - Store ElevenLabs API key securely
   - Use Vercel environment variables for production

---

### Option 3: Disable Voice Demo on Homepage (Safest for Now)

**Pros:**
- No broken functionality
- Marketing site still works
- Focus on WhatsApp/phone demos

**Cons:**
- Missing interactive demo feature
- Less engagement on homepage

**Implementation Steps:**

1. **Hide or remove voice demo section from `index.html`**
2. **Update homepage to emphasize:**
   - "Try Live Demo" → Redirect to `/demo.html` (WhatsApp/phone)
   - "Book a Call" → Redirect to `/contact.html`
3. **Add banner:** "Want to try our AI? WhatsApp us now!"

---

## Current API Endpoints in Code

### 1. Analytics Endpoint (`index.html:2875`)

**URL:** `POST https://api.odia.dev/v1/analytics/agent-selection`

**Request Body:**
```json
{
  "agent_type": "atlas" | "lexi",
  "timestamp": "2025-10-21T12:34:56.789Z",
  "user_agent": "Mozilla/5.0...",
  "referrer": "https://google.com"
}
```

**Purpose:** Track which AI agent users select for analytics

**Status:** 404 - Endpoint does not exist

**Fix:** Either deploy backend or remove this call (non-critical)

---

### 2. Conversation Session Endpoint (`index.html:2658`)

**URL:** `POST https://api.odia.dev/v1/agents/{agent_id}/conversations`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer odia_prod_key_2024_atlas_lexi_v1
```

**Request Body:**
```json
{
  "user_id": "generated_unique_id",
  "language": "en-US",
  "session_config": {
    "max_duration": 1800,
    "enable_analytics": true,
    "enable_payments": true
  }
}
```

**Expected Response:**
```json
{
  "conversation_id": "conv_abc123",
  "status": "active",
  "created_at": "2025-10-21T12:34:56.789Z"
}
```

**Purpose:** Create session before connecting to ElevenLabs WebSocket

**Status:** 404 - Endpoint does not exist

**Fix:** Deploy backend OR remove and connect directly to ElevenLabs

---

## Security Concerns

### Exposed API Keys in Frontend Code

**Current Issue:**
- ElevenLabs API key is hardcoded in `index.html` (line 2683)
- ODIA Bearer token is hardcoded (lines 2662, 2879)

**Risk:**
- Anyone can inspect the source code and steal API keys
- Could lead to unauthorized API usage and charges

**Recommended Fix:**

1. **Move voice demo to backend proxy:**
   ```
   Frontend → Your Backend API → ElevenLabs API
   ```

2. **Create serverless function** (e.g., Vercel Function):
   ```javascript
   // /api/start-conversation.js
   export default async function handler(req, res) {
       const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

       // Validate request, rate limit, etc.

       // Create conversation session
       const response = await fetch('https://api.elevenlabs.io/...', {
           headers: {
               'Authorization': `Bearer ${ELEVENLABS_API_KEY}`
           }
       });

       return res.json(await response.json());
   }
   ```

3. **Update frontend to call your backend:**
   ```javascript
   const session = await fetch('/api/start-conversation', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ agent: currentAgent })
   });
   ```

---

## Recommended Next Steps

### Immediate (1-2 days)
1. ✅ **Contact form fixed** (now using Netlify Forms)
2. 🔄 **Choose API strategy:** Option 1, 2, or 3 above
3. 📝 **Update `index.html`** based on chosen strategy

### Short-term (1 week)
1. Deploy backend API infrastructure (if choosing Option 1)
2. Move API keys to environment variables
3. Implement backend proxy for ElevenLabs API
4. Add rate limiting and security measures

### Long-term (2-4 weeks)
1. Build analytics dashboard to view conversation data
2. Implement conversation logging and replay
3. Add payment integration for seamless trial-to-paid conversion
4. Create admin panel for managing AI agents

---

## Testing Checklist

After implementing fixes:

- [ ] Contact form submissions work (Netlify Forms)
- [ ] Voice demo connects successfully (if keeping it)
- [ ] No 404 errors in browser console
- [ ] API keys are not exposed in frontend code
- [ ] Analytics tracking works (if implemented)
- [ ] WhatsApp demo link works on all pages
- [ ] Demo page clearly explains how to try the AI

---

## Questions?

Contact: support@ordervoice.ai | +234 814 199 5397

---

**Last Updated:** October 21, 2025
**Author:** Claude Code AI Assistant
**Based On:** TestSprite MCP Testing Report
