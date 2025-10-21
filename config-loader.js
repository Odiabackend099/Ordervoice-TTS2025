/**
 * Config Loader - Load API keys from .env file for local testing
 * This file reads .env and makes keys available to config.js
 */

// Simple .env file loader for browser
async function loadEnvConfig() {
  try {
    const response = await fetch('.env');
    if (!response.ok) {
      console.warn('[Config] .env file not found, using defaults');
      return {};
    }

    const text = await response.text();
    const env = {};

    text.split('\n').forEach(line => {
      line = line.trim();
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) return;

      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });

    return env;
  } catch (error) {
    console.warn('[Config] Error loading .env:', error);
    return {};
  }
}

// Make it available globally
window.loadEnvConfig = loadEnvConfig;
