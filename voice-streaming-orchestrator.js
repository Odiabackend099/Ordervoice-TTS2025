/**
 * Voice Streaming Orchestrator
 * Coordinates all components for ultra-low latency voice conversations
 * Handles speech recognition, VAD, interruption, and streaming audio
 */

class VoiceStreamingOrchestrator {
  constructor(config) {
    this.config = config;

    // Initialize components
    this.deepgram = new DeepgramSTT(config);
    this.groq = new GroqLLM(config);
    this.minimax = new MiniMaxAPI(config);
    this.vad = new VoiceActivityDetector(config);

    // State management
    this.currentVoice = null;
    this.isActive = false;
    this.listeners = {};
    this.conversationBuffer = [];
    this.processingQueue = [];
    this.lastUserSpeechTime = 0;
    this.currentUtterance = '';
    this.isAISpeaking = false;

    // Performance metrics
    this.metrics = {
      sttLatency: [],
      llmLatency: [],
      ttsLatency: [],
      totalLatency: []
    };
  }

  /**
   * Initialize all components
   */
  async initialize(voiceName = 'austyn') {
    try {
      console.log('[Orchestrator] Initializing ultra-low latency streaming...');
      const initStartTime = Date.now();

      // Set current voice
      this.currentVoice = this.config.voices[voiceName];
      if (!this.currentVoice) {
        throw new Error(`Voice "${voiceName}" not found`);
      }

      // Initialize components in parallel for speed
      await Promise.all([
        this.vad.initialize(),
        this.deepgram.connect(),
        this.minimax.connect(this.currentVoice.id)
      ]);

      // Set up event handlers
      this.setupEventHandlers();

      const initTime = Date.now() - initStartTime;
      console.log(`[Orchestrator] Initialized successfully in ${initTime}ms`);
      this.emit('initialized', { voice: this.currentVoice, initTime });

      return true;
    } catch (error) {
      console.error('[Orchestrator] Initialization error:', error);
      this.emit('error', error);
      throw error;
    }
  }


