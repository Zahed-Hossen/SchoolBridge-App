import AsyncStorage from '@react-native-async-storage/async-storage';

class NetworkDetectionService {
  static instance = null;

  constructor() {
    this.currentBaseUrl = null;
    this.isDetecting = false;
    this.detectionPromise = null;
  }

  static getInstance() {
    if (!NetworkDetectionService.instance) {
      NetworkDetectionService.instance = new NetworkDetectionService();
    }
    return NetworkDetectionService.instance;
  }

  // ✅ Main function: Auto-detect backend server
  async detectBackendServer() {
    // If detection is already in progress, wait for it
    if (this.isDetecting && this.detectionPromise) {
      console.log('🔄 Detection already in progress, waiting...');
      return await this.detectionPromise;
    }

    // If we already have a working URL, test it first
    if (this.currentBaseUrl) {
      const isStillWorking = await this.testServerConnection(this.currentBaseUrl);
      if (isStillWorking) {
        console.log('✅ Current server still working:', this.currentBaseUrl);
        return this.currentBaseUrl;
      }
    }

    // Start new detection
    this.isDetecting = true;
    this.detectionPromise = this._performDetection();

    try {
      const result = await this.detectionPromise;
      return result;
    } finally {
      this.isDetecting = false;
      this.detectionPromise = null;
    }
  }

  // ✅ Internal detection logic
  async _performDetection() {
    console.log('🔍 Starting backend server detection...');

    try {
      // Step 1: Try cached working IPs first
      console.log('📋 Step 1: Testing cached working IPs...');
      const recentIPs = await this.getRecentWorkingIPs();

      for (const ip of recentIPs) {
        console.log('🧪 Testing cached IP:', ip);
        if (await this.testServerConnection(ip)) {
          this.currentBaseUrl = ip;
          await this.saveWorkingIP(ip);
          console.log('✅ Found working server (cached):', ip);
          return ip;
        }
      }

      // Step 2: Scan network for servers
      console.log('📡 Step 2: Scanning network for servers...');
      const detectedIP = await this.scanNetworkForServers();

      if (detectedIP) {
        this.currentBaseUrl = detectedIP;
        await this.saveWorkingIP(detectedIP);
        console.log('✅ Found working server (scanned):', detectedIP);
        return detectedIP;
      }

      // Step 3: Fallback to localhost
      console.log('🏠 Step 3: Using localhost fallback');
      this.currentBaseUrl = 'http://localhost:5000/api';
      return this.currentBaseUrl;

    } catch (error) {
      console.error('❌ Detection failed:', error);
      this.currentBaseUrl = 'http://localhost:5000/api';
      return this.currentBaseUrl;
    }
  }

  // ✅ Test if a server is responding
  async testServerConnection(baseUrl) {
    try {
      console.log('🧪 Testing server connection:', baseUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const isValid = data.success || data.message || response.status === 200;
        console.log(isValid ? '✅ Server responds correctly' : '❌ Server response invalid');
        return isValid;
      }

      console.log('❌ Server responded with status:', response.status);
      return false;

    } catch (error) {
      console.log('❌ Server test failed:', baseUrl, error.message);
      return false;
    }
  }

