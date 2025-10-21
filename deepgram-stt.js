/**
 * Deepgram Speech-to-Text Integration
 * Ultra-low latency streaming STT using WebSocket
 * Provides real-time transcription with interim results
 */

class DeepgramSTT {
  constructor(config) {
    this.apiKey = config.deepgramApiKey;
    this.config = {
      model: 'nova-2',
      language: 'en-US',
      smartFormat: true,
      interimResults: true,
      punctuate: true,
      endpointing: 300, // ms of silence to detect end of utterance
      vadEvents: true,
      utteranceEndMs: 1000,
      ...config.deepgram
    };

    this.ws = null;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.sourceNode = null;
    this.processorNode = null;
    this.isConnected = false;
    this.isStreaming = false;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Initialize and connect to Deepgram WebSocket
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL with parameters
        const params = new URLSearchParams({
          model: this.config.model,
          language: this.config.language,
          smart_format: this.config.smartFormat,
          interim_results: this.config.interimResults,
          punctuate: this.config.punctuate,
          endpointing: this.config.endpointing,
          vad_events: this.config.vadEvents,
          utterance_end_ms: this.config.utteranceEndMs
        });

        const wsUrl = `wss://api.deepgram.com/v1/listen?${params}`;

        this.ws = new WebSocket(wsUrl, ['token', this.apiKey]);

        // Connection opened
        this.ws.onopen = () => {
          console.log('[Deepgram] WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        // Message received
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('[Deepgram] Error parsing message:', error);
          }
        };

        // Connection closed
        this.ws.onclose = (event) => {
          console.log('[Deepgram] WebSocket closed:', event.code, event.reason);
          this.isConnected = false;
          this.isStreaming = false;
          this.emit('disconnected');

          // Auto-reconnect if streaming was active
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              console.log(`[Deepgram] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              this.connect().then(() => {
                if (this.isStreaming) {
                  this.startStreaming();
                }
              }).catch(err => {
                console.error('[Deepgram] Reconnection failed:', err);
              });
            }, this.reconnectDelay);
          }
        };

        // Error handling
        this.ws.onerror = (error) => {
          console.error('[Deepgram] WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        console.error('[Deepgram] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages from Deepgram
   */
  handleMessage(data) {
    // Transcription results
    if (data.type === 'Results') {
      const result = data.channel?.alternatives?.[0];

      if (result) {
        const transcript = result.transcript;
        const isFinal = data.is_final;
        const speechFinal = data.speech_final;

        if (transcript) {
          if (isFinal) {
            console.log('[Deepgram] Final transcript:', transcript);
            this.emit('transcript_final', {
              transcript,
              confidence: result.confidence,
              words: result.words,
              speechFinal
            });
          } else {
            console.log('[Deepgram] Interim transcript:', transcript);
            this.emit('transcript_interim', {
              transcript,
              confidence: result.confidence
            });
          }
        }
      }
    }

    // VAD events
    else if (data.type === 'SpeechStarted') {
      console.log('[Deepgram] Speech started');
      this.emit('speech_started');
    }

    else if (data.type === 'UtteranceEnd') {
      console.log('[Deepgram] Utterance ended');
      this.emit('utterance_end');
    }

    // Metadata
    else if (data.type === 'Metadata') {
      console.log('[Deepgram] Metadata:', data);
      this.emit('metadata', data);
    }

    // Errors
    else if (data.type === 'error') {
      console.error('[Deepgram] Server error:', data);
      this.emit('error', data);
    }
  }

  /**
   * Start streaming audio from microphone
   */
  async startStreaming() {
    if (this.isStreaming) {
      console.warn('[Deepgram] Already streaming');
      return;
    }

    if (!this.isConnected) {
      throw new Error('Not connected to Deepgram. Call connect() first.');
    }

    try {
      console.log('[Deepgram] Starting audio stream');

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      // Create audio context with optimal settings for streaming
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });

      // Create source from microphone stream
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);

      // Create script processor for audio data
      const bufferSize = 4096; // Larger buffer for better performance
      this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      // Process audio data and send to Deepgram
      this.processorNode.onaudioprocess = (event) => {
        if (!this.isConnected || !this.isStreaming) return;

        const audioData = event.inputBuffer.getChannelData(0);

        // Convert float32 to int16 for Deepgram
        const int16Data = this.float32ToInt16(audioData);

        // Send to Deepgram
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(int16Data);
        }
      };

      // Connect audio nodes
      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.stream = stream;
      this.isStreaming = true;

      this.emit('streaming_started');
      console.log('[Deepgram] Audio streaming started');

    } catch (error) {
      console.error('[Deepgram] Error starting stream:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop streaming audio
   */
  stopStreaming() {
    if (!this.isStreaming) {
      console.warn('[Deepgram] Not streaming');
      return;
    }

    console.log('[Deepgram] Stopping audio stream');

    // Disconnect audio nodes
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    // Stop microphone tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Send close message to Deepgram
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'CloseStream' }));
    }

    this.isStreaming = false;
    this.emit('streaming_stopped');
  }

  /**
   * Disconnect from Deepgram
   */
  disconnect() {
    console.log('[Deepgram] Disconnecting...');

    // Stop streaming first
    if (this.isStreaming) {
      this.stopStreaming();
    }

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.emit('disconnected');
  }

  /**
   * Convert Float32Array to Int16Array for Deepgram
   */
  float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array.buffer;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[Deepgram] Configuration updated');
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      streaming: this.isStreaming,
      config: this.config
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
  module.exports = DeepgramSTT;
}