  /**
   * Set up event handlers for all components
   */
  setupEventHandlers() {
    // VAD events - detect user speech for interruption
    this.vad.on('speech_start', () => {
      console.log('[Orchestrator] User started speaking (VAD)');
      this.emit('user_speech_start');

      // Interrupt AI if enabled
      if (this.config.interruption.enabled && this.isAISpeaking) {
        console.log('[Orchestrator] Interrupting AI');
        this.interrupt();
      }
    });

    this.vad.on('speech_end', () => {
      console.log('[Orchestrator] User stopped speaking (VAD)');
      this.emit('user_speech_end');
    });

    this.vad.on('volume', (volume) => {
      this.emit('volume', volume);
    });

    // Deepgram STT events
    this.deepgram.on('transcript_interim', (data) => {
      console.log('[Orchestrator] Interim transcript:', data.transcript);
      this.currentUtterance = data.transcript;
      this.emit('interim_transcript', data.transcript);
    });

    this.deepgram.on('transcript_final', (data) => {
      const transcript = data.transcript;
      console.log('[Orchestrator] Final transcript:', transcript);

      if (transcript.trim()) {
        this.handleUserSpeech(transcript, data);
      }
    });

    this.deepgram.on('utterance_end', () => {
      console.log('[Orchestrator] Utterance ended');
      this.currentUtterance = '';
    });

    this.deepgram.on('error', (error) => {
      console.error('[Orchestrator] Deepgram error:', error);
      this.emit('error', error);
    });

    // Groq LLM events - sentence-level streaming
    this.groq.on('sentence', (sentence) => {
      console.log('[Orchestrator] LLM sentence ready:', sentence);
      this.emit('ai_sentence', sentence);

      // Stream sentence to TTS immediately for ultra-low latency
      this.minimax.streamText(sentence);
    });

    this.groq.on('complete', (fullResponse) => {
      console.log('[Orchestrator] LLM response complete');
      this.emit('ai_message_complete', fullResponse);
    });

    this.groq.on('error', (error) => {
      console.error('[Orchestrator] Groq error:', error);
      this.emit('error', error);
    });

    // MiniMax TTS events
    this.minimax.on('audio_start', () => {
      console.log('[Orchestrator] AI started speaking');
      this.isAISpeaking = true;
      this.emit('ai_speech_start');
    });

    this.minimax.on('audio_end', () => {
      console.log('[Orchestrator] AI finished speaking');
      this.isAISpeaking = false;
      this.emit('ai_speech_end');
    });

    this.minimax.on('audio_chunk', () => {
      this.emit('ai_audio_chunk');
    });

    this.minimax.on('interrupted', () => {
      console.log('[Orchestrator] AI was interrupted');
      this.isAISpeaking = false;
      this.emit('ai_interrupted');
    });

    this.minimax.on('error', (error) => {
      console.error('[Orchestrator] MiniMax error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Start voice conversation
   */
  async start() {
    if (this.isActive) {
      console.warn('[Orchestrator] Already active');
      return;
    }

    try {
      console.log('[Orchestrator] Starting ultra-low latency conversation');
      this.isActive = true;

      // Start all streaming components in parallel
      await Promise.all([
        this.vad.start(),
        this.deepgram.startStreaming()
      ]);

      this.emit('started');
      console.log('[Orchestrator] Conversation started - ready for voice input');

    } catch (error) {
      console.error('[Orchestrator] Error starting:', error);
      this.emit('error', error);
      this.isActive = false;
      throw error;
    }
  }

  /**
   * Handle user speech input with streaming pipeline
   */
  async handleUserSpeech(transcript, metadata) {
    const startTime = Date.now();
    console.log('[Orchestrator] Processing user speech:', transcript);
    this.lastUserSpeechTime = startTime;

    // Add to conversation buffer
    this.conversationBuffer.push({
      role: 'user',
      content: transcript,
      timestamp: startTime,
      confidence: metadata?.confidence
    });

    this.emit('user_message', transcript);

    // Start LLM generation immediately (streaming with sentence-level chunking)
    try {
      const llmStartTime = Date.now();

      // Generate response with streaming
      await this.groq.generateResponse(transcript);

      const totalLatency = Date.now() - startTime;
      const llmLatency = Date.now() - llmStartTime;

      // Track metrics
      this.metrics.llmLatency.push(llmLatency);
      this.metrics.totalLatency.push(totalLatency);

      console.log(`[Orchestrator] Response pipeline completed - LLM: ${llmLatency}ms, Total: ${totalLatency}ms`);
      this.emit('metrics', {
        llmLatency,
        totalLatency,
        averageLLM: this.getAverageMetric('llmLatency'),
        averageTotal: this.getAverageMetric('totalLatency')
      });

    } catch (error) {
      console.error('[Orchestrator] Error generating response:', error);
      this.emit('error', error);
    }
  }

  /**
   * Interrupt current AI response
   */
  interrupt() {
    console.log('[Orchestrator] Interrupting current response');

    // Cancel LLM generation
    this.groq.cancel();

    // Stop TTS playback
    this.minimax.interrupt();

    this.isAISpeaking = false;
    this.emit('interrupted');
  }

  /**
   * Get average metric value
   */
  getAverageMetric(metric) {
    const values = this.metrics[metric];
    if (values.length === 0) return 0;

    // Keep only last 20 measurements
    if (values.length > 20) {
      this.metrics[metric] = values.slice(-20);
    }

    const sum = this.metrics[metric].reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics[metric].length);
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      sttLatency: this.getAverageMetric('sttLatency'),
      llmLatency: this.getAverageMetric('llmLatency'),
      ttsLatency: this.getAverageMetric('ttsLatency'),
      totalLatency: this.getAverageMetric('totalLatency'),
      conversationLength: this.conversationBuffer.length
    };
  }

  /**
   * Change voice during conversation
   */
  async changeVoice(voiceName) {
    const voice = this.config.voices[voiceName];
    if (!voice) {
      throw new Error(`Voice "${voiceName}" not found`);
    }

    console.log('[Orchestrator] Changing voice to:', voiceName);

    // Disconnect current
    this.minimax.disconnect();

    // Connect with new voice
    await this.minimax.connect(voice.id);

    this.currentVoice = voice;
    this.emit('voice_changed', voice);
  }

  /**
   * Stop conversation
   */
  stop() {
    if (!this.isActive) {
      console.warn('[Orchestrator] Not active');
      return;
    }

    console.log('[Orchestrator] Stopping conversation');
    this.isActive = false;

    // Stop all components
    this.vad.stop();
    this.deepgram.stopStreaming();
    this.minimax.interrupt();
    this.groq.cancel();

    // Clear state
    this.currentUtterance = '';
    this.isAISpeaking = false;
    this.processingQueue = [];

    this.emit('stopped');
  }

  /**
   * Cleanup and disconnect
   */
  async cleanup() {
    console.log('[Orchestrator] Cleaning up...');

    this.stop();

    // Cleanup all components
    this.vad.cleanup();
    this.deepgram.disconnect();
    this.minimax.disconnect();
    this.groq.clearHistory();

    // Clear buffers and state
    this.conversationBuffer = [];
    this.currentUtterance = '';
    this.isAISpeaking = false;

    // Reset metrics
    this.metrics = {
      sttLatency: [],
      llmLatency: [],
      ttsLatency: [],
      totalLatency: []
    };

    this.emit('cleaned_up');
  }

  /**
   * Get conversation history
   */
  getConversationHistory() {
    return this.conversationBuffer;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      active: this.isActive,
      voice: this.currentVoice,
      minimax: this.minimax.getStatus(),
      vad: this.vad.isListening,
      speaking: this.vad.isSpeakingNow()
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
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceStreamingOrchestrator;
}