  // ✅ Scan local network for backend servers
  async scanNetworkForServers() {
    console.log('🔍 Scanning local network...');

    // Get device's current IP to determine network range
    const deviceIP = await this.getDeviceIP();
    const networkRange = this.getNetworkRange(deviceIP);

    console.log('📱 Device IP:', deviceIP);
    console.log('🌐 Network range:', networkRange);

    // Generate test URLs
    const testUrls = this.generateTestUrls(networkRange);

    console.log('🎯 Testing', testUrls.length, 'possible servers...');

    // Test servers in batches to avoid overwhelming the network
    const batchSize = 5;
    for (let i = 0; i < testUrls.length; i += batchSize) {
      const batch = testUrls.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(url => this.testAndReturnUrl(url))
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          console.log('🎉 Found working server in batch!');
          return result.value;
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('❌ No servers found in network scan');
    return null;
  }

  // ✅ Get device IP (simplified for React Native)
  async getDeviceIP() {
    try {
      // Try to get IP from a simple web service
      const response = await fetch('https://api.ipify.org?format=json', {
        timeout: 5000,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ip && this.isPrivateIP(data.ip)) {
          return data.ip;
        }
      }
    } catch (error) {
      console.log('❌ Could not detect device IP via web service');
    }

    // Fallback: assume common network ranges
    return '192.168.0.100'; // Your current IP as fallback
  }

  // ✅ Check if IP is in private range
  isPrivateIP(ip) {
    const privateRanges = [
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    ];

    return privateRanges.some(range => range.test(ip));
  }

  // ✅ Extract network range from IP
  getNetworkRange(ip) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.`;
  }

  // ✅ Generate test URLs for network scanning
  generateTestUrls(networkRange) {
    const urls = [];

    // Common IP endings for servers/devices
    const commonEndings = [
      1, 2, 10, 20, 50, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110,
      200, 201, 202, 250, 254
    ];

    // Common ports for development servers
    const ports = [5000, 3000, 8080, 8000];

    // Generate URLs
    for (const ending of commonEndings) {
      for (const port of ports) {
        urls.push(`http://${networkRange}${ending}:${port}/api`);
      }
    }

    // Add localhost and emulator IPs
    urls.push('http://localhost:5000/api');
    urls.push('http://127.0.0.1:5000/api');
    urls.push('http://10.0.2.2:5000/api'); // Android emulator

    return urls;
  }

  // ✅ Test URL and return it if successful
  async testAndReturnUrl(url) {
    const isWorking = await this.testServerConnection(url);
    return isWorking ? url : null;
  }

  // ✅ Save working IP to device storage
  async saveWorkingIP(ip) {
    try {
      const workingIPs = await this.getRecentWorkingIPs();

      // Add to beginning (most recent first), remove duplicates
      const updatedIPs = [ip, ...workingIPs.filter(existingIP => existingIP !== ip)];

      // Keep only last 10 working IPs
      const limitedIPs = updatedIPs.slice(0, 10);

      await AsyncStorage.setItem('@schoolbridge_working_ips', JSON.stringify(limitedIPs));
      console.log('💾 Saved working IP:', ip);
      console.log('📋 Total saved IPs:', limitedIPs.length);

    } catch (error) {
      console.error('❌ Failed to save working IP:', error);
    }
  }

  // ✅ Get recently working IPs from storage
  async getRecentWorkingIPs() {
    try {
      const stored = await AsyncStorage.getItem('@schoolbridge_working_ips');
      const ips = stored ? JSON.parse(stored) : [];
      console.log('📋 Retrieved', ips.length, 'cached IPs');
      return ips;
    } catch (error) {
      console.error('❌ Failed to get working IPs:', error);
      return [];
    }
  }

  // ✅ Clear cached IPs (for testing)
  async clearCachedIPs() {
    try {
      await AsyncStorage.removeItem('@schoolbridge_working_ips');
      console.log('🗑️ Cleared cached IPs');
    } catch (error) {
      console.error('❌ Failed to clear cached IPs:', error);
    }
  }

  // ✅ Get current base URL
  getCurrentBaseUrl() {
    return this.currentBaseUrl;
  }

  // ✅ Force re-detection
  async forceRedetection() {
    console.log('🔄 Forcing server re-detection...');
    this.currentBaseUrl = null;
    this.isDetecting = false;
    this.detectionPromise = null;
    return await this.detectBackendServer();
  }

  // ✅ Get detection status
  getDetectionStatus() {
    return {
      isDetecting: this.isDetecting,
      currentUrl: this.currentBaseUrl,
      hasUrl: !!this.currentBaseUrl,
    };
  }
}

export default NetworkDetectionService;
