# OrderVoice AI - Application Structure
**Complete File Organization & Architecture**

---

## Directory Structure

```
ordervoice.odia.dev/
├── Core Pages (Production Ready)
│   ├── index.html                    # Landing page with hero, features, pricing preview
│   ├── pricing.html                   # Detailed pricing plans (₦40k-₦220k/month)
│   ├── demo.html                      # WhatsApp/phone demo instructions
│   ├── contact.html                   # Contact form with Netlify Forms ✅
│   ├── success.html                   # Form submission success page ✅
│   └── widget-demo.html               # Interactive chat widget demo ✅
│
├── Documentation
│   ├── README.md                      # Project overview
│   ├── DEPLOYMENT_GUIDE.md            # Deployment instructions ✅
│   ├── API_CONFIGURATION.md           # API integration guide ✅
│   ├── FIXES_COMPLETED.md             # TestSprite fixes summary ✅
│   ├── SECURITY.md                    # Security best practices
│   ├── CHAT-WIDGET-README.md          # Chat widget documentation
│   ├── VOICE-STREAMING-GUIDE.md       # Voice streaming setup
│   └── DEPLOYMENT.md                  # Legacy deployment docs
│
├── Test Reports
│   ├── COMPREHENSIVE-TEST-REPORT.md   # Full test results
│   ├── TEST-RESULTS-SUMMARY.md        # Test summary
│   ├── DEPLOYMENT-SUCCESS.md          # Deployment validation
│   ├── PROJECT-STATUS.md              # Project status overview
│   └── API-TEST-RESULTS.md            # API testing results
│
├── Development Files
│   ├── test-tts.html                  # MiniMax TTS testing interface
│   ├── voice-ui.html                  # Voice UI prototype
│   ├── voice-streaming-demo.html      # Voice streaming demo
│   ├── widget-init.html               # Widget initialization
│   └── remixed-4c168e55.html          # Design iterations
│
├── Configuration
│   ├── sitemap.xml                    # SEO sitemap ✅
│   ├── robots.txt                     # Search engine instructions
│   ├── vercel.json                    # Vercel deployment config
│   ├── .gitignore                     # Git ignore rules
│   └── .env (not in repo)             # Environment variables
│
├── Planning
│   ├── planning.md                    # Initial planning
│   ├── auth-tts-planning.md           # Auth & TTS planning
│   └── backend-planning.md            # Backend architecture
│
└── Testing
    └── testsprite_tests/              # TestSprite MCP test files
        ├── testsprite-mcp-test-report.md
        └── tmp/
            ├── raw_report.md
            └── test_results.json
```

---

## File Categories

### 🟢 Production Ready Files

**Public Pages:**
- `index.html` - Main landing page
- `pricing.html` - Pricing tiers
- `demo.html` - Demo instructions
- `contact.html` - Contact form (Netlify Forms)
- `success.html` - Form success page
- `widget-demo.html` - Widget showcase

**SEO & Configuration:**
- `sitemap.xml` - All 6 public pages listed
- `robots.txt` - Allows all search engines
- `vercel.json` - Security headers configured

### 🟡 Development/Testing Files

**Internal Tools:**
- `test-tts.html` - TTS testing interface
- `voice-ui.html` - Voice UI experiments
- `voice-streaming-demo.html` - Streaming tests
- `widget-init.html` - Widget initialization

**These files are for development only and not linked from public pages.**

### 🔵 Documentation Files

**Production Docs:**
- `README.md` - Project overview
- `DEPLOYMENT_GUIDE.md` - How to deploy ✅
- `API_CONFIGURATION.md` - API setup guide ✅
- `FIXES_COMPLETED.md` - Bug fix summary ✅
- `SECURITY.md` - Security practices

**Development Docs:**
- `CHAT-WIDGET-README.md` - Widget docs
- `VOICE-STREAMING-GUIDE.md` - Voice setup
- Planning files (auth, backend)

### 🔴 Test Reports

