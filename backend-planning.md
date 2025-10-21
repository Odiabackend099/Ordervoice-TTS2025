# Backend Development Plan - OrderVoice AI
## Fix Voice AI & Contact Form Issues

**Date:** October 21, 2025  
**Project:** OrderVoice AI Backend (Supabase)  
**Supabase Project:** OdiaBiz AI (ectphyvfbkwaawtnzrlo)  
**Region:** EU-West-2

---

## 📋 Problem Summary

### Critical Issues from TestSprite:
1. ❌ **Voice API Endpoints return 404**
   - `https://api.odia.dev/v1/analytics/agent-selection`
   - `https://api.odia.dev/v1/agents/lexi_nigerian_customer_service_agent_v1/conversations`

2. ❌ **Contact Form has no backend handler**
   - Form submits but has nowhere to send data
   - Leads are lost

### Current State Analysis:

**Existing Supabase Infrastructure:**
- ✅ Database tables: `users`, `conversations`, `leads`, `interactions`, `bookings`, `profiles`, `user_activity_logs`, `trade_ins`
- ✅ Edge Functions: `ai-chat`, `generate-tts`, `tts`, `odia-tts`, `log-auth-attempt`, `n8n-ingest`
- ✅ RLS enabled on all tables
- ⚠️ Missing: API endpoints for voice conversation management
- ⚠️ Missing: Contact form submission endpoint

---

## 🎯 Goals

### Primary Goals:
1. Create Edge Functions to handle voice AI conversation endpoints
2. Create Edge Function for contact form submission
3. Map custom domain `api.odia.dev` to Supabase functions
4. Ensure all endpoints match frontend expectations

### Success Criteria:
- ✅ Voice demo works end-to-end without 404 errors
- ✅ Contact form successfully captures leads in database
- ✅ Analytics tracking works
- ✅ All TestSprite tests pass (target: 15/15)

---

## 🏗️ Implementation Phases

### **Phase 1: Database Schema Review & Enhancement**
**Objective:** Ensure database supports all required features

#### Tasks:
1.1. Review existing `conversations` table structure  
1.2. Review existing `leads` table structure  
1.3. Add `contact_form_submissions` table if needed  
1.4. Add `agent_sessions` table for voice conversation state  
1.5. Add indexes for performance  

#### Technical Requirements:
- Tables:
  - `contact_form_submissions` - Store form data from website
  - `agent_sessions` - Track voice conversation sessions
  - `analytics_events` - Track agent selection and usage

#### Acceptance Criteria:
- ✅ All tables created with proper RLS policies
- ✅ Foreign key relationships defined
- ✅ Indexes added on frequently queried columns

---

### **Phase 2: Contact Form Edge Function**
**Objective:** Create API endpoint to handle contact form submissions

#### Tasks:
2.1. Create `contact-form-submit` Edge Function  
2.2. Validate incoming form data  
2.3. Insert data into `contact_form_submissions` table  
2.4. Send email notification (optional)  
2.5. Return success response  

#### Technical Requirements:
- **Endpoint:** `POST /functions/v1/contact-form-submit`
- **Input Schema:**
  ```typescript
  {
    name: string;
    email: string;
    phone: string;
    business_name: string;
    industry: string;
    message?: string;
  }
  ```
- **Output:**
  ```typescript
  {
    success: boolean;
    message: string;
    lead_id?: string;
  }
  ```

#### Testing Criteria:
- ✅ Form data is validated
- ✅ Data is inserted into database
- ✅ Duplicate submissions are handled gracefully
- ✅ Returns proper HTTP status codes

---

### **Phase 3: Voice Conversation Management API**
**Objective:** Create endpoints for voice AI conversation flow

#### Tasks:
3.1. Create `create-conversation-session` Edge Function  
3.2. Create `agent-analytics` Edge Function  
3.3. Handle conversation state management  
3.4. Integrate with existing `ai-chat` function  

#### Technical Requirements:

**Endpoint 1:** `POST /v1/agents/lexi_nigerian_customer_service_agent_v1/conversations`
- Create new voice conversation session
- Initialize agent context
- Return session ID and configuration

**Endpoint 2:** `POST /v1/analytics/agent-selection`
- Log when user selects an agent
- Track usage analytics
- Return acknowledgment

#### API Specifications:

```typescript
// POST /v1/agents/:agent_id/conversations
Request: {
  user_id?: string;
  initial_context?: object;
  language?: string;
}

Response: {
  session_id: string;
  agent: {
    id: string;
    name: string;
    voice_config: object;
  };
  status: "active" | "initializing";
}

// POST /v1/analytics/agent-selection
Request: {
  agent_id: string;
  user_id?: string;
  source: "web" | "whatsapp" | "phone";
  timestamp: string;
}

Response: {
  logged: boolean;
  event_id: string;
}
```

