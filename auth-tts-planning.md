# Authentication & TTS Engine - Implementation Plan
## OrderVoice AI - Phase 2 Enhancements

**Date:** October 21, 2025  
**Project:** OrderVoice AI  
**Scope:** User Authentication + Unified TTS API Service

---

## 🎯 Goals

### Primary Objectives:
1. **Implement complete authentication flow** with email verification
2. **Build user dashboard** connected to backend APIs
3. **Create unified TTS API service** with clean endpoints

### Success Criteria:
- ✅ Users can register, verify email, login, and reset password
- ✅ Dashboard displays user data from Supabase
- ✅ Single TTS endpoint supports multiple voice providers
- ✅ All features tested and production-ready

---

## 🏗️ Implementation Phases

### **Phase 1: Supabase Authentication Setup**
**Objective:** Configure Supabase Auth for email/password authentication

#### Tasks:
1.1. Enable Email Auth in Supabase project  
1.2. Configure email templates (verification, password reset)  
1.3. Set up auth redirect URLs  
1.4. Create RLS policies for authenticated users  
1.5. Test auth flow with Supabase client  

#### Technical Requirements:
- **Supabase Auth Features:**
  - Email/password provider
  - Email verification enabled
  - Password reset functionality
  - Email rate limiting
  
- **Email Templates:**
  - Welcome email with verification link
  - Password reset email
  - Custom branding (OrderVoice AI)

#### Acceptance Criteria:
- ✅ Users can register with email/password
- ✅ Verification email sent automatically
- ✅ Email verification link works
- ✅ Password reset flow functional

---

### **Phase 2: Frontend Authentication UI**
**Objective:** Build registration, login, and password reset pages

#### Tasks:
2.1. Create `/auth/register.html` page  
2.2. Create `/auth/login.html` page  
2.3. Create `/auth/reset-password.html` page  
2.4. Create `/auth/verify-email.html` success page  
2.5. Add authentication state management  
2.6. Implement form validation  

#### Technical Requirements:

**Registration Page (`/auth/register.html`):**
```html
- Email input (validated)
- Password input (min 8 chars, complexity check)
- Confirm password field
- Business name (optional)
- Industry dropdown
- "Sign Up" button
- Link to login page
```

**Login Page (`/auth/login.html`):**
```html
- Email input
- Password input
- "Remember me" checkbox
- "Sign In" button
- "Forgot password?" link
- Link to registration page
```

**Password Reset (`/auth/reset-password.html`):**
```html
- Email input
- "Send Reset Link" button
- Confirmation message
- Link back to login
```

#### JavaScript Auth Functions:
```javascript
// Supabase Auth Client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Register new user
async function signUp(email, password, metadata) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: 'https://ordervoice.ai/auth/verify-email'
    }
  })
  return { data, error }
}

// Login user
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// Logout user
async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Reset password
async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://ordervoice.ai/auth/update-password'
  })
  return { data, error }
}

// Get current user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Check auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') console.log('User signed in:', session.user)
  if (event === 'SIGNED_OUT') console.log('User signed out')
})
```

#### Acceptance Criteria:
- ✅ Registration form validates inputs
- ✅ Login redirects to dashboard
- ✅ Password reset sends email
- ✅ Auth errors displayed clearly

---

### **Phase 3: User Dashboard**
**Objective:** Build protected dashboard showing user data

#### Tasks:
3.1. Create `/dashboard/index.html` page  
3.2. Implement route protection (redirect if not logged in)  
3.3. Fetch user's conversation sessions  
3.4. Display analytics (calls made, minutes used)  
3.5. Show account details  
3.6. Add logout button  
3.7. Link to settings page  

