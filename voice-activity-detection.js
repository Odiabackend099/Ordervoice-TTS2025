/**
 * Voice Activity Detection (VAD) Module
 * Detects when user starts and stops speaking for seamless conversation
 * Uses Web Audio API for real-time audio analysis
 */

class VoiceActivityDetector {
  constructor(config) {
    this.config = config;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.processor = null;
    this.dataArray = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.speechStartTime = 0;
    this.silenceStartTime = 0;
    this.listeners = {};
    this.volumeHistory = [];
    this.preSpeechBuffer = [];
  }

  /**
   * Initialize VAD with microphone access
   */
  async initialize() {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000 // Lower sample rate for VAD to save processing
        }
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.3;

      // Connect microphone
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      // Create data array for frequency analysis
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Store stream for later access
      this.stream = stream;

      console.log('[VAD] Initialized successfully');
      this.emit('initialized');

      return true;
    } catch (error) {
      console.error('[VAD] Initialization error:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Start voice activity detection
   */
  start() {
    if (this.isListening) {
      console.warn('[VAD] Already listening');
      return;
    }

    this.isListening = true;
    this.isSpeaking = false;
    this.speechStartTime = 0;
    this.silenceStartTime = 0;
    this.volumeHistory = [];
    this.preSpeechBuffer = [];

    console.log('[VAD] Starting detection');
    this.emit('started');

    // Start analysis loop
    this.detectLoop();
  }

  /**
   * Main detection loop
   */
  detectLoop() {
    if (!this.isListening) return;

    // Get current audio level
    this.analyser.getByteFrequencyData(this.dataArray);
    const volume = this.calculateVolume();
    const currentTime = Date.now();

    // Store audio in pre-speech buffer
    if (this.config.vad.preSpeechBuffer > 0) {
      this.preSpeechBuffer.push({
        volume: volume,
        timestamp: currentTime
      });

      // Keep buffer size limited
      const bufferDuration = this.config.vad.preSpeechBuffer;
      while (this.preSpeechBuffer.length > 0 &&
             currentTime - this.preSpeechBuffer[0].timestamp > bufferDuration) {
        this.preSpeechBuffer.shift();
      }
    }

    // Emit volume level for visualization
    this.emit('volume', volume);

    // Detect speech vs silence
    const isSpeechDetected = volume > this.config.vad.silenceThreshold;

    if (isSpeechDetected) {
      this.handleSpeechDetected(currentTime);
    } else {
      this.handleSilenceDetected(currentTime);
    }

    // Continue loop
    requestAnimationFrame(() => this.detectLoop());
  }

  /**
   * Handle speech detected
   */
  handleSpeechDetected(currentTime) {
    if (!this.isSpeaking) {
      // Check if speech duration threshold met
      if (this.speechStartTime === 0) {
        this.speechStartTime = currentTime;
      } else if (currentTime - this.speechStartTime >= this.config.vad.minSpeechDuration) {
        // Speech started
        this.isSpeaking = true;
        this.silenceStartTime = 0;

        console.log('[VAD] Speech started');
        this.emit('speech_start', {
          timestamp: currentTime,
          preSpeechBuffer: this.preSpeechBuffer
        });
      }
    } else {
      // Continue speech
      this.silenceStartTime = 0;
    }
  }

  /**
   * Handle silence detected
   */
  handleSilenceDetected(currentTime) {
    if (this.isSpeaking) {
      // Check if silence duration threshold met
      if (this.silenceStartTime === 0) {
        this.silenceStartTime = currentTime;
      } else if (currentTime - this.silenceStartTime >= this.config.vad.maxSilenceDuration) {
        // Speech ended
        this.isSpeaking = false;
        this.speechStartTime = 0;

        console.log('[VAD] Speech ended');
        this.emit('speech_end', {
          timestamp: currentTime
        });
      }
    } else {
      // Reset speech start time if below threshold
      if (currentTime - this.speechStartTime > this.config.vad.minSpeechDuration) {
        this.speechStartTime = 0;
      }
    }
  }

  /**
   * Calculate current audio volume (RMS)
   */
  calculateVolume() {
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = this.dataArray[i] / 255.0;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / this.dataArray.length);

    // Add to history for smoothing
    this.volumeHistory.push(rms);
    if (this.volumeHistory.length > 5) {
      this.volumeHistory.shift();
    }

    // Return smoothed volume
    return this.volumeHistory.reduce((a, b) => a + b, 0) / this.volumeHistory.length;
  }

  /**
   * Get audio stream for speech recognition
   */
  getAudioStream() {
    return this.stream;
  }

  /**
   * Get current speaking state
   */
  isSpeakingNow() {
    return this.isSpeaking;
  }

  /**
   * Stop voice activity detection
   */
  stop() {
    if (!this.isListening) {
      console.warn('[VAD] Not listening');
      return;
    }

    this.isListening = false;
    this.isSpeaking = false;

    console.log('[VAD] Stopped detection');
    this.emit('stopped');
  }

  /**
   * Cleanup and release resources
   */
  cleanup() {
    console.log('[VAD] Cleaning up...');

    this.stop();

    // Stop all audio tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Disconnect audio nodes
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.preSpeechBuffer = [];
    this.volumeHistory = [];

    this.emit('cleaned_up');
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
   * Update VAD configuration
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
    console.log('[VAD] Configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Test microphone and get volume level
   */
  async testMicrophone() {
    if (!this.analyser) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      this.analyser.getByteFrequencyData(this.dataArray);
      const volume = this.calculateVolume();
      resolve({
        working: volume > 0,
        volume: volume,
        threshold: this.config.vad.silenceThreshold
      });
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceActivityDetector;
}
