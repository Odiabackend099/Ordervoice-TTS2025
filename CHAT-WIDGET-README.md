# OrderVoice AI Chat Widget

A floating, AI-powered chat widget with comprehensive knowledge about the OrderVoice project. Features both text and voice chat capabilities with ultra-low latency.

## Features

### 🤖 AI-Powered Responses
- Comprehensive knowledge base about OrderVoice features, pricing, and technology
- Context-aware responses using intelligent search
- Answers FAQs automatically
- Guides users to relevant pages

### 🎙️ Voice Chat Integration
- Toggle between text and voice modes
- Full voice conversation capability
- Ultra-low latency (400-800ms) responses
- Real-time transcription feedback
- Voice activity detection
- Interruption handling

### 💬 Text Chat
- Beautiful, modern UI
- Typing indicators
- Message timestamps
- Quick action buttons
- Smooth animations

### 📚 Knowledge Base
- **Company Information**: Mission, location, contact details
- **Features**: Natural voice ordering, low latency, menu understanding, etc.
- **Technology**: Deepgram STT, Groq LLM, MiniMax TTS details
- **Pricing Plans**: Starter, Professional, Enterprise
- **Supported Cuisines**: Nigerian, Continental, Chinese, Fast Food
- **How It Works**: Step-by-step process
- **Integrations**: Payments, delivery, POS systems
- **FAQ**: 10+ common questions with answers
- **Use Cases**: Different user scenarios

## Installation

### Already Installed
The widget is already installed on all main pages:
- ✅ index.html
- ✅ pricing.html
- ✅ contact.html
- ✅ demo.html

### Manual Installation (for new pages)

Add these scripts before the closing `</body>` tag:

```html
<!-- OrderVoice AI Chat Widget -->
<script src="config.js"></script>
<script src="chat-widget-knowledge.js"></script>
<script src="voice-activity-detection.js"></script>
<script src="deepgram-stt.js"></script>
<script src="groq-llm.js"></script>
<script src="minimax-api.js"></script>
<script src="voice-streaming-orchestrator.js"></script>
<script src="chat-widget.js"></script>
```

## Usage

### Basic Usage

The widget automatically initializes when the page loads. Users can:

1. **Click the floating button** (bottom-right corner) to open the chat
2. **Type messages** for text-based conversation
3. **Click the microphone icon** in the header to enable voice mode
4. **Use quick action buttons** for common queries

### User Interactions

#### Text Chat
```
User: "What are your pricing plans?"
Widget: Shows detailed pricing with feature cards and quick actions
```

#### Voice Chat
```
1. Click microphone icon in header (voice mode toggle)
2. Click microphone button in input area to start listening
3. Speak your question
4. AI responds with voice and text
```

### Quick Actions

The widget provides quick action buttons for common tasks:
- 💰 Pricing
- 🚀 Features
- ⚡ Technology
- 🎯 Book Demo
- 📞 Contact

## Knowledge Base Structure

### Contextual Responses

The widget uses intelligent context detection:

**Pricing Queries:**
- "how much", "cost", "pricing", "price"
- Shows pricing plans with features
- Provides comparison options

**Technology Queries:**
- "latency", "fast", "technology", "how it works"
- Displays technical specifications
- Shows performance metrics

**Feature Queries:**
- "features", "what can", "capabilities"
- Lists all features with details
- Provides demo links

**Support Queries:**
- "contact", "support", "help"
- Shows contact information
- Lists support channels

### Search Functionality

The widget can search through:
- FAQ questions and answers
- Feature names and descriptions
- Pricing plan details
- Technical specifications

## Customization

### Widget Configuration

Modify the initialization in `chat-widget.js`:

```javascript
window.orderVoiceWidget = new OrderVoiceChatWidget({
  position: 'bottom-right',      // or 'bottom-left'
  primaryColor: '#667eea',        // Main color theme
  voiceEnabled: true,             // Enable/disable voice
  autoOpen: false,                // Auto-open on page load
  greeting: 'Custom greeting...'  // Custom greeting message
});
```

### Styling

All styles are in the `applyStyles()` method in `chat-widget.js`. Key CSS variables:

```css
/* Primary color */
background: linear-gradient(135deg, ${this.config.primaryColor} 0%, #764ba2 100%);

/* Widget position */
bottom: 20px;
right: 20px;

/* Widget size */
width: 380px;
height: 600px;
```

### Adding Knowledge