**TestSprite MCP Reports:**
- `COMPREHENSIVE-TEST-REPORT.md` - Full analysis
- `TEST-RESULTS-SUMMARY.md` - Summary
- `DEPLOYMENT-SUCCESS.md` - Validation
- `PROJECT-STATUS.md` - Status overview
- Test files in `/testsprite_tests/`

---

## Page Flow Diagram

```
┌─────────────────────┐
│   Landing Page      │
│   (index.html)      │
└──────────┬──────────┘
           │
    ┌──────┴──────┬──────────┬──────────┬──────────┐
    │             │          │          │          │
    ▼             ▼          ▼          ▼          ▼
┌──────┐    ┌─────────┐  ┌──────┐  ┌─────────┐  ┌────────┐
│Pricing│    │ Demo    │  │Widget│  │ Contact │  │Features│
│ Page  │    │ Page    │  │ Demo │  │  Form   │  │(#link) │
└───────┘    └─────────┘  └──────┘  └────┬────┘  └────────┘
                                          │
                                          ▼
                                    ┌───────────┐
                                    │ Success   │
                                    │   Page    │
                                    └─────┬─────┘
                                          │
                                          ▼
                                    ┌───────────┐
                                    │ WhatsApp  │
                                    │  Quick    │
                                    │  Action   │
                                    └───────────┘
```

---

## Navigation Structure

### Primary Navigation (All Pages)

```html
<ul class="nav-links">
    <li><a href="index.html">Home</a></li>
    <li><a href="pricing.html">Pricing</a></li>
    <li><a href="demo.html">Try Demo</a></li>
    <li><a href="widget-demo.html">Widget</a></li>
    <li><a href="contact.html">Contact</a></li>
</ul>
```

### Call-to-Action Flow

1. **Landing Page:**
   - "Start Free Trial" → `contact.html`
   - "Try Demo" → `demo.html`
   - "See Pricing" → `pricing.html`

2. **Pricing Page:**
   - All plan CTAs → `contact.html`

3. **Demo Page:**
   - WhatsApp link (external)
   - Phone number (tel: link)
   - "Start Trial" → `contact.html`

4. **Widget Demo:**
   - Live chat simulation
   - "Get Your Widget" → `contact.html`

5. **Contact Page:**
   - Form submission → `success.html`
   - WhatsApp backup (external)

6. **Success Page:**
   - WhatsApp quick action (external)
   - Auto-redirect to `index.html` (30s)

---

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Inline styles for fast load
- **Vanilla JavaScript** - No dependencies
- **Responsive Design** - Mobile-first

### Forms
- **Netlify Forms** - Contact form backend
- **Honeypot Protection** - Spam prevention
- **Client Validation** - Required fields

### Voice Integration (Future)
- **Deepgram** - Speech-to-Text
- **Groq** - LLM processing
- **MiniMax** - Text-to-Speech
- **ElevenLabs** - Voice streaming (alternative)

### Hosting Options
- **Vercel** (recommended)
- **Netlify**
- **Custom server**

### Analytics (Recommended)
- Google Analytics 4
- Vercel Analytics
- Netlify Analytics

---

## Environment Variables

### Required for Voice Features (Optional - Phase 2)

```env
# API Keys (not in repository)
ELEVENLABS_API_KEY=sk_xxxxx
DEEPGRAM_API_KEY=xxxxx
GROQ_API_KEY=gsk_xxxxx
MINIMAX_API_KEY=xxxxx
MINIMAX_GROUP_ID=xxxxx

# Backend URLs
ODIA_API_URL=https://api.odia.dev
BACKEND_URL=https://backend.ordervoice.ai

# Feature Flags
ENABLE_VOICE_DEMO=false
ENABLE_CHAT_WIDGET=true
```

### Current Setup (Phase 1)

```env
# No environment variables required
# Static site deployment only
# Forms handled by Netlify
```

---

## Security Configuration