#### Technical Requirements:

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  OrderVoice AI Dashboard                  [Logout]      │
├─────────────────────────────────────────────────────────┤
│  Welcome back, [User Name]!                             │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Total Calls  │  │  Minutes     │  │  Active      │ │
│  │     127      │  │    453       │  │  Sessions    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  Recent Conversations:                                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Session ID          │ Date       │ Duration │ Agent││
│  │ session_123...      │ Oct 21     │ 3m 42s   │ Lexi ││
│  │ session_456...      │ Oct 20     │ 5m 12s   │ Atlas││
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [View All Sessions]  [Account Settings]  [Billing]    │
└─────────────────────────────────────────────────────────┘
```

**API Calls:**
```javascript
// Fetch user's sessions
async function getUserSessions() {
  const user = await getCurrentUser()
  const { data, error } = await supabase
    .from('agent_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(10)
  
  return { data, error }
}

// Fetch user analytics
async function getUserAnalytics() {
  const user = await getCurrentUser()
  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_type, created_at')
    .eq('user_id', user.id)
  
  return { data, error }
}

// Update user profile
async function updateProfile(updates) {
  const user = await getCurrentUser()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
  
  return { data, error }
}
```

#### Acceptance Criteria:
- ✅ Dashboard loads only for authenticated users
- ✅ User data fetched from Supabase
- ✅ Sessions displayed in table
- ✅ Analytics show correct counts
- ✅ Logout button works

---

### **Phase 4: Unified TTS API Service**
**Objective:** Create single endpoint for all TTS operations

#### Tasks:
4.1. Design TTS API interface  
4.2. Create `unified-tts` Edge Function  
4.3. Integrate MiniMax TTS  
4.4. Add voice selection logic  
4.5. Implement audio caching  
4.6. Add usage tracking  

#### Technical Requirements:

**TTS API Specification:**

**Endpoint:** `POST /functions/v1/unified-tts`

**Request Schema:**
```typescript
interface TTSRequest {
  text: string;              // Required: Text to convert to speech
  voice?: string;            // Optional: Voice ID (default: nigerian_english_female)
  provider?: 'minimax' | 'elevenlabs';  // Optional: TTS provider
  language?: string;         // Optional: Language code (default: en)
  speed?: number;            // Optional: Speech speed 0.5-2.0 (default: 1.0)
  format?: 'mp3' | 'wav';    // Optional: Audio format (default: mp3)
  user_id?: string;          // Optional: For usage tracking
}
```

**Response Schema:**
```typescript
interface TTSResponse {
  success: boolean;
  audio_url?: string;        // Direct URL to audio file
  audio_data?: string;       // Base64 encoded audio (if inline requested)
  duration_seconds?: number; // Audio duration
  characters_processed: number;
  provider_used: string;
  cached: boolean;           // Whether result was from cache
  usage_id?: string;         // For billing tracking
}
```

**Error Response:**
```typescript
interface TTSError {
  success: false;
  error: string;
  error_code: 'INVALID_TEXT' | 'RATE_LIMIT' | 'QUOTA_EXCEEDED' | 'PROVIDER_ERROR';
  details?: string;
}
```

#### Edge Function Implementation:
```typescript
// unified-tts/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface TTSRequest {
  text: string;
  voice?: string;
  provider?: 'minimax' | 'elevenlabs';
  language?: string;
  speed?: number;
  format?: 'mp3' | 'wav';
  user_id?: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: TTSRequest = await req.json();

    // Validate request
    if (!request.text || request.text.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Text is required',
          error_code: 'INVALID_TEXT'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check text length limits
    if (request.text.length > 5000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Text exceeds maximum length of 5000 characters',
          error_code: 'INVALID_TEXT'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Default values
    const voice = request.voice || 'nigerian_english_female';
    const provider = request.provider || 'minimax';
    const language = request.language || 'en';
    const speed = request.speed || 1.0;
    const format = request.format || 'mp3';

    // Generate cache key
    const cacheKey = `tts_${provider}_${voice}_${btoa(request.text).slice(0, 50)}`;

    // Check cache first
    const { data: cachedAudio } = await supabase
      .from('tts_cache')
      .select('audio_url, duration_seconds')
      .eq('cache_key', cacheKey)
      .single();

    if (cachedAudio) {
      // Return cached result
      return new Response(
        JSON.stringify({
          success: true,
          audio_url: cachedAudio.audio_url,
          duration_seconds: cachedAudio.duration_seconds,
          characters_processed: request.text.length,
          provider_used: provider,
          cached: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate TTS based on provider
    let audioUrl: string;
    let duration: number;

    if (provider === 'minimax') {
      // Call MiniMax API
      const minimaxResponse = await fetch('https://api.minimax.chat/v1/text_to_speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('MINIMAX_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: request.text,
          model: 'speech-02-hd',
          voice_id: voice,
          speed: speed
        })
      });

      if (!minimaxResponse.ok) {
        throw new Error('MiniMax TTS failed');
      }

      const result = await minimaxResponse.json();
      audioUrl = result.audio_url;
      duration = result.duration || 0;

    } else if (provider === 'elevenlabs') {
      // Call ElevenLabs API
      const elevenLabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')!,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: request.text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );

      if (!elevenLabsResponse.ok) {
        throw new Error('ElevenLabs TTS failed');
      }

      const audioBuffer = await elevenLabsResponse.arrayBuffer();
      // Upload to Supabase Storage
      const fileName = `tts/${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`;
      const { data: uploadData } = await supabase.storage
        .from('audio-files')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg'
        });

      audioUrl = uploadData?.path 
        ? `${supabaseUrl}/storage/v1/object/public/audio-files/${uploadData.path}`
        : '';
      duration = 0; // Would need to calculate from audio
    }

    // Cache the result
    await supabase.from('tts_cache').insert({
      cache_key: cacheKey,
      text: request.text,
      voice: voice,
      provider: provider,
      audio_url: audioUrl,
      duration_seconds: duration
    });

    // Log usage
    if (request.user_id) {
      await supabase.from('tts_usage').insert({
        user_id: request.user_id,
        provider: provider,
        characters: request.text.length,
        duration_seconds: duration
      });
    }

    // Return result
    return new Response(
      JSON.stringify({
        success: true,
        audio_url: audioUrl,
        duration_seconds: duration,
        characters_processed: request.text.length,
        provider_used: provider,
        cached: false
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('TTS error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate speech',
        error_code: 'PROVIDER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

#### Database Schema for TTS:
```sql
-- TTS Cache table
CREATE TABLE IF NOT EXISTS public.tts_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  text TEXT NOT NULL,
  voice TEXT NOT NULL,
  provider TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tts_cache_key ON public.tts_cache(cache_key);
CREATE INDEX idx_tts_cache_created ON public.tts_cache(created_at DESC);

-- TTS Usage tracking
CREATE TABLE IF NOT EXISTS public.tts_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  characters INTEGER NOT NULL,
  duration_seconds NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tts_usage_user ON public.tts_usage(user_id);
CREATE INDEX idx_tts_usage_created ON public.tts_usage(created_at DESC);
```

#### Acceptance Criteria:
- ✅ Single endpoint handles all TTS requests
- ✅ Supports multiple providers (MiniMax, ElevenLabs)
- ✅ Audio caching reduces costs
- ✅ Usage tracked per user
- ✅ Clean error handling

---

### **Phase 5: Database Schema Updates**
**Objective:** Add tables for auth and TTS features

#### Tasks:
5.1. Create `tts_cache` table  
5.2. Create `tts_usage` table  
5.3. Update `profiles` table with auth metadata  
5.4. Create RLS policies for user data  
5.5. Add indexes for performance  

#### SQL Migrations:
```sql
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.agent_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Policy: Users can view their own analytics
CREATE POLICY "Users can view own analytics"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can view their own TTS usage
CREATE POLICY "Users can view own TTS usage"
  ON public.tts_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

#### Acceptance Criteria:
- ✅ All tables have proper RLS policies
- ✅ Users can only access their own data
- ✅ Indexes improve query performance

---

### **Phase 6: Integration & Testing**
**Objective:** Connect all pieces and test end-to-end

#### Tasks:
6.1. Test complete auth flow  
6.2. Test dashboard data loading  
6.3. Test TTS API with different inputs  
6.4. Load testing (100 concurrent requests)  
6.5. Security audit  
6.6. Performance optimization  

#### Test Scenarios:
```
Auth Flow:
1. Register new user → Verify email sent
2. Click verification link → Email verified
3. Login with credentials → Redirected to dashboard
4. Logout → Redirected to homepage
5. Forgot password → Reset email sent
6. Reset password → Can login with new password

Dashboard:
1. Load dashboard → Shows user sessions
2. Click session → View session details
3. Update profile → Changes saved
4. View analytics → Correct counts displayed

TTS API:
1. Short text (10 chars) → Audio generated
2. Long text (1000 chars) → Audio generated
3. Same text again → Cached result returned
4. Invalid provider → Error handled
5. Missing text → Validation error
```

#### Acceptance Criteria:
- ✅ All auth flows work without errors
- ✅ Dashboard loads in < 2 seconds
- ✅ TTS API handles 100 req/s
- ✅ No security vulnerabilities found

---

### **Phase 7: Documentation & Deployment**
**Objective:** Document features and deploy to production

#### Tasks:
7.1. Write auth documentation  
7.2. Write TTS API documentation  
7.3. Create user onboarding guide  
7.4. Deploy auth pages to production  
7.5. Deploy dashboard to production  
7.6. Monitor for errors  

#### Documentation to Create:
1. **AUTH.md** - Authentication setup guide
2. **TTS-API.md** - TTS API reference
3. **USER-GUIDE.md** - How to use OrderVoice AI
4. **ADMIN-GUIDE.md** - Managing users and data

#### Acceptance Criteria:
- ✅ All features deployed to production
- ✅ Documentation complete and accurate
- ✅ No errors in production logs

---

## 📊 Technical Architecture

### **Authentication Flow:**
```
User Registration:
1. User fills form → POST to Supabase Auth
2. Supabase sends verification email
3. User clicks link → Email verified
4. User can login

User Login:
1. User enters credentials → POST to Supabase Auth
2. Supabase returns JWT token
3. Token stored in localStorage
4. User redirected to dashboard

Protected Routes:
1. Check if JWT exists
2. Validate JWT with Supabase
3. If valid → Load page
4. If invalid → Redirect to login
```

### **Dashboard Data Flow:**
```
1. User logs in → JWT token obtained
2. Dashboard loads → Fetch user data with JWT
3. API calls to Supabase:
   - GET /profiles → User profile
   - GET /agent_sessions → User sessions
   - GET /analytics_events → User analytics
4. Display data in dashboard
5. User actions → UPDATE requests with JWT
```

### **TTS API Flow:**
```
1. Client sends TTS request
2. Check cache for existing audio
3. If cached → Return cached URL
4. If not cached:
   - Call provider API (MiniMax/ElevenLabs)
   - Store audio in Supabase Storage
   - Cache result in database
5. Track usage in tts_usage table
6. Return audio URL to client
```

---

## 🔐 Security Considerations

### **Authentication:**
- ✅ Passwords hashed by Supabase (bcrypt)
- ✅ JWT tokens expire after 1 hour
- ✅ Refresh tokens for extended sessions
- ✅ Email verification required
- ✅ Rate limiting on auth endpoints

### **Authorization:**
- ✅ RLS policies on all tables
- ✅ Users can only access their own data
- ✅ Service role key only in Edge Functions
- ✅ Anon key safe for frontend

### **API Security:**
- ✅ CORS configured properly
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (Supabase handles)
- ✅ Rate limiting on TTS API

---

## 📅 Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Supabase Auth Setup | 5 tasks | 2 hours |
| Phase 2: Frontend Auth UI | 6 tasks | 4 hours |
| Phase 3: User Dashboard | 7 tasks | 5 hours |
| Phase 4: Unified TTS API | 6 tasks | 6 hours |
| Phase 5: Database Updates | 5 tasks | 2 hours |
| Phase 6: Integration Testing | 6 tasks | 4 hours |
| Phase 7: Documentation | 6 tasks | 3 hours |
| **TOTAL** | **41 tasks** | **26 hours** |

**Aggressive Timeline:** 3-4 days  
**Realistic Timeline:** 1 week  
**Conservative Timeline:** 2 weeks

---

## ✅ Pre-Flight Checklist

- ✅ Supabase project active (ectphyvfbkwaawtnzrlo)
- ✅ Backend APIs working (verified in previous phase)
- ✅ Frontend files ready to extend
- ⏸️ MiniMax API key available
- ⏸️ ElevenLabs API key (if using)
- ⏸️ Email SMTP configured in Supabase

---

## 🎯 Next Steps

After this plan is approved:

1. **Execute Phase 1:** Enable Supabase Auth
2. **Execute Phase 2:** Build auth UI pages
3. **Execute Phase 3:** Create dashboard
4. **Execute Phase 4:** Deploy TTS API
5. **Execute Phase 5:** Update database
6. **Execute Phase 6:** Test everything
7. **Execute Phase 7:** Deploy & document

---

**Status:** ✅ Plan Complete - Ready for Execution  
**Next Action:** Execute Phase 1 (Supabase Auth Setup)