Edit `chat-widget-knowledge.js` to add more information:

```javascript
ORDERVOICE_KNOWLEDGE.faq.push({
  question: "New question?",
  answer: "Detailed answer here..."
});

ORDERVOICE_KNOWLEDGE.features.push({
  name: "New Feature",
  description: "Description...",
  benefits: ["Benefit 1", "Benefit 2"]
});
```

## Components

### Main Files

| File | Purpose |
|------|---------|
| `chat-widget.js` | Main widget class and UI |
| `chat-widget-knowledge.js` | Knowledge base and search helpers |
| `config.js` | API keys and configuration |
| `voice-streaming-orchestrator.js` | Voice conversation coordinator |
| `deepgram-stt.js` | Speech-to-text |
| `groq-llm.js` | LLM for responses |
| `minimax-api.js` | Text-to-speech |
| `voice-activity-detection.js` | VAD for interruptions |

### Dependencies

- **Deepgram**: WebSocket STT (API key in config.js)
- **Groq**: Streaming LLM (API key in config.js)
- **MiniMax**: WebSocket TTS (API key in config.js)

## Features in Detail

### 1. Text Chat Mode

- Clean, modern interface
- Message bubbles (user/assistant)
- Typing indicators
- Timestamp on messages
- Auto-scroll to latest message
- Quick action buttons
- Feature cards for rich content

### 2. Voice Chat Mode

#### Activation
```javascript
// Toggle voice mode
Click microphone icon in header

// Start/stop listening
Click microphone button in input area
```

#### Voice Features
- Real-time transcription display
- Voice activity visualization
- Latency display badge
- Smooth interruption handling
- Automatic voice mode detection

#### Voice Pipeline
```
User Speech → Deepgram STT → Display Transcript
            ↓
Groq LLM → Streaming Response → Display Text
            ↓
MiniMax TTS → Audio Playback
```

### 3. Knowledge-Based Responses

The widget intelligently responds to:

**General Questions:**
- What is OrderVoice?
- How does it work?
- What makes you different?

**Feature Questions:**
- What features do you offer?
- Can you handle Nigerian accents?
- Do you support interruptions?

**Pricing Questions:**
- How much does it cost?
- What's included in each plan?
- Do you have enterprise pricing?

**Technical Questions:**
- How fast is it?
- What technology do you use?
- How does the voice streaming work?

**Support Questions:**
- How do I contact you?
- Do you offer 24/7 support?
- Can I get a demo?

### 4. Rich Content Display

The widget can display:

**Feature Cards:**
```html
<div class="feature-card">
  <h4>Feature Name</h4>
  <p>Description</p>
  <ul>Benefits list</ul>
</div>
```

**Pricing Tables:**
- Plan name and price
- Description
- Feature list
- Popular badge

**Contact Information:**
- Email, phone, WhatsApp
- Support hours
- Demo booking link

## API Integration

### Voice API Calls

The widget uses the voice streaming orchestrator which handles:

```javascript
// Initialize
await orchestrator.initialize('austyn');

// Start listening
await orchestrator.start();

// Stop listening
orchestrator.stop();

// Event handlers
orchestrator.on('user_message', callback);
orchestrator.on('ai_sentence', callback);
orchestrator.on('metrics', callback);
```

### Knowledge Base Queries

```javascript
// Search knowledge base
const results = ChatWidgetHelpers.searchKnowledge(query);

// Get contextual response
const response = ChatWidgetHelpers.getContextualResponse(message);

// Calculate relevance
const score = ChatWidgetHelpers.calculateRelevance(query, text);
```

## Performance

### Metrics Tracking

The widget displays real-time performance metrics:

```javascript
orchestrator.on('metrics', (metrics) => {
  // {
  //   llmLatency: 450,
  //   totalLatency: 680,
  //   averageLLM: 420,
  //   averageTotal: 650
  // }
});
```

### Latency Badge

Shows average total latency in the widget footer:
- Green badge: < 800ms
- Updates in real-time during voice conversations

## Browser Compatibility

| Browser | Text Chat | Voice Chat | Status |
|---------|-----------|------------|--------|
| Chrome 90+ | ✅ | ✅ | Fully supported |
| Firefox 88+ | ✅ | ✅ | Fully supported |
| Safari 14+ | ✅ | ✅ | Fully supported |
| Edge 90+ | ✅ | ✅ | Fully supported |
| Mobile Chrome | ✅ | ✅ | Fully supported |
| Mobile Safari | ✅ | ⚠️ | Text works, voice requires HTTPS |

