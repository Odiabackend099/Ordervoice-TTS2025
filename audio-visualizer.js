/**
 * Audio Visualizer Module
 * Real-time audio visualization for voice conversations
 * Provides waveform, frequency spectrum, and volume meters
 */

class AudioVisualizer {
  constructor(config = {}) {
    this.config = {
      fftSize: config.fftSize || 2048,
      smoothing: config.smoothing || 0.8,
      minDecibels: config.minDecibels || -90,
      maxDecibels: config.maxDecibels || -10,
      barCount: config.barCount || 32,
      ...config
    };

    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.animationId = null;
    this.canvas = null;
    this.canvasContext = null;
    this.isActive = false;
  }

  /**
   * Initialize visualizer with audio source
   */
  initialize(audioSource, canvas) {
    this.canvas = canvas;
    this.canvasContext = canvas.getContext('2d');

    // Create audio context if not provided
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Create analyser node
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.config.fftSize;
    this.analyser.smoothingTimeConstant = this.config.smoothing;
    this.analyser.minDecibels = this.config.minDecibels;
    this.analyser.maxDecibels = this.config.maxDecibels;

    // Connect audio source
    if (audioSource instanceof MediaStream) {
      const source = this.audioContext.createMediaStreamSource(audioSource);
      source.connect(this.analyser);
    } else {
      audioSource.connect(this.analyser);
    }

    // Create data arrays
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    this.frequencyData = new Uint8Array(bufferLength);

    console.log('[Visualizer] Initialized');
  }

  /**
   * Start visualization
   */
  start(mode = 'waveform') {
    if (this.isActive) {
      console.warn('[Visualizer] Already active');
      return;
    }

    this.isActive = true;
    this.visualizationMode = mode;

    console.log(`[Visualizer] Starting in ${mode} mode`);
    this.animate();
  }

  /**
   * Main animation loop
   */
  animate() {
    if (!this.isActive) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    // Get audio data
    this.analyser.getByteTimeDomainData(this.dataArray);
    this.analyser.getByteFrequencyData(this.frequencyData);

    // Clear canvas
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw based on mode
    switch (this.visualizationMode) {
      case 'waveform':
        this.drawWaveform();
        break;
      case 'bars':
        this.drawFrequencyBars();
        break;
      case 'circular':
        this.drawCircularBars();
        break;
      case 'oscilloscope':
        this.drawOscilloscope();
        break;
      default:
        this.drawWaveform();
    }
  }

  /**
   * Draw waveform visualization
   */
  drawWaveform() {
    const { width, height } = this.canvas;
    const sliceWidth = width / this.dataArray.length;

    this.canvasContext.lineWidth = 3;
    this.canvasContext.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.canvasContext.beginPath();

    let x = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.canvasContext.lineTo(width, height / 2);
    this.canvasContext.stroke();
  }

  /**
   * Draw frequency bars visualization
   */
  drawFrequencyBars() {
    const { width, height } = this.canvas;
    const barCount = this.config.barCount;
    const barWidth = (width / barCount) * 0.8;
    const gap = (width / barCount) * 0.2;

    for (let i = 0; i < barCount; i++) {
      const barHeight = (this.frequencyData[i] / 255) * height;
      const x = i * (barWidth + gap);
      const y = height - barHeight;

      // Gradient color based on frequency
      const hue = (i / barCount) * 120; // 0 to 120 (red to green)
      this.canvasContext.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;

      // Draw bar with rounded top
      this.canvasContext.beginPath();
      this.canvasContext.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      this.canvasContext.fill();
    }
  }

  /**
   * Draw circular bars visualization
   */
  drawCircularBars() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    const barCount = this.config.barCount;

    for (let i = 0; i < barCount; i++) {
      const angle = (Math.PI * 2 * i) / barCount;
      const barHeight = (this.frequencyData[i] / 255) * radius;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      // Color gradient
      const hue = (i / barCount) * 360;
      this.canvasContext.strokeStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
      this.canvasContext.lineWidth = 6;

      this.canvasContext.beginPath();
      this.canvasContext.moveTo(x1, y1);
      this.canvasContext.lineTo(x2, y2);
      this.canvasContext.stroke();
    }

    // Draw center circle
    this.canvasContext.beginPath();
    this.canvasContext.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
    this.canvasContext.fillStyle = 'rgba(30, 58, 138, 0.5)';
    this.canvasContext.fill();
  }

  /**
   * Draw oscilloscope visualization
   */
  drawOscilloscope() {
    const { width, height } = this.canvas;
    const bufferLength = this.dataArray.length;
    const sliceWidth = width / bufferLength;

    // Gradient background
    const gradient = this.canvasContext.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.1)');
    this.canvasContext.fillStyle = gradient;
    this.canvasContext.fillRect(0, 0, width, height);

    // Draw waveform
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    this.canvasContext.beginPath();

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.canvasContext.lineTo(width, height / 2);
    this.canvasContext.stroke();

    // Fill area under curve
    this.canvasContext.lineTo(width, height);
    this.canvasContext.lineTo(0, height);
    this.canvasContext.closePath();
    this.canvasContext.fillStyle = 'rgba(59, 130, 246, 0.2)';
    this.canvasContext.fill();
  }

  /**
   * Get current volume level (0-1)
   */
  getVolume() {
    if (!this.analyser) return 0;

    this.analyser.getByteFrequencyData(this.frequencyData);

    let sum = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
    }

    const average = sum / this.frequencyData.length;
    return average / 255;
  }

  /**
   * Get frequency at specific range
   */
  getFrequencyRange(minHz, maxHz) {
    if (!this.analyser) return 0;

    const nyquist = this.audioContext.sampleRate / 2;
    const minIndex = Math.floor((minHz / nyquist) * this.frequencyData.length);
    const maxIndex = Math.ceil((maxHz / nyquist) * this.frequencyData.length);

    let sum = 0;
    let count = 0;

    for (let i = minIndex; i < maxIndex && i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
      count++;
    }

    return count > 0 ? (sum / count) / 255 : 0;
  }

  /**
   * Change visualization mode
   */
  setMode(mode) {
    this.visualizationMode = mode;
    console.log(`[Visualizer] Mode changed to ${mode}`);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    if (this.analyser) {
      if (newConfig.fftSize) this.analyser.fftSize = newConfig.fftSize;
      if (newConfig.smoothing !== undefined) this.analyser.smoothingTimeConstant = newConfig.smoothing;
      if (newConfig.minDecibels) this.analyser.minDecibels = newConfig.minDecibels;
      if (newConfig.maxDecibels) this.analyser.maxDecibels = newConfig.maxDecibels;
    }

    console.log('[Visualizer] Configuration updated');
  }

  /**
   * Resize canvas
   */
  resize(width, height) {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  /**
   * Stop visualization
   */
  stop() {
    if (!this.isActive) {
      console.warn('[Visualizer] Not active');
      return;
    }

    this.isActive = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Clear canvas
    if (this.canvasContext) {
      this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    console.log('[Visualizer] Stopped');
  }

  /**
   * Cleanup and release resources
   */
  cleanup() {
    console.log('[Visualizer] Cleaning up...');

    this.stop();

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    this.dataArray = null;
    this.frequencyData = null;
    this.canvas = null;
    this.canvasContext = null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioVisualizer;
}