#### Testing Criteria:
- ✅ Sessions are created and tracked
- ✅ Analytics events are logged
- ✅ Conversation state persists
- ✅ Proper error handling for edge cases

---

### **Phase 4: API Gateway & URL Routing**
**Objective:** Map custom domain to Supabase Edge Functions

#### Tasks:
4.1. Create routing layer for `/v1/*` endpoints  
4.2. Set up CORS configuration  
4.3. Add rate limiting (optional)  
4.4. Configure custom domain `api.odia.dev`  

#### Technical Requirements:
- **Domain:** `api.odia.dev` → Supabase Edge Functions
- **URL Mapping:**
  ```
  POST api.odia.dev/v1/agents/:agent_id/conversations
    → Supabase: create-conversation-session
  
  POST api.odia.dev/v1/analytics/agent-selection
    → Supabase: log-agent-selection
  
  POST api.odia.dev/v1/contact-form-submit
    → Supabase: contact-form-submit
  ```

#### Implementation Options:
- **Option A:** Use Supabase Edge Functions with custom routes
- **Option B:** Use Cloudflare Workers as reverse proxy
- **Option C:** Use Vercel Edge Functions with rewrites

#### Testing Criteria:
- ✅ All frontend URLs resolve correctly
- ✅ CORS headers allow requests from ordervoice.ai
- ✅ SSL/TLS certificates are valid
- ✅ Response times < 500ms

---

### **Phase 5: Frontend Integration**
**Objective:** Update frontend to use new backend endpoints

#### Tasks:
5.1. Update `index.html` API URLs  
5.2. Update `demo.html` conversation initialization  
5.3. Update `contact.html` form submission  
5.4. Add error handling and retry logic  
5.5. Test end-to-end flow  

#### Technical Requirements:
- Update JavaScript in HTML files to call correct endpoints
- Add loading states
- Handle network errors gracefully
- Display user-friendly error messages

#### Testing Criteria:
- ✅ Voice demo initiates without errors
- ✅ Contact form submits successfully
- ✅ Analytics events are tracked
- ✅ All TestSprite tests pass

---

### **Phase 6: Testing & Quality Assurance**
**Objective:** Verify all functionality works end-to-end

#### Tasks:
6.1. Run TestSprite tests again  
6.2. Manual testing of voice demo  
6.3. Manual testing of contact form  
6.4. Load testing (optional)  
6.5. Security audit  

#### Testing Criteria:
- ✅ TestSprite: 15/15 tests passing (up from 5/15)
- ✅ Voice conversation works smoothly
- ✅ Contact form captures all leads
- ✅ No console errors
- ✅ Response times acceptable

---

### **Phase 7: Deployment & Monitoring**
**Objective:** Deploy to production and set up monitoring

#### Tasks:
7.1. Deploy Edge Functions to production  
7.2. Configure custom domain DNS  
7.3. Set up error monitoring (Sentry/LogRocket)  
7.4. Set up uptime monitoring  
7.5. Document API endpoints  

#### Technical Requirements:
- DNS: CNAME record for `api.odia.dev`
- Monitoring: Track function invocations, errors, latency
- Logging: Centralized logs for debugging

#### Testing Criteria:
- ✅ Production deployment successful
- ✅ Custom domain resolves correctly
- ✅ Monitoring dashboards show metrics
- ✅ Documentation is complete

---

## 🛠️ Technical Architecture

### System Components:

```
┌─────────────────────────────────────────────────────────────┐
│                    OrderVoice AI Website                     │
│              (ordervoice.ai - Vercel Hosting)                │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ HTTPS Requests
                ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                          │
│              (api.odia.dev - Custom Domain)                  │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ Route to Supabase Functions
                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Edge Functions                     │
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │ create-conv-     │  │ log-agent-selection             │  │
│  │ session          │  │ (Analytics)                     │  │
│  └────────┬─────────┘  └──────────┬──────────────────────┘  │
│           │                       │                          │
│  ┌────────▼────────────────────────▼───────────────────┐    │
│  │     contact-form-submit                             │    │
│  │     (Lead Capture)                                  │    │
│  └────────┬────────────────────────────────────────────┘    │
└───────────┼─────────────────────────────────────────────────┘
            │
            │ Write to Database
            ▼
┌─────────────────────────────────────────────────────────────┐
│               Supabase PostgreSQL Database                   │
│  ┌──────────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ agent_       │  │ leads    │  │ contact_form_      │    │
│  │ sessions     │  │          │  │ submissions        │    │
│  └──────────────┘  └──────────┘  └────────────────────┘    │
│  ┌──────────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ conversations│  │ analytics│  │ interactions       │    │
│  │              │  │ _events  │  │                    │    │
│  └──────────────┘  └──────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow:

**Voice Conversation Flow:**
1. User clicks "Start Voice Demo" on website
2. Frontend sends POST to `api.odia.dev/v1/agents/lexi_nigerian_customer_service_agent_v1/conversations`
3. Edge Function creates session in `agent_sessions` table
4. Returns session config to frontend
5. Frontend connects to Deepgram/Groq/MiniMax using session ID
6. Conversation messages stored in `interactions` table

**Contact Form Flow:**
1. User fills form on website
2. Frontend sends POST to `api.odia.dev/v1/contact-form-submit`
3. Edge Function validates data
4. Inserts into `contact_form_submissions` and `leads` tables
5. Returns success response
6. Frontend shows confirmation message

---

## 📊 Dependencies

### External APIs:
- **Deepgram** (Speech-to-Text) - API key required
- **Groq** (LLM) - API key required
- **MiniMax** (Text-to-Speech) - API key + Group ID required

### Supabase Services:
- Edge Functions (Deno runtime)
- PostgreSQL Database (v17)
- Row Level Security (RLS)
- Realtime (optional for live updates)

### Frontend Dependencies:
- None (vanilla HTML/CSS/JS)

---

## 🔒 Security Considerations

### Authentication:
- Public endpoints for demo (no auth required initially)
- Rate limiting to prevent abuse
- CORS restricted to `ordervoice.ai` domain

### Data Protection:
- RLS policies on all tables
- Sensitive data encrypted at rest
- API keys stored as Supabase secrets

### Compliance:
- GDPR-compliant data handling
- User consent for data collection
- Clear privacy policy

---

## 📈 Success Metrics

### Performance:
- API response time < 500ms (p95)
- Edge Function cold start < 1s
- Database query time < 100ms

### Reliability:
- 99.9% uptime
- Error rate < 0.1%
- Successful form submissions > 95%

### TestSprite Results:
- **Before:** 5/15 tests passing (33.33%)
- **Target:** 15/15 tests passing (100%)

---

## 🚨 Risks & Mitigation

### Risk 1: Custom Domain Setup Complexity
- **Mitigation:** Use Supabase's built-in domain support OR Cloudflare Workers
- **Fallback:** Use Supabase function URLs directly (update frontend)

### Risk 2: Rate Limiting Issues
- **Mitigation:** Implement gradual rollout with monitoring
- **Fallback:** Add Cloudflare rate limiting layer

### Risk 3: API Key Exposure
- **Mitigation:** Use Supabase secrets, never commit to git
- **Fallback:** Rotate keys immediately if exposed

---

## 📅 Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Database Schema | 4 tasks | 2 hours |
| Phase 2: Contact Form API | 5 tasks | 3 hours |
| Phase 3: Voice API | 4 tasks | 4 hours |
| Phase 4: API Gateway | 4 tasks | 4 hours |
| Phase 5: Frontend Integration | 5 tasks | 3 hours |
| Phase 6: Testing | 5 tasks | 4 hours |
| Phase 7: Deployment | 5 tasks | 2 hours |
| **TOTAL** | **32 tasks** | **22 hours** |

**Aggressive Timeline:** 3 days  
**Realistic Timeline:** 5-7 days  
**Conservative Timeline:** 2 weeks

---

## ✅ Pre-Flight Checklist

Before starting implementation:
- ✅ Supabase project is active (ectphyvfbkwaawtnzrlo)
- ✅ Database tables exist
- ✅ Edge Functions infrastructure ready
- ✅ Existing `ai-chat` function can be reused
- ✅ Service role key available
- ⏸️ Custom domain DNS access needed
- ⏸️ API keys for Deepgram/Groq/MiniMax needed

---

## 🎯 Next Steps

After this plan is approved:

1. **Execute Phase 1:** Create database tables and migrations
2. **Execute Phase 2:** Build contact form Edge Function
3. **Execute Phase 3:** Build voice conversation APIs
4. **Execute Phase 4:** Set up routing layer
5. **Execute Phase 5:** Update frontend code
6. **Execute Phase 6:** Run TestSprite again
7. **Execute Phase 7:** Deploy to production

---

**Status:** ✅ Plan Complete - Awaiting Approval to Proceed  
**Next Action:** Execute Phase 1 (Database Schema)

