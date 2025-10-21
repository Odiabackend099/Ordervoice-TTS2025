/**
 * OrderVoice AI-Powered Floating Chat Widget
 * Features: Voice chat, text chat, knowledge base integration
 */

class OrderVoiceChatWidget {
  constructor(config = {}) {
    this.config = {
      position: config.position || 'bottom-right',
      primaryColor: config.primaryColor || '#667eea',
      voiceEnabled: config.voiceEnabled !== false,
      autoOpen: config.autoOpen || false,
      greeting: config.greeting || "Hi! 👋 I'm your OrderVoice AI assistant. Ask me anything about voice ordering for your restaurant!",
      ...config
    };

    this.isOpen = false;
    this.isVoiceActive = false;
    this.orchestrator = null;
    this.conversationHistory = [];
    this.widget = null;
    this.currentMode = 'text'; // 'text' or 'voice'
  }

  /**
   * Initialize and render the widget
   */
  init() {
    // Create widget HTML
    this.createWidget();

    // Attach to DOM
    document.body.appendChild(this.widget);

    // Set up event listeners
    this.setupEventListeners();

    // Auto-open if configured
    if (this.config.autoOpen) {
      setTimeout(() => this.open(), 1000);
    }

    // Show greeting after short delay
    setTimeout(() => {
      this.addMessage('assistant', this.config.greeting);
      this.showQuickActions();
    }, 500);

    console.log('[ChatWidget] Initialized successfully');
  }

  /**
   * Create widget HTML structure
   */
  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'ordervoice-chat-widget';
    widget.innerHTML = `
      <!-- Widget Button -->
      <div class="chat-widget-button" id="chatWidgetButton">
        <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span class="notification-badge">1</span>
      </div>

      <!-- Chat Window -->
      <div class="chat-widget-window" id="chatWidgetWindow">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-content">
            <div class="header-avatar">🤖</div>
            <div class="header-info">
              <div class="header-title">OrderVoice AI</div>
              <div class="header-status">
                <span class="status-dot"></span>
                <span class="status-text">Online</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button class="header-action-btn" id="voiceToggle" title="Toggle Voice Mode">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
            <button class="header-action-btn" id="minimizeBtn" title="Minimize">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="chat-messages" id="chatMessages">
          <!-- Messages will be added here -->
        </div>

        <!-- Voice Mode Indicator -->
        <div class="voice-mode-indicator" id="voiceModeIndicator" style="display: none;">
          <div class="voice-animation">
            <div class="voice-wave"></div>
            <div class="voice-wave"></div>
            <div class="voice-wave"></div>
          </div>
          <div class="voice-status-text">Listening...</div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions" id="quickActions">
          <!-- Quick action buttons will be added here -->
        </div>

        <!-- Input Area -->
        <div class="chat-input-area">
          <button class="voice-input-btn" id="voiceInputBtn" title="Voice Input">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2"></line>
              <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2"></line>
            </svg>
          </button>
          <input
            type="text"
            class="chat-input"
            id="chatInput"
            placeholder="Type your message..."
            autocomplete="off"
          />
          <button class="send-btn" id="sendBtn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </div>

        <!-- Powered By -->
        <div class="chat-footer">
          <span>Powered by</span>
          <strong>OrderVoice AI</strong>
          <span class="latency-badge" id="latencyBadge"></span>
        </div>
      </div>
    `;

