# 🔒 Security & API Keys Setup

## ⚠️ IMPORTANT: Never Commit API Keys!

This project uses sensitive API keys that should NEVER be committed to GitHub.

---

## 🔑 Setting Up Your API Keys

### Step 1: Create a `.env` file (Local Development)

```bash
cp .env.example .env
```

Then edit `.env` with your actual API keys:

```env
# Your actual keys here
DEEPGRAM_API_KEY=your_actual_deepgram_key
GROQ_API_KEY=your_actual_groq_key  
MINIMAX_API_KEY=your_actual_minimax_key
MINIMAX_GROUP_ID=your_actual_group_id
```

**The `.env` file is already in `.gitignore` and will NOT be committed.**

---

## 🌐 Production Deployment (Vercel)

### Add Environment Variables in Vercel Dashboard:

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:

```
DEEPGRAM_API_KEY = [your key]
GROQ_API_KEY = [your key]
MINIMAX_API_KEY = [your key]
MINIMAX_GROUP_ID = [your id]
```

4. Redeploy your site

---

## 📋 Get Your API Keys

### Deepgram (Speech-to-Text)
- Website: https://deepgram.com
- Free tier: 45,000 minutes/month
- Docs: https://developers.deepgram.com

### Groq (LLM - AI Responses)
- Website: https://groq.com
- Free tier: Available
- Docs: https://console.groq.com/docs

### MiniMax (Text-to-Speech)
- Website: https://minimax.chat
- Sign up and get API credentials
- Docs: https://api.minimax.chat/document

---

## 🚨 If You Accidentally Committed Keys

If you accidentally committed API keys to GitHub:

1. **Immediately rotate/regenerate all exposed keys** in their respective dashboards
2. Remove from git history:
   ```bash
   git reset HEAD~1
   # Edit files to remove keys
   git add .
   git commit -m "Secure API keys"
   git push --force
   ```

---

## ✅ Best Practices

- ✅ Always use environment variables for sensitive data
- ✅ Never hardcode API keys in source code
- ✅ Add `.env` to `.gitignore`
- ✅ Use `.env.example` as template (no real keys)
- ✅ Rotate keys if they're ever exposed
- ✅ Use different keys for development and production

---

## 🔍 Current Setup

This project now uses:
- `config.js` - References environment variables
- `.env.example` - Template (committed to git, no real keys)
- `.env` - Your actual keys (NOT committed, gitignored)
- `.gitignore` - Blocks `.env` from being committed

**You're safe!** 🎉