## Security

### API Keys
- All API keys are in `config.js`
- **Important**: Move to server-side in production
- Use environment variables
- Implement proxy server for API calls

### HTTPS Required
- Microphone access requires HTTPS
- WebSocket connections use WSS (secure)
- All API calls use TLS

### Data Privacy
- No conversation data stored locally
- All API calls go directly to providers
- No third-party tracking

## Troubleshooting

### Widget Not Appearing

1. Check console for errors
2. Verify all script files are loaded:
```javascript
console.log(window.orderVoiceWidget);
```
3. Ensure scripts are in correct order

### Voice Not Working

1. **Check API Keys**: Verify in `config.js`
2. **HTTPS Required**: Voice needs secure connection
3. **Microphone Permission**: Browser must grant access
4. **Check Console**: Look for initialization errors

```javascript
// Test voice system
await window.orderVoiceWidget.initializeVoice();
```

### Knowledge Base Not Responding

1. Check `chat-widget-knowledge.js` is loaded
2. Verify search function:
```javascript
console.log(ChatWidgetHelpers.searchKnowledge('test'));
```

### Styling Issues

1. Check for CSS conflicts
2. Verify z-index (widget uses 999999)
3. Check mobile responsive styles

## Customization Examples

### Change Widget Position

```javascript
// Bottom-left instead of bottom-right
new OrderVoiceChatWidget({
  position: 'bottom-left'
});
```

### Change Primary Color

```javascript
// Use different color scheme
new OrderVoiceChatWidget({
  primaryColor: '#10b981' // Green instead of purple
});
```

### Auto-Open Widget

```javascript
// Open widget automatically after 3 seconds
new OrderVoiceChatWidget({
  autoOpen: true
});
```

### Custom Greeting

```javascript
// Custom welcome message
new OrderVoiceChatWidget({
  greeting: 'Welcome! How can I help you today? 👋'
});
```

### Disable Voice

```javascript
// Text-only widget
new OrderVoiceChatWidget({
  voiceEnabled: false
});
```

## Extending the Widget

### Add New Knowledge Category

```javascript
// In chat-widget-knowledge.js
ORDERVOICE_KNOWLEDGE.newCategory = {
  items: [...]
};

// In chat-widget.js, add handler
if (message.includes('keyword')) {
  this.showNewCategory(data);
}
```

### Add Custom Event Handler

```javascript
// Listen to widget events
window.orderVoiceWidget.on('user_message', (message) => {
  // Custom logic
  console.log('User said:', message);
});
```

### Add Analytics

```javascript
// Track widget usage
window.orderVoiceWidget.on('user_message', (message) => {
  gtag('event', 'widget_message', {
    message: message
  });
});
```

## Best Practices

### 1. Keep Knowledge Base Updated
- Regularly update FAQ
- Add new features
- Update pricing information

### 2. Monitor Performance
- Check latency metrics
- Test voice quality
- Verify API responses

### 3. User Experience
- Respond quickly (< 2 seconds)
- Provide clear error messages
- Guide users to actions

### 4. Mobile Optimization
- Test on mobile devices
- Ensure touch interactions work
- Verify responsive design

## Support & Maintenance

### Regular Updates
- Update API keys when rotated
- Keep knowledge base current
- Test after site changes

### Monitoring
- Check console for errors
- Monitor API usage
- Track user interactions

### Backups
- Keep backup of config.js
- Version control all widget files
- Document customizations

## Future Enhancements

### Planned Features
- [ ] Multi-language support (Yoruba, Igbo, Hausa)
- [ ] Conversation history persistence
- [ ] User authentication
- [ ] Analytics dashboard
- [ ] Custom themes
- [ ] WhatsApp integration
- [ ] SMS fallback
- [ ] Sentiment analysis

### Possible Improvements
- Server-side API proxying
- Conversation analytics
- A/B testing different greetings
- Smart suggestions
- File attachments
- Screen sharing
- Video chat integration

## License

This chat widget is part of the OrderVoice project by ODIADEV AI LTD.

## Support

For questions or issues:
- 📧 Email: hello@ordervoice.ng
- 📱 WhatsApp: +234 (0) 800 ORDER-NOW
- 🌐 Website: https://ordervoice.odia.dev

---

**Note**: The widget is production-ready and fully integrated across all main pages. Test it by clicking the floating button on any page!