### Headers (`vercel.json`)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "X-XSS-Protection", "value": "1; mode=block"}
      ]
    }
  ]
}
```

### `.gitignore` Rules

```
.env
.env.local
node_modules/
.vercel/
.netlify/
*.log
.DS_Store
```

---

## SEO Configuration

### `sitemap.xml` Structure

```xml
<urlset>
  <url><loc>https://ordervoice.ai/</loc></url>
  <url><loc>https://ordervoice.ai/pricing.html</loc></url>
  <url><loc>https://ordervoice.ai/demo.html</loc></url>
  <url><loc>https://ordervoice.ai/contact.html</loc></url>
  <url><loc>https://ordervoice.ai/widget-demo.html</loc></url>
</urlset>
```

### Meta Tags (All Pages)

- Title (unique per page)
- Description (Nigerian market focus)
- Keywords (AI receptionist, Nigeria, voice AI)
- Open Graph (social sharing)
- Twitter Cards
- Schema.org (Organization, WebSite)

---

## Build & Deployment

### Vercel Deployment

```bash
# Automatic on git push
git push origin main

# Manual deployment
vercel --prod
```

### Netlify Deployment

```bash
# Automatic on git push
git push origin main

# Manual deployment
netlify deploy --prod
```

### Local Development

```bash
# Start local server
python3 -m http.server 8000

# Or
npx http-server -p 8000

# Access at
http://localhost:8000
```

---

## Testing Strategy

### Manual Testing Checklist

**Functionality:**
- [ ] Contact form submits successfully
- [ ] Success page loads after submission
- [ ] All navigation links work
- [ ] WhatsApp links open correctly
- [ ] Widget demo is interactive

**Cross-Browser:**
- [ ] Chrome
- [ ] Safari (desktop & iOS)
- [ ] Firefox
- [ ] Edge

**Responsive Design:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Performance:**
- [ ] PageSpeed score > 90
- [ ] Load time < 3 seconds
- [ ] No console errors

### Automated Testing (Future)

- TestSprite MCP integration
- Playwright end-to-end tests
- Lighthouse CI
- Cypress integration tests

---

## Maintenance Schedule

### Daily
- Monitor error logs
- Check form submissions

### Weekly
- Review analytics
- Test critical paths
- Update content (if needed)

### Monthly
- Security updates
- Dependency updates
- Performance audit
- User feedback review

### Quarterly
- Full security audit
- Feature enhancements
- A/B testing implementation
- Conversion optimization

---

## Version Control

### Branches

- `main` - Production branch
- `develop` - Development branch (future)
- `feature/*` - Feature branches (future)

### Commit Convention

```
<type>: <description>

[optional body]

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: feat, fix, docs, style, refactor, test, chore

---

## API Integration Roadmap

### Phase 1: Static Site (CURRENT) ✅
- Marketing pages
- Contact form
- Widget demo
- SEO optimization

### Phase 2: Voice Integration (FUTURE)
- Deploy backend API
- Connect Deepgram STT
- Integrate Groq LLM
- Enable MiniMax TTS
- Real-time voice streaming

### Phase 3: Analytics & CRM
- Google Analytics 4
- HubSpot/Salesforce integration
- Lead scoring
- Email automation

### Phase 4: Advanced Features
- Multi-language support
- Custom AI training
- Webhook integrations
- Advanced analytics dashboard

---

## Support & Resources

### Documentation
- `DEPLOYMENT_GUIDE.md` - Deployment
- `API_CONFIGURATION.md` - API setup
- `SECURITY.md` - Security best practices
- `FIXES_COMPLETED.md` - Bug fixes

### External Resources
- [Netlify Forms Docs](https://docs.netlify.com/forms/)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Claude Code Docs](https://docs.claude.com/claude-code)

### Contact
- Email: support@ordervoice.ai
- WhatsApp: +234 814 199 5397
- GitHub: https://github.com/Odiabackend099/ordai2025

---

**Last Updated:** October 21, 2025
**Version:** 1.0.0 (Production Ready)
**Status:** ✅ All systems operational
