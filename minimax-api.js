/**
 * MiniMax API Integration Module
 * Ultra-low latency streaming voice synthesis
 * Supports real-time audio generation with minimal delay
 */

class MiniMaxAPI {
  constructor(config) {
    this.config = config;
    this.ws = null;
    this.audioQueue = [];
    this.isPlaying = false;
    this.audioContext = null;
    this.currentSource = null;
    this.reconnectAttempts = 0;
    this.sessionId = null;
    this.listeners = {};
  }

  /**
   * Initialize audio context for playback
   */
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.config.audioContext.sampleRate,
        latencyHint: this.config.audioContext.latencyHint
      });
    }
    return this.audioContext;
  }

  /**
   * Connect to MiniMax streaming WebSocket
   */
  async connect(voiceId) {
    return new Promise((resolve, reject) => {
      try {
        // Initialize audio context
        this.initAudioContext();

        // Build WebSocket URL with authentication
        const wsUrl = `${this.config.endpoints.websocket}?voice_id=${voiceId}&group_id=${this.config.groupId}`;

        this.ws = new WebSocket(wsUrl);
        this.ws.binaryType = 'arraybuffer';

        // Connection opened
        this.ws.onopen = () => {
          console.log('[MiniMax] WebSocket connected');
          this.reconnectAttempts = 0;

          // Send authentication
          this.ws.send(JSON.stringify({
            type: 'auth',
            api_key: this.config.apiKey,
            group_id: this.config.groupId,
            model: this.config.model,
            voice_id: voiceId
          }));

          this.emit('connected');
          resolve();
        };

        // Message received
        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        // Connection closed
        this.ws.onclose = () => {
          console.log('[MiniMax] WebSocket closed');
          this.emit('disconnected');

          // Auto-reconnect if enabled
          if (this.config.performance.autoReconnect &&
              this.reconnectAttempts < this.config.performance.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              console.log(`[MiniMax] Reconnecting... (${this.reconnectAttempts}/${this.config.performance.maxReconnectAttempts})`);
              this.connect(voiceId);
            }, this.config.performance.reconnectDelay);
          }
        };

        // Error handling
        this.ws.onerror = (error) => {
          console.error('[MiniMax] WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        // Keep-alive ping
        if (this.config.performance.pingInterval) {
          this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, this.config.performance.pingInterval);
        }

      } catch (error) {
        console.error('[MiniMax] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    // Binary audio data
    if (event.data instanceof ArrayBuffer) {
      this.handleAudioChunk(event.data);
      return;
    }

    // JSON messages
    try {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'auth_success':
          console.log('[MiniMax] Authentication successful');
          this.sessionId = message.session_id;
          this.emit('authenticated', message);
          break;

        case 'audio_start':
          console.log('[MiniMax] Audio stream started');
          this.emit('audio_start');
          break;

        case 'audio_chunk':
          // Audio data in base64 format
          if (message.audio) {
            const audioData = this.base64ToArrayBuffer(message.audio);
            this.handleAudioChunk(audioData);
          }
          break;

        case 'audio_end':
          console.log('[MiniMax] Audio stream ended');
          this.emit('audio_end');
          break;

        case 'transcript':
          console.log('[MiniMax] Transcript:', message.text);
          this.emit('transcript', message.text);
          break;

        case 'error':
          console.error('[MiniMax] Server error:', message.error);
          this.emit('error', message.error);
          break;

        case 'pong':
          // Keep-alive response
          break;

        default:
          console.log('[MiniMax] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[MiniMax] Error parsing message:', error);
    }
  }

  /**
   * Handle incoming audio chunks
   */
  handleAudioChunk(arrayBuffer) {
    // Add to queue for sequential playback
    this.audioQueue.push(arrayBuffer);
    this.emit('audio_chunk', arrayBuffer);

    // Start playback if not already playing
    if (!this.isPlaying) {
      this.playNextChunk();
    }
  }

  /**
   * Play audio chunks from queue
   */
  async playNextChunk() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.emit('playback_complete');
      return;
    }

    this.isPlaying = true;
    const audioData = this.audioQueue.shift();

    try {
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);

      // Create buffer source
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      // Store current source for interruption handling
      this.currentSource = source;

      // Play next chunk when this one finishes
      source.onended = () => {
        this.currentSource = null;
        this.playNextChunk();
      };

      source.start(0);

    } catch (error) {
      console.error('[MiniMax] Error decoding audio:', error);
      this.playNextChunk(); // Continue to next chunk
    }
  }

  /**
   * Stream text to speech with ultra-low latency
   */
  streamText(text, options = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[MiniMax] WebSocket not connected');
      return;
    }

    const payload = {
      type: 'tts',
      text: text,
      model: this.config.model,
      voice_settings: {
        ...this.config.streaming.voiceSettings,
        ...options.voiceSettings
      },
      streaming: true,
      format: this.config.streaming.format,
      sample_rate: this.config.streaming.sampleRate,
      speed: options.speed || this.config.streaming.speed
    };

    console.log('[MiniMax] Streaming text:', text.substring(0, 50) + '...');
    this.ws.send(JSON.stringify(payload));
  }

  /**
   * Interrupt current audio playback
   */
  interrupt() {
    console.log('[MiniMax] Interrupting playback');

    // Stop current audio source
    if (this.currentSource) {
      try {
        // Fade out for smooth interruption
        if (this.config.interruption.fadeOutDuration > 0) {
          const gainNode = this.audioContext.createGain();
          this.currentSource.disconnect();
          this.currentSource.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + (this.config.interruption.fadeOutDuration / 1000)
          );
        }

        this.currentSource.stop();
        this.currentSource = null;
      } catch (error) {
        console.error('[MiniMax] Error stopping audio:', error);
      }
    }

    // Clear audio queue if configured
    if (this.config.interruption.clearQueueOnInterrupt) {
      this.audioQueue = [];
    }

    this.isPlaying = false;
    this.emit('interrupted');
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
   * Disconnect and cleanup
   */
  disconnect() {
    console.log('[MiniMax] Disconnecting...');

    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Stop playback
    this.interrupt();

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.emit('disconnected');
  }

  /**
   * Utility: Convert base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Get connection status
   */
  getStatus() {
    if (!this.ws) return 'disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MiniMaxAPI;
}
