/**
 * Groq LLM Streaming Integration
 * Ultra-fast LLM inference with streaming responses
 * Supports sentence-level chunking for early TTS start
 */

class GroqLLM {
  constructor(config) {
    this.apiKey = config.groqApiKey;
    this.config = {
      model: 'llama-3.3-70b-versatile', // Fast and high quality
      temperature: 0.7,
      maxTokens: 1024,
      topP: 1,
      stream: true,
      ...config.groq
    };

    this.conversationHistory = [];
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt();
    this.listeners = {};
    this.abortController = null;
  }

  /**
   * Get default system prompt for order taking
   */
  getDefaultSystemPrompt() {
    return `You are a friendly and efficient AI assistant for OrderVoice, helping customers place food orders in Nigeria.

Your responsibilities:
- Greet customers warmly and professionally
- Help them browse the menu and make selections
- Clarify any questions about food items, ingredients, or preparation
- Confirm order details including quantities, special requests, and delivery information
- Keep responses concise and conversational (1-2 sentences max)
- Speak naturally as if having a real conversation

Important guidelines:
- Be warm and friendly but professional
- Keep responses brief to maintain conversation flow
- Ask one question at a time
- Confirm important details before proceeding
- Handle interruptions gracefully

Current menu context will be provided for each conversation.`;
  }

  /**
   * Generate streaming response from user input
   */
  async generateResponse(userMessage, options = {}) {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Create abort controller for cancellation
      this.abortController = new AbortController();

      // Build messages array
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...this.conversationHistory.slice(-10) // Keep last 10 messages for context
      ];

      // Call Groq API with streaming
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: options.model || this.config.model,
          messages: messages,
          temperature: options.temperature || this.config.temperature,
          max_tokens: options.maxTokens || this.config.maxTokens,
          top_p: options.topP || this.config.topP,
          stream: true
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
      }

      // Process streaming response
      await this.processStream(response);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('[Groq] Request cancelled');
        this.emit('cancelled');
      } else {
        console.error('[Groq] Error generating response:', error);
        this.emit('error', error);
        throw error;
      }
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Process streaming response from Groq
   */
  async processStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullResponse = '';
    let currentSentence = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Send any remaining content
          if (currentSentence.trim()) {
            this.emit('sentence', currentSentence.trim());
          }
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();

          // Skip empty lines and comments
          if (!trimmed || trimmed.startsWith(':')) continue;

          // Parse SSE format
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);

            // Check for end of stream
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;

              if (delta?.content) {
                const content = delta.content;
                fullResponse += content;
                currentSentence += content;

                // Emit word-level updates for real-time feedback
                this.emit('token', content);

                // Check for sentence boundaries
                if (this.isSentenceBoundary(currentSentence)) {
                  const sentence = currentSentence.trim();
                  console.log('[Groq] Complete sentence:', sentence);
                  this.emit('sentence', sentence);
                  currentSentence = '';
                }
              }

              // Check for finish reason
              if (parsed.choices?.[0]?.finish_reason) {
                console.log('[Groq] Finish reason:', parsed.choices[0].finish_reason);
              }

            } catch (error) {
              console.error('[Groq] Error parsing chunk:', error);
            }
          }
        }
      }

      // Add complete response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse
      });

      console.log('[Groq] Complete response:', fullResponse);
      this.emit('complete', fullResponse);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('[Groq] Stream processing error:', error);
        this.emit('error', error);
      }
      throw error;
    }
  }

  /**
   * Check if current text contains a sentence boundary
   * This enables early TTS start for lower latency
   */
  isSentenceBoundary(text) {
    // Don't process very short text
    if (text.trim().length < 10) return false;

    // Check for sentence-ending punctuation followed by space or end
    const sentenceEnders = /[.!?]\s+|[.!?]$/;
    return sentenceEnders.test(text);
  }

  /**
   * Cancel current generation
   */
  cancel() {
    if (this.abortController) {
      console.log('[Groq] Cancelling request');
      this.abortController.abort();
      this.abortController = null;
      this.emit('cancelled');
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    console.log('[Groq] Clearing conversation history');
    this.conversationHistory = [];
    this.emit('history_cleared');
  }

  /**
   * Update system prompt
   */
  setSystemPrompt(prompt) {
    console.log('[Groq] Updating system prompt');
    this.systemPrompt = prompt;
    this.emit('system_prompt_updated', prompt);
  }

  /**
   * Add context to conversation (e.g., menu items)
   */
  addContext(context) {
    const contextMessage = {
      role: 'system',
      content: `Context: ${context}`
    };

    this.conversationHistory.push(contextMessage);
    console.log('[Groq] Context added to conversation');
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[Groq] Configuration updated');
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      model: this.config.model,
      conversationLength: this.conversationHistory.length,
      isGenerating: this.abortController !== null
    };
  }

  /**
   * Event listener system
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Groq] Connection test successful. Available models:', data.data.length);
        return true;
      } else {
        throw new Error(`API test failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[Groq] Connection test failed:', error);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GroqLLM;
}