    this.widget = widget;
    this.applyStyles();
  }

  /**
   * Apply CSS styles
   */
  applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .ordervoice-chat-widget {
        position: fixed;
        ${this.config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : ''}
        ${this.config.position === 'bottom-left' ? 'bottom: 20px; left: 20px;' : ''}
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      }

      .chat-widget-button {
        width: 60px;
        height: 60px;
        border-radius: 30px;
        background: linear-gradient(135deg, ${this.config.primaryColor} 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        position: relative;
      }

      .chat-widget-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(0,0,0,0.4);
      }

      .chat-widget-button svg {
        width: 28px;
        height: 28px;
        transition: all 0.3s ease;
      }

      .chat-icon {
        display: block;
      }

      .close-icon {
        display: none;
      }

      .ordervoice-chat-widget.open .chat-icon {
        display: none;
      }

      .ordervoice-chat-widget.open .close-icon {
        display: block;
      }

      .notification-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ef4444;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        border: 2px solid white;
        animation: pulse 2s infinite;
      }

      .notification-badge.hidden {
        display: none;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .chat-widget-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        max-width: calc(100vw - 40px);
        height: 600px;
        max-height: calc(100vh - 120px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        transform: scale(0.8) translateY(20px);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
      }

      .ordervoice-chat-widget.open .chat-widget-window {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: all;
      }

      .chat-header {
        background: linear-gradient(135deg, ${this.config.primaryColor} 0%, #764ba2 100%);
        color: white;
        padding: 16px;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-avatar {
        width: 40px;
        height: 40px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .header-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .header-title {
        font-weight: 600;
        font-size: 16px;
      }

      .header-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        opacity: 0.9;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        background: #4ade80;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .header-action-btn {
        width: 32px;
        height: 32px;
        background: rgba(255,255,255,0.2);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .header-action-btn:hover {
        background: rgba(255,255,255,0.3);
      }

      .header-action-btn svg {
        width: 16px;
        height: 16px;
      }

      .header-action-btn.active {
        background: rgba(255,255,255,0.4);
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f7fafc;
      }

      .chat-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: #cbd5e0;
        border-radius: 3px;
      }

      .chat-message {
        display: flex;
        gap: 8px;
        animation: messageSlideIn 0.3s ease;
      }

      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 16px;
      }

      .message-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .message-bubble {
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 100%;
        word-wrap: break-word;
        line-height: 1.5;
      }

      .chat-message.assistant .message-avatar {
        background: linear-gradient(135deg, ${this.config.primaryColor} 0%, #764ba2 100%);
        color: white;
      }

      .chat-message.assistant .message-bubble {
        background: white;
        color: #2d3748;
        border: 1px solid #e2e8f0;
      }

      .chat-message.user {
        flex-direction: row-reverse;
      }

      .chat-message.user .message-content {
        align-items: flex-end;
      }

      .chat-message.user .message-avatar {
        background: #e2e8f0;
      }

      .chat-message.user .message-bubble {
        background: linear-gradient(135deg, ${this.config.primaryColor} 0%, #764ba2 100%);
        color: white;
      }

      .message-time {
        font-size: 11px;
        color: #718096;
        padding: 0 4px;
      }

      .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }

      .typing-dot {
        width: 8px;
        height: 8px;
        background: #cbd5e0;
        border-radius: 50%;
        animation: typingBounce 1.4s infinite;
      }

      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
      }

      .voice-mode-indicator {
        padding: 16px;
        background: linear-gradient(135deg, ${this.config.primaryColor}20 0%, #764ba240 100%);
        display: flex;
        align-items: center;
        gap: 12px;
        border-top: 1px solid #e2e8f0;
      }

      .voice-animation {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .voice-wave {
        width: 4px;
        background: ${this.config.primaryColor};
        border-radius: 2px;
        animation: voiceWave 1s infinite ease-in-out;
      }

      .voice-wave:nth-child(1) {
        height: 20px;
        animation-delay: 0s;
      }

      .voice-wave:nth-child(2) {
        height: 30px;
        animation-delay: 0.1s;
      }

      .voice-wave:nth-child(3) {
        height: 25px;
        animation-delay: 0.2s;
      }

      @keyframes voiceWave {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(1.5); }
      }

      .voice-status-text {
        flex: 1;
        color: ${this.config.primaryColor};
        font-weight: 600;
      }

      .quick-actions {
        padding: 12px 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        border-top: 1px solid #e2e8f0;
        background: white;
      }

      .quick-action-btn {
        padding: 8px 16px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        color: #4a5568;
        white-space: nowrap;
      }

      .quick-action-btn:hover {
        background: ${this.config.primaryColor};
        color: white;
        border-color: ${this.config.primaryColor};
        transform: translateY(-1px);
      }

      .chat-input-area {
        padding: 16px;
        background: white;
        border-radius: 0 0 16px 16px;
        display: flex;
        gap: 8px;
        border-top: 1px solid #e2e8f0;
      }

      .voice-input-btn {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, ${this.config.primaryColor} 0%, #764ba2 100%);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .voice-input-btn:hover {
        transform: scale(1.1);
      }

      .voice-input-btn.active {
        animation: pulse 1s infinite;
      }

      .voice-input-btn svg {
        width: 20px;
        height: 20px;
      }

      .chat-input {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        font-size: 14px;
        outline: none;
        transition: all 0.2s;
      }

      .chat-input:focus {
        border-color: ${this.config.primaryColor};
        box-shadow: 0 0 0 3px ${this.config.primaryColor}20;
      }

      .send-btn {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, ${this.config.primaryColor} 0%, #764ba2 100%);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .send-btn:hover {
        transform: scale(1.1);
      }

      .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .send-btn svg {
        width: 20px;
        height: 20px;
      }

      .chat-footer {
        padding: 12px 16px;
        background: #f7fafc;
        border-radius: 0 0 16px 16px;
        text-align: center;
        font-size: 12px;
        color: #718096;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .chat-footer strong {
        color: ${this.config.primaryColor};
      }

      .latency-badge {
        padding: 2px 8px;
        background: #4ade80;
        color: white;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
        margin-left: 8px;
      }

      /* Mobile Responsive */
      @media (max-width: 480px) {
        .chat-widget-window {
          width: calc(100vw - 20px);
          height: calc(100vh - 100px);
          bottom: 70px;
          right: 10px;
        }

        .ordervoice-chat-widget {
          bottom: 10px;
          right: 10px;
        }
      }

      /* Feature Cards in Messages */
      .feature-card {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        margin-top: 8px;
      }

      .feature-card h4 {
        margin: 0 0 8px 0;
        color: ${this.config.primaryColor};
        font-size: 14px;
      }

      .feature-card p {
        margin: 0;
        font-size: 13px;
        color: #4a5568;
        line-height: 1.5;
      }

      .feature-card ul {
        margin: 8px 0 0 0;
        padding-left: 20px;
        font-size: 12px;
        color: #718096;
      }

      .feature-card ul li {
        margin: 4px 0;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    const button = this.widget.querySelector('#chatWidgetButton');
    const minimizeBtn = this.widget.querySelector('#minimizeBtn');
    const voiceToggle = this.widget.querySelector('#voiceToggle');
    const voiceInputBtn = this.widget.querySelector('#voiceInputBtn');
    const input = this.widget.querySelector('#chatInput');
    const sendBtn = this.widget.querySelector('#sendBtn');

    // Toggle widget
    button.addEventListener('click', () => this.toggle());
    minimizeBtn.addEventListener('click', () => this.close());

    // Voice mode toggle
    voiceToggle.addEventListener('click', () => this.toggleVoiceMode());

    // Voice input button
    voiceInputBtn.addEventListener('click', () => this.handleVoiceInput());

    // Send message
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Input changes
    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim();
    });
  }

  /**
   * Toggle widget open/close
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open widget
   */
  open() {
    this.isOpen = true;
    this.widget.classList.add('open');

    // Hide notification badge
    const badge = this.widget.querySelector('.notification-badge');
    badge.classList.add('hidden');

    // Focus input
    setTimeout(() => {
      this.widget.querySelector('#chatInput').focus();
    }, 300);
  }

  /**
   * Close widget
   */
  close() {
    this.isOpen = false;
    this.widget.classList.remove('open');

    // Stop voice if active
    if (this.isVoiceActive) {
      this.stopVoice();
    }
  }

  /**
   * Toggle voice mode
   */
  async toggleVoiceMode() {
    const voiceToggle = this.widget.querySelector('#voiceToggle');

    if (this.currentMode === 'text') {
      // Switch to voice mode
      this.currentMode = 'voice';
      voiceToggle.classList.add('active');
      await this.initializeVoice();
      this.addMessage('assistant', '🎙️ Voice mode activated! Click the microphone button to speak.');
    } else {
      // Switch to text mode
      this.currentMode = 'text';
      voiceToggle.classList.remove('active');
      this.stopVoice();
      this.addMessage('assistant', '⌨️ Text mode activated. Type your message below.');
    }
  }

  /**
   * Initialize voice system
   */
  async initializeVoice() {
    if (this.orchestrator) return;

    try {
      this.addMessage('assistant', 'Initializing voice system...');

      // Initialize orchestrator with config
      this.orchestrator = new VoiceStreamingOrchestrator(STREAMING_CONFIG);

      // Set up voice event listeners
      this.setupVoiceEventListeners();

      // Initialize
      await this.orchestrator.initialize('austyn');

      this.addMessage('assistant', '✅ Voice system ready! Start speaking when you\'re ready.');

    } catch (error) {
      console.error('[ChatWidget] Voice initialization error:', error);
      this.addMessage('assistant', `❌ Voice initialization failed: ${error.message}. Falling back to text mode.`);
      this.currentMode = 'text';
    }
  }

  /**
   * Setup voice event listeners
   */
  setupVoiceEventListeners() {
    if (!this.orchestrator) return;

    this.orchestrator.on('user_message', (text) => {
      this.addMessage('user', text);
    });

    this.orchestrator.on('ai_sentence', (sentence) => {
      this.appendAIMessage(sentence);
    });

    this.orchestrator.on('metrics', (metrics) => {
      this.updateLatencyBadge(metrics.averageTotal);
    });

    this.orchestrator.on('interim_transcript', (text) => {
      this.showTranscriptionFeedback(text);
    });
  }

  /**
   * Handle voice input
   */
  async handleVoiceInput() {
    const voiceInputBtn = this.widget.querySelector('#voiceInputBtn');
    const voiceModeIndicator = this.widget.querySelector('#voiceModeIndicator');

    if (!this.orchestrator) {
      await this.initializeVoice();
    }

    if (!this.isVoiceActive) {
      // Start listening
      try {
        await this.orchestrator.start();
        this.isVoiceActive = true;
        voiceInputBtn.classList.add('active');
        voiceModeIndicator.style.display = 'flex';
      } catch (error) {
        console.error('[ChatWidget] Voice start error:', error);
        this.addMessage('assistant', `❌ Could not start voice: ${error.message}`);
      }
    } else {
      // Stop listening
      this.stopVoice();
    }
  }

  /**
   * Stop voice
   */
  stopVoice() {
    if (this.orchestrator) {
      this.orchestrator.stop();
    }

    this.isVoiceActive = false;

    const voiceInputBtn = this.widget.querySelector('#voiceInputBtn');
    const voiceModeIndicator = this.widget.querySelector('#voiceModeIndicator');

    voiceInputBtn.classList.remove('active');
    voiceModeIndicator.style.display = 'none';
  }

  /**
   * Send text message
   */
  async sendMessage() {
    const input = this.widget.querySelector('#chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    this.addMessage('user', message);
    input.value = '';
    this.widget.querySelector('#sendBtn').disabled = true;

    // Show typing indicator
    this.showTyping();

    // Get AI response
    await this.getAIResponse(message);

    // Hide typing indicator
    this.hideTyping();
  }

  /**
   * Get AI response from knowledge base
   */
  async getAIResponse(userMessage) {
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get contextual response from knowledge base
    const contextResponse = ChatWidgetHelpers.getContextualResponse(userMessage);

    if (contextResponse) {
      this.handleContextualResponse(contextResponse);
    } else {
      // Fallback response
      this.addMessage('assistant',
        "I'd be happy to help! I can tell you about our features, pricing, technology, or answer any specific questions. What would you like to know?"
      );
      this.showQuickActions();
    }
  }

  /**
   * Handle contextual response
   */
  handleContextualResponse(response) {
    switch (response.type) {
      case 'pricing':
        this.showPricing(response.data);
        break;

      case 'technology':
        this.showTechnology(response.data);
        break;

      case 'features':
        this.showFeatures(response.data);
        break;

      case 'support':
        this.showSupport(response.data);
        break;

      case 'faq':
        this.addMessage('assistant', `**${response.data.question}**\n\n${response.data.answer}`);
        break;

      case 'feature':
        this.showFeatureDetail(response.data);
        break;

      default:
        this.addMessage('assistant', 'Let me help you with that information...');
        this.showQuickActions();
    }

    // Show related quick action
    if (response.quickAction) {
      this.showSingleQuickAction(response.quickAction);
    }
  }

  /**
   * Show pricing information
   */
  showPricing(plans) {
    this.addMessage('assistant', '💰 Here are our pricing plans:');

    plans.forEach(plan => {
      const features = plan.features.slice(0, 4).map(f => `• ${f}`).join('\n');
      const card = `
        <div class="feature-card">
          <h4>${plan.name} ${plan.popular ? '⭐ Popular' : ''} - ${plan.price}</h4>
          <p>${plan.description}</p>
          <ul>
            ${features}
          </ul>
        </div>
      `;
      this.addHTMLMessage('assistant', card);
    });

    this.addMessage('assistant', 'Would you like to see a detailed comparison or book a demo?');
  }

  /**
   * Show technology information
   */
  showTechnology(tech) {
    const message = `
🚀 **Our Ultra-Low Latency Technology:**

**Speech-to-Text:** ${tech.stt.provider} ${tech.stt.model}
⚡ Latency: ${tech.stt.latency}

**AI Brain:** ${tech.llm.provider} ${tech.llm.model}
⚡ Latency: ${tech.llm.latency}

**Text-to-Speech:** ${tech.tts.provider} ${tech.tts.model}
⚡ Latency: ${tech.tts.latency}

**Total Response Time:** ${tech.totalLatency} 🎯

This makes our system as fast as ChatGPT Voice and Vapi! Try our live demo to experience it yourself.
    `.trim();

    this.addMessage('assistant', message);
  }

  /**
   * Show features
   */
  showFeatures(features) {
    this.addMessage('assistant', '✨ Here are our key features:');

    features.slice(0, 3).forEach(feature => {
      const card = `
        <div class="feature-card">
          <h4>${feature.name}</h4>
          <p>${feature.description}</p>
        </div>
      `;
      this.addHTMLMessage('assistant', card);
    });

    this.addMessage('assistant', 'Want to learn more about any specific feature?');
  }

  /**
   * Show support information
   */
  showSupport(support) {
    const message = `
📞 **Contact & Support**

📧 Email: ${support.email}
📱 Phone/WhatsApp: ${support.phone}
⏰ Hours: ${support.hours}

🎯 Book a free demo: ${support.demo}

How can I help you today?
    `.trim();

    this.addMessage('assistant', message);
  }

  /**
   * Show feature detail
   */
  showFeatureDetail(feature) {
    const benefits = feature.benefits.map(b => `✓ ${b}`).join('\n');
    const message = `
**${feature.name}**

${feature.description}

**Benefits:**
${benefits}

Would you like to see this in action with a demo?
    `.trim();

    this.addMessage('assistant', message);
  }

  /**
   * Show quick actions
   */
  showQuickActions() {
    const quickActions = this.widget.querySelector('#quickActions');
    quickActions.innerHTML = '';

    const actions = [
      { text: '💰 Pricing', action: () => this.handleQuickAction('pricing') },
      { text: '🚀 Features', action: () => this.handleQuickAction('features') },
      { text: '⚡ Technology', action: () => this.handleQuickAction('technology') },
      { text: '🎯 Book Demo', action: () => this.handleQuickAction('demo') },
      { text: '📞 Contact', action: () => this.handleQuickAction('contact') }
    ];

    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.className = 'quick-action-btn';
      btn.textContent = action.text;
      btn.addEventListener('click', action.action);
      quickActions.appendChild(btn);
    });
  }

  /**
   * Show single quick action
   */
  showSingleQuickAction(actionKey) {
    const actions = {
      'tryDemo': { text: '🎯 Try Live Demo', url: 'voice-streaming-demo.html' },
      'seePricing': { text: '💰 View Pricing', url: 'pricing.html' },
      'bookDemo': { text: '📅 Book Demo', url: 'demo.html' },
      'contactSales': { text: '📞 Contact Sales', url: 'contact.html' }
    };

    const action = actions[actionKey];
    if (!action) return;

    const quickActions = this.widget.querySelector('#quickActions');
    quickActions.innerHTML = `
      <button class="quick-action-btn" onclick="window.location.href='${action.url}'">
        ${action.text}
      </button>
    `;
  }

  /**
   * Handle quick action
   */
  handleQuickAction(action) {
    const messages = {
      'pricing': 'Tell me about your pricing plans',
      'features': 'What features do you offer?',
      'technology': 'How does your technology work?',
      'demo': 'I want to book a demo',
      'contact': 'How can I contact you?'
    };

    const message = messages[action];
    if (message) {
      this.addMessage('user', message);
      this.getAIResponse(message);
    }
  }

  /**
   * Add message to chat
   */
  addMessage(role, text) {
    const messages = this.widget.querySelector('#chatMessages');
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    messageDiv.innerHTML = `
      <div class="message-avatar">${role === 'assistant' ? '🤖' : '👤'}</div>
      <div class="message-content">
        <div class="message-bubble">${this.formatMessage(text)}</div>
        <div class="message-time">${time}</div>
      </div>
    `;

    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;

    // Store in history
    this.conversationHistory.push({ role, text, time });
  }

  /**
   * Add HTML message
   */
  addHTMLMessage(role, html) {
    const messages = this.widget.querySelector('#chatMessages');
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    messageDiv.innerHTML = `
      <div class="message-avatar">${role === 'assistant' ? '🤖' : '👤'}</div>
      <div class="message-content">
        <div class="message-bubble">${html}</div>
        <div class="message-time">${time}</div>
      </div>
    `;

    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  /**
   * Format message text (support for markdown-like syntax)
   */
  formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  /**
   * Append to AI message (for streaming)
   */
  appendAIMessage(text) {
    const messages = this.widget.querySelector('#chatMessages');
    let lastMessage = messages.querySelector('.chat-message:last-child');

    if (!lastMessage || !lastMessage.classList.contains('assistant')) {
      this.addMessage('assistant', text);
    } else {
      const bubble = lastMessage.querySelector('.message-bubble');
      bubble.textContent += (bubble.textContent ? ' ' : '') + text;
      messages.scrollTop = messages.scrollHeight;
    }
  }

  /**
   * Show typing indicator
   */
  showTyping() {
    const messages = this.widget.querySelector('#chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant typing-message';
    typingDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;

    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  /**
   * Hide typing indicator
   */
  hideTyping() {
    const typing = this.widget.querySelector('.typing-message');
    if (typing) typing.remove();
  }

  /**
   * Show transcription feedback
   */
  showTranscriptionFeedback(text) {
    const voiceStatusText = this.widget.querySelector('.voice-status-text');
    if (voiceStatusText) {
      voiceStatusText.textContent = text || 'Listening...';
    }
  }

  /**
   * Update latency badge
   */
  updateLatencyBadge(latency) {
    const badge = this.widget.querySelector('#latencyBadge');
    if (badge && latency) {
      badge.textContent = `${latency}ms`;
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.orderVoiceWidget = new OrderVoiceChatWidget({
      voiceEnabled: true,
      autoOpen: false
    });
    window.orderVoiceWidget.init();
  });
} else {
  window.orderVoiceWidget = new OrderVoiceChatWidget({
    voiceEnabled: true,
    autoOpen: false
  });
  window.orderVoiceWidget.init();
}
