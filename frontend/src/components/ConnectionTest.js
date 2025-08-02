import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/config';
import {
  getTestableEndpoints,
  getCriticalEndpoints,
  getEndpointsByCategory,
  getAllCategories,
  API_ENDPOINTS
} from '../constants/apiEndpoints';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('untested');
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(['system', 'auth', 'content']);
  const [testOptions, setTestOptions] = useState({
    testCriticalOnly: false,
    testAuthEndpoints: false,
    includeDevEndpoints: true,
  });
  const [expandedSections, setExpandedSections] = useState({
    results: true,
    troubleshoot: true,
    devInfo: false,
    options: false,
  });

  // ✅ Animation values
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [progressAnimation] = useState(new Animated.Value(0));
  const [systemInfo, setSystemInfo] = useState({});

  // ✅ Get dynamic endpoints based on current configuration
  const getDynamicEndpoints = () => {
    let endpoints = [];

    if (testOptions.testCriticalOnly) {
      // Only test critical endpoints
      endpoints = getCriticalEndpoints();
    } else {
      // Test endpoints by selected categories
      selectedCategories.forEach(category => {
        endpoints.push(...getEndpointsByCategory(category));
      });
    }

    // Filter out auth endpoints if not testing them (unless user is logged in)
    if (!testOptions.testAuthEndpoints && !userToken) {
      endpoints = endpoints.filter(endpoint => !endpoint.requiresAuth);
    }

    // Filter out dev endpoints if not including them
    if (!testOptions.includeDevEndpoints) {
      endpoints = endpoints.filter(endpoint => endpoint.category !== 'development');
    }

    // Remove duplicates and sort by priority
    const uniqueEndpoints = endpoints.filter((endpoint, index, self) =>
      index === self.findIndex(e => e.url === endpoint.url)
    );

    return uniqueEndpoints.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // ✅ Check if user is authenticated
  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      setUserToken(token);
      return token;
    } catch (error) {
      console.log('Could not check authentication:', error);
      return null;
    }
  };

  // ✅ Enhanced system info collection
  const collectSystemInfo = async () => {
    try {
      const screen = Dimensions.get('screen');
      const window = Dimensions.get('window');
      const token = await checkAuthentication();

      const info = {
        // Platform Information
        platform: Platform.OS,
        platformVersion: Platform.Version,

        // Screen Information
        screenWidth: screen.width,
        screenHeight: screen.height,
        windowWidth: window.width,
        windowHeight: window.height,
        screenDensity: screen.scale,
        fontScale: screen.fontScale,

        // Authentication Status
        isAuthenticated: !!token,
        authTokenPresent: !!token,

        // API Configuration
        apiBaseUrl: API_CONFIG.BASE_URL,
        apiTimeout: API_CONFIG.TIMEOUT || 15000,

        // Test Configuration
        selectedCategories: selectedCategories,
        testOptions: testOptions,
        totalAvailableEndpoints: Object.keys(getTestableEndpoints()).length,
        endpointsToTest: getDynamicEndpoints().length,

        // Environment
        isDevelopment: __DEV__,
        deviceType: screen.width >= 768 ? 'tablet' : 'phone',
        orientation: screen.width > screen.height ? 'landscape' : 'portrait',
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: 'en-US',
        environment: __DEV__ ? 'Development' : 'Production',
        bundleMode: __DEV__ ? 'Debug' : 'Release',
      };

      setSystemInfo(info);
      return info;
    } catch (error) {
      console.warn('Could not collect system info:', error);
      const fallbackInfo = {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        timestamp: new Date().toISOString(),
        environment: __DEV__ ? 'Development' : 'Production',
      };
      setSystemInfo(fallbackInfo);
      return fallbackInfo;
    }
  };

  // ✅ Dynamic endpoint testing function
  const testConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    setConnectionStatus('testing');

    // ✅ Collect system info and get current auth status
    await collectSystemInfo();
    const token = await checkAuthentication();

    // ✅ Get dynamic endpoints to test
    const endpointsToTest = getDynamicEndpoints();

    console.log('🧪 Testing backend connection...');
    console.log('📡 Frontend Base URL:', API_CONFIG.BASE_URL);
    console.log('🎯 Testing endpoints:', endpointsToTest.map(e => e.name));
    console.log('🔐 Authentication:', token ? 'Available' : 'Not available');

    // ✅ Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnimation, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    const results = [];
    const totalEndpoints = endpointsToTest.length;

    for (let i = 0; i < endpointsToTest.length; i++) {
      const endpoint = endpointsToTest[i];

      // ✅ Update progress
      Animated.timing(progressAnimation, {
        toValue: (i / totalEndpoints),
        duration: 200,
        useNativeDriver: false,
      }).start();

      try {
        console.log(`🔗 Testing: ${endpoint.name} (${endpoint.url})`);

        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT || 15000);

        // ✅ Prepare headers
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };

        // ✅ Add authentication if required and available
        if (endpoint.requiresAuth && token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const requestOptions = {
          method: endpoint.method,
          headers: headers,
          signal: controller.signal,
        };

        // ✅ Add body for POST requests (if test data is provided)
        if (endpoint.method === 'POST' && endpoint.testData) {
          requestOptions.body = JSON.stringify(endpoint.testData);
        }

        const response = await fetch(endpoint.url, requestOptions);

        clearTimeout(timeoutId);
        const endTime = Date.now();

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          data = { error: 'Invalid JSON response', responseText: await response.text() };
        }

        const duration = endTime - startTime;
        const isSuccess = response.ok;

        const result = {
          name: endpoint.name,
          description: endpoint.description,
          url: endpoint.url,
          method: endpoint.method,
          category: endpoint.category,
          status: response.status,
          success: isSuccess,
          duration: `${duration}ms`,
          data: data,
          priority: endpoint.priority,
          requiresAuth: endpoint.requiresAuth,
          authUsed: endpoint.requiresAuth && !!token,
          timestamp: new Date().toISOString(),
          headers: Object.fromEntries(response.headers.entries()),
          responseSize: JSON.stringify(data).length,
        };

        // ✅ Handle authentication-specific responses
        if (endpoint.requiresAuth && !token) {
          result.warning = 'Authentication required but no token available';
          result.skipped = true;
        } else if (endpoint.requiresAuth && token && response.status === 401) {
          result.warning = 'Token may be expired or invalid';
        }

        results.push(result);

        if (isSuccess) {
          console.log(`✅ ${endpoint.name}: ${response.status} (${duration}ms)`);
        } else {
          console.log(`❌ ${endpoint.name}: ${response.status} - ${data.message || 'Error'}`);
        }

      } catch (error) {
        const result = {
          name: endpoint.name,
          description: endpoint.description,
          url: endpoint.url,
          method: endpoint.method,
          category: endpoint.category,
          status: 'ERROR',
          success: false,
          duration: 'timeout',
          error: error.message,
          priority: endpoint.priority,
          requiresAuth: endpoint.requiresAuth,
          timestamp: new Date().toISOString(),
          errorType: error.name || 'NetworkError',
        };

        results.push(result);
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }

    // ✅ Complete progress
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // ✅ Stop pulse animation
    pulseAnimation.stopAnimation();
    pulseAnimation.setValue(1);

    setTestResults(results);
    setIsLoading(false);

    // ✅ Calculate status
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const criticalFailures = results.filter(r => !r.success && r.priority === 'critical').length;

    if (criticalFailures > 0) {
      setConnectionStatus('critical');
      console.log(`🚨 Critical failures detected: ${criticalFailures}`);
    } else if (successCount === totalCount) {
      setConnectionStatus('success');
      console.log('🎉 All tested endpoints working!');
    } else if (successCount > 0) {
      setConnectionStatus('partial');
      console.log(`⚠️ ${successCount}/${totalCount} endpoints working`);
    } else {
      setConnectionStatus('failed');
      console.log('❌ No endpoints working');
    }
  };

  // ✅ Enhanced troubleshooting with endpoint-specific advice
  const generateDynamicTroubleshooting = () => {
    const failedResults = testResults.filter(result => !result.success && !result.skipped);
    const authFailures = testResults.filter(result => result.requiresAuth && (result.status === 401 || result.warning));
    const criticalFailures = failedResults.filter(result => result.priority === 'critical');

    const issues = [];
    const solutions = [];

    // ✅ Authentication-specific issues
    if (authFailures.length > 0) {
      issues.push({
        type: 'authentication',
        title: '🔐 Authentication Issues',
        description: `${authFailures.length} endpoints require authentication`,
        likelihood: 'high',
        impact: 'User features unavailable'
      });

      solutions.push({
        priority: 'high',
        title: 'Fix Authentication',
        actions: [
          userToken ? 'Token may be expired - try logging out and back in' : 'User not logged in - authenticate first',
          'Check if JWT tokens are properly stored',
          'Verify token format and expiration',
          'Test auth endpoints: /api/auth/login and /api/auth/validate',
          'Check server JWT secret configuration'
        ]
      });
    }

    // ✅ Category-specific issues
    const failedCategories = [...new Set(failedResults.map(r => r.category))];
    if (failedCategories.length > 0) {
      issues.push({
        type: 'category',
        title: '📂 Service Category Failures',
        description: `Issues in categories: ${failedCategories.join(', ')}`,
        likelihood: 'medium',
        impact: 'Specific features broken'
      });

      failedCategories.forEach(category => {
        const categoryEndpoints = failedResults.filter(r => r.category === category);
        solutions.push({
          priority: 'medium',
          title: `Fix ${category.charAt(0).toUpperCase() + category.slice(1)} Endpoints`,
          actions: [
            `Check routes for ${category} endpoints in server`,
            `Verify ${category} route handlers are implemented`,
            `Test specific endpoints: ${categoryEndpoints.map(e => e.name).join(', ')}`,
            `Check ${category}-specific middleware and authentication`,
            `Review ${category} service configuration`
          ]
        });
      });
    }

    // ✅ Method-specific issues
    const postFailures = failedResults.filter(r => r.method === 'POST');
    if (postFailures.length > 0) {
      solutions.push({
        priority: 'medium',
        title: 'Fix POST Endpoint Issues',
        actions: [
          'Check CORS configuration for POST requests',
          'Verify Content-Type headers are accepted',
          'Check request body validation',
          'Review POST route middleware',
          'Test with proper request data format'
        ]
      });
    }

    // ✅ Critical system failures
    if (criticalFailures.length > 0) {
      issues.push({
        type: 'critical',
        title: '🚨 Critical System Failure',
        description: `${criticalFailures.length} essential endpoints down`,
        likelihood: 'high',
        impact: 'App completely non-functional'
      });

      solutions.push({
        priority: 'immediate',
        title: 'Fix Critical System Issues',
        actions: [
          'Check if backend server is running',
          'Verify MongoDB connection',
          'Check server console for errors',
          'Restart backend server',
          'Verify network connectivity',
          `Test critical endpoints: ${criticalFailures.map(f => f.name).join(', ')}`
        ]
      });
    }

    return { issues, solutions };
  };

  // ✅ Category toggle function
  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // ✅ Test option toggle
  const toggleTestOption = (option) => {
    setTestOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await testConnection();
    setRefreshing(false);
  };

  useEffect(() => {
    collectSystemInfo();
    testConnection();
  }, [selectedCategories, testOptions]);

  // ✅ Status and UI helper functions remain the same...
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#27AE60';
      case 'partial': return '#F39C12';
      case 'failed': return '#E74C3C';
      case 'critical': return '#C0392B';
      case 'testing': return '#3498DB';
      default: return '#7F8C8D';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return '✅ All Systems Operational';
      case 'partial': return '⚠️ Partial Connection';
      case 'failed': return '❌ Connection Failed';
      case 'critical': return '🚨 Critical Failures';
      case 'testing': return '⏳ Testing in Progress...';
      default: return '🔄 Ready to Test';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#C0392B';
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#7F8C8D';
      default: return '#3498DB';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'system': return '#3498DB';
      case 'auth': return '#E67E22';
      case 'content': return '#27AE60';
      case 'user': return '#9B59B6';
      case 'student': return '#2ECC71';
      case 'development': return '#95A5A6';
      default: return '#34495E';
    }
  };

  // ... rest of your component logic and render method

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E86AB']}
            tintColor="#2E86AB"
            title="Pull to test connection..."
          />
        }
      >
        {/* ✅ Enhanced Status Dashboard */}
        <View style={styles.dashboardContainer}>
          <Text style={styles.title}>🔗 Dynamic API Connection Test</Text>

          <Animated.View
            style={[
              styles.statusCard,
              { transform: [{ scale: isLoading ? pulseAnimation : 1 }] },
            ]}
          >
            <View style={styles.statusHeader}>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(connectionStatus) },
                ]}
              >
                {getStatusText(connectionStatus)}
              </Text>
              <Text style={styles.timestampText}>
                {new Date().toLocaleString()}
              </Text>
            </View>

            {/* ✅ Testing Statistics */}
            {testResults.length > 0 && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {testResults.filter((r) => r.success).length}/
                    {testResults.length}
                  </Text>
                  <Text style={styles.statLabel}>Endpoints Working</Text>
                </View>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statNumber,
                      { color: getCategoryColor('auth') },
                    ]}
                  >
                    {testResults.filter((r) => r.category === 'auth').length}
                  </Text>
                  <Text style={styles.statLabel}>Auth Endpoints</Text>
                </View>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statNumber,
                      { color: getPriorityColor('critical') },
                    ]}
                  >
                    {
                      testResults.filter((r) => r.priority === 'critical')
                        .length
                    }
                  </Text>
                  <Text style={styles.statLabel}>Critical</Text>
                </View>
              </View>
            )}

            {/* ✅ Progress Bar (during testing) */}
            {isLoading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  Testing endpoints... {testResults.length}/
                  {getDynamicEndpoints().length}
                </Text>
              </View>
            )}

            {/* ✅ Configuration Info */}
            <View style={styles.configContainer}>
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>API Base:</Text>
                <Text style={styles.configValue}>{API_CONFIG.BASE_URL}</Text>
              </View>
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Authentication:</Text>
                <Text
                  style={[
                    styles.configValue,
                    { color: userToken ? '#27AE60' : '#E74C3C' },
                  ]}
                >
                  {userToken ? 'Available' : 'Not Available'}
                </Text>
              </View>
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Categories:</Text>
                <Text style={styles.configValue}>
                  {selectedCategories.join(', ')}
                </Text>
              </View>
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Endpoints to Test:</Text>
                <Text style={styles.configValue}>
                  {getDynamicEndpoints().length}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* ✅ Test Configuration Options */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('options')}
            >
              <Text style={styles.sectionTitle}>⚙️ Test Configuration</Text>
              <Text style={styles.expandIcon}>
                {expandedSections.options ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSections.options && (
              <View style={styles.optionsContent}>
                {/* ✅ Category Selection */}
                <Text style={styles.optionGroupTitle}>📂 Test Categories:</Text>
                <View style={styles.categoryGrid}>
                  {getAllCategories().map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        selectedCategories.includes(category) &&
                          styles.categoryChipSelected,
                        { borderColor: getCategoryColor(category) },
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selectedCategories.includes(category) &&
                            styles.categoryChipTextSelected,
                          {
                            color: selectedCategories.includes(category)
                              ? 'white'
                              : getCategoryColor(category),
                          },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* ✅ Test Options */}
                <Text style={styles.optionGroupTitle}>🎯 Test Options:</Text>
                <View style={styles.optionsGrid}>
                  <TouchableOpacity
                    style={[
                      styles.optionChip,
                      testOptions.testCriticalOnly && styles.optionChipSelected,
                    ]}
                    onPress={() => toggleTestOption('testCriticalOnly')}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        testOptions.testCriticalOnly &&
                          styles.optionChipTextSelected,
                      ]}
                    >
                      🚨 Critical Only
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.optionChip,
                      testOptions.testAuthEndpoints &&
                        styles.optionChipSelected,
                    ]}
                    onPress={() => toggleTestOption('testAuthEndpoints')}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        testOptions.testAuthEndpoints &&
                          styles.optionChipTextSelected,
                      ]}
                    >
                      🔐 Test Auth Endpoints
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.optionChip,
                      testOptions.includeDevEndpoints &&
                        styles.optionChipSelected,
                    ]}
                    onPress={() => toggleTestOption('includeDevEndpoints')}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        testOptions.includeDevEndpoints &&
                          styles.optionChipTextSelected,
                      ]}
                    >
                      👨‍💻 Include Dev Endpoints
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* ✅ Quick Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.testButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={testConnection}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>
                {isLoading ? '⏳ Testing...' : '🔄 Run Test'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.criticalButton]}
              onPress={() => {
                setTestOptions((prev) => ({ ...prev, testCriticalOnly: true }));
                setSelectedCategories(['system', 'auth']);
              }}
            >
              <Text style={styles.actionButtonText}>🚨 Critical Only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={() => {
                const exportData = {
                  timestamp: new Date().toISOString(),
                  status: connectionStatus,
                  frontend_url: API_CONFIG.BASE_URL,
                  results: testResults,
                  system_info: systemInfo,
                  test_configuration: {
                    selectedCategories,
                    testOptions,
                    endpointsTested: getDynamicEndpoints().length,
                    authenticationStatus: !!userToken,
                  },
                  troubleshooting: generateDynamicTroubleshooting(),
                  summary: {
                    total_endpoints: testResults.length,
                    successful: testResults.filter((r) => r.success).length,
                    failed: testResults.filter((r) => !r.success && !r.skipped)
                      .length,
                    skipped: testResults.filter((r) => r.skipped).length,
                    critical_failures: testResults.filter(
                      (r) => !r.success && r.priority === 'critical',
                    ).length,
                  },
                };

                console.log(
                  '📋 Dynamic Connection Test Export:',
                  JSON.stringify(exportData, null, 2),
                );
                Alert.alert(
                  '📋 Results Exported',
                  `Dynamic test results exported to console.\n\nTested: ${
                    testResults.length
                  } endpoints\nSuccessful: ${
                    testResults.filter((r) => r.success).length
                  }\nFailed: ${
                    testResults.filter((r) => !r.success && !r.skipped).length
                  }\n\nCheck console for full report.`,
                  [{ text: 'Got it!' }],
                );
              }}
            >
              <Text style={styles.actionButtonText}>📋 Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ Enhanced Test Results with Categories */}
        {testResults.length > 0 && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('results')}
            >
              <Text style={styles.sectionTitle}>
                📊 Test Results ({testResults.filter((r) => r.success).length}/
                {testResults.length})
              </Text>
              <Text style={styles.expandIcon}>
                {expandedSections.results ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSections.results && (
              <View style={styles.sectionContent}>
                {/* ✅ Results by Category */}
                {getAllCategories().map((category) => {
                  const categoryResults = testResults.filter(
                    (r) => r.category === category,
                  );
                  if (categoryResults.length === 0) return null;

                  return (
                    <View key={category} style={styles.categorySection}>
                      <View style={styles.categoryHeader}>
                        <Text
                          style={[
                            styles.categoryTitle,
                            { color: getCategoryColor(category) },
                          ]}
                        >
                          📂{' '}
                          {category.charAt(0).toUpperCase() + category.slice(1)}{' '}
                          ({categoryResults.filter((r) => r.success).length}/
                          {categoryResults.length})
                        </Text>
                      </View>

                      {categoryResults.map((result, index) => (
                        <View
                          key={`${category}-${index}`}
                          style={[
                            styles.resultCard,
                            result.success
                              ? styles.successCard
                              : result.skipped
                              ? styles.skippedCard
                              : styles.errorCard,
                          ]}
                        >
                          <View style={styles.resultHeader}>
                            <Text style={styles.resultName}>
                              {result.success
                                ? '✅'
                                : result.skipped
                                ? '⏭️'
                                : '❌'}{' '}
                              {result.name}
                              {result.priority === 'critical' && (
                                <Text style={styles.criticalBadge}>
                                  {' '}
                                  CRITICAL
                                </Text>
                              )}
                              {result.requiresAuth && (
                                <Text style={styles.authBadge}> 🔐</Text>
                              )}
                            </Text>
                            <View style={styles.resultBadges}>
                              <View
                                style={[
                                  styles.priorityBadge,
                                  {
                                    backgroundColor: getPriorityColor(
                                      result.priority,
                                    ),
                                  },
                                ]}
                              >
                                <Text style={styles.priorityText}>
                                  {result.priority}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.methodBadge,
                                  {
                                    backgroundColor:
                                      result.method === 'GET'
                                        ? '#27AE60'
                                        : '#E67E22',
                                  },
                                ]}
                              >
                                <Text style={styles.methodText}>
                                  {result.method}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <Text style={styles.resultDescription}>
                            {result.description}
                          </Text>

                          <Text style={styles.resultDetails}>
                            Status: {result.status} | Duration:{' '}
                            {result.duration}
                            {result.authUsed && ' | Auth: Used'}
                          </Text>

                          <Text
                            style={styles.resultUrl}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                          >
                            {result.url}
                          </Text>

                          {result.warning && (
                            <View style={styles.warningContainer}>
                              <Text style={styles.warningText}>
                                ⚠️ {result.warning}
                              </Text>
                            </View>
                          )}

                          {result.error && (
                            <View style={styles.errorContainer}>
                              <Text style={styles.errorText}>
                                🚨 {result.error}
                              </Text>
                              {result.errorType && (
                                <Text style={styles.errorType}>
                                  Type: {result.errorType}
                                </Text>
                              )}
                            </View>
                          )}

                          {result.data && result.success && (
                            <View style={styles.dataContainer}>
                              <Text style={styles.dataLabel}>
                                📋 Response Preview:
                              </Text>
                              <Text style={styles.dataText} numberOfLines={2}>
                                {typeof result.data === 'string'
                                  ? result.data
                                  : JSON.stringify(result.data, null, 2)}
                              </Text>
                              {result.responseSize && (
                                <Text style={styles.responseSize}>
                                  Size: {result.responseSize} bytes
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ✅ Enhanced Troubleshooting Section */}
        {testResults.length > 0 && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('troubleshoot')}
            >
              <Text style={styles.sectionTitle}>🔧 Smart Troubleshooting</Text>
              <Text style={styles.expandIcon}>
                {expandedSections.troubleshoot ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSections.troubleshoot && (
              <View style={styles.troubleshootContent}>
                {(() => {
                  const { issues, solutions } =
                    generateDynamicTroubleshooting();

                  return (
                    <>
                      {/* ✅ Quick Stats */}
                      <View style={styles.troubleshootStats}>
                        <View style={styles.troubleshootStatItem}>
                          <Text style={styles.troubleshootStatNumber}>
                            {
                              testResults.filter(
                                (r) => !r.success && !r.skipped,
                              ).length
                            }
                          </Text>
                          <Text style={styles.troubleshootStatLabel}>
                            Failed
                          </Text>
                        </View>
                        <View style={styles.troubleshootStatItem}>
                          <Text style={styles.troubleshootStatNumber}>
                            {testResults.filter((r) => r.skipped).length}
                          </Text>
                          <Text style={styles.troubleshootStatLabel}>
                            Skipped
                          </Text>
                        </View>
                        <View style={styles.troubleshootStatItem}>
                          <Text style={styles.troubleshootStatNumber}>
                            {testResults.filter((r) => r.warning).length}
                          </Text>
                          <Text style={styles.troubleshootStatLabel}>
                            Warnings
                          </Text>
                        </View>
                        <View style={styles.troubleshootStatItem}>
                          <Text style={styles.troubleshootStatNumber}>
                            {
                              testResults.filter(
                                (r) => r.priority === 'critical' && !r.success,
                              ).length
                            }
                          </Text>
                          <Text style={styles.troubleshootStatLabel}>
                            Critical Issues
                          </Text>
                        </View>
                      </View>

                      {/* ✅ Dynamic Issues */}
                      {issues.length > 0 && (
                        <View style={styles.issuesContainer}>
                          <Text style={styles.categoryTitle}>
                            🚨 Detected Issues
                          </Text>
                          {issues.map((issue, index) => (
                            <View
                              key={index}
                              style={[
                                styles.issueItem,
                                {
                                  borderLeftColor:
                                    issue.type === 'critical'
                                      ? '#C0392B'
                                      : issue.type === 'authentication'
                                      ? '#E67E22'
                                      : issue.type === 'high'
                                      ? '#E74C3C'
                                      : '#3498DB',
                                },
                              ]}
                            >
                              <Text style={styles.issueTitle}>
                                {issue.title}
                              </Text>
                              <Text style={styles.issueDescription}>
                                {issue.description}
                              </Text>
                              <Text style={styles.issueLikelihood}>
                                Likelihood: {issue.likelihood} | Impact:{' '}
                                {issue.impact}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* ✅ Dynamic Solutions */}
                      {solutions.length > 0 && (
                        <View style={styles.solutionsContainer}>
                          <Text style={styles.categoryTitle}>
                            💡 Recommended Solutions
                          </Text>
                          {solutions.map((solution, index) => (
                            <View
                              key={index}
                              style={[
                                styles.solutionItem,
                                {
                                  borderLeftColor:
                                    solution.priority === 'immediate'
                                      ? '#C0392B'
                                      : solution.priority === 'high'
                                      ? '#E74C3C'
                                      : '#27AE60',
                                },
                              ]}
                            >
                              <Text style={styles.solutionTitle}>
                                {solution.title}
                              </Text>
                              {solution.actions.map((action, actionIndex) => (
                                <Text
                                  key={actionIndex}
                                  style={styles.solutionAction}
                                >
                                  • {action}
                                </Text>
                              ))}
                            </View>
                          ))}
                        </View>
                      )}

                      {/* ✅ Quick Action Suggestions */}
                      <View style={styles.quickActionsContainer}>
                        <Text style={styles.categoryTitle}>
                          ⚡ Quick Actions
                        </Text>

                        {!userToken &&
                          testResults.some((r) => r.requiresAuth) && (
                            <TouchableOpacity
                              style={styles.quickActionButton}
                              onPress={() =>
                                Alert.alert(
                                  'Authentication Required',
                                  'Please log in to test authenticated endpoints.\n\nGo to Login screen and sign in, then run the connection test again.',
                                )
                              }
                            >
                              <Text style={styles.quickActionText}>
                                🔐 Login to Test Auth Endpoints
                              </Text>
                            </TouchableOpacity>
                          )}

                        {testResults.filter(
                          (r) => r.priority === 'critical' && !r.success,
                        ).length > 0 && (
                          <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => {
                              setTestOptions((prev) => ({
                                ...prev,
                                testCriticalOnly: true,
                              }));
                              setSelectedCategories(['system']);
                            }}
                          >
                            <Text style={styles.quickActionText}>
                              🚨 Test Critical Endpoints Only
                            </Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={styles.quickActionButton}
                          onPress={() => {
                            const backendIP =
                              API_CONFIG.BASE_URL.match(/\/\/([^:]+):/)?.[1] ||
                              'unknown';
                            const url = `http://${backendIP}:5000/api/health`;
                            Alert.alert(
                              'Browser Test',
                              `Test this URL in your browser:\n\n${url}\n\nShould return JSON with health information.`,
                              [{ text: 'Got it!' }],
                            );
                          }}
                        >
                          <Text style={styles.quickActionText}>
                            🌐 Test in Browser
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  );
                })()}
              </View>
            )}
          </View>
        )}

        {/* ✅ Enhanced System Information */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('devInfo')}
          >
            <Text style={styles.sectionTitle}>👨‍💻 System Information</Text>
            <Text style={styles.expandIcon}>
              {expandedSections.devInfo ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {expandedSections.devInfo && (
            <View style={styles.devInfoContent}>
              {/* ✅ Platform Information */}
              <View style={styles.infoCategory}>
                <Text style={styles.infoCategoryTitle}>
                  📱 Platform Information
                </Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Platform:</Text>
                    <Text style={styles.infoValue}>{systemInfo.platform}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Version:</Text>
                    <Text style={styles.infoValue}>
                      {systemInfo.platformVersion}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Device Type:</Text>
                    <Text style={styles.infoValue}>
                      {systemInfo.deviceType}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Orientation:</Text>
                    <Text style={styles.infoValue}>
                      {systemInfo.orientation}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ✅ Screen Information */}
              <View style={styles.infoCategory}>
                <Text style={styles.infoCategoryTitle}>🖥️ Display</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Screen Size:</Text>
                    <Text style={styles.infoValue}>
                      {systemInfo.screenWidth}×{systemInfo.screenHeight}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Window Size:</Text>
                    <Text style={styles.infoValue}>
                      {systemInfo.windowWidth}×{systemInfo.windowHeight}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Density:</Text>
                    <Text style={styles.infoValue}>
                      {systemInfo.screenDensity}x
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Font Scale:</Text>
                    <Text style={styles.infoValue}>
                      {systemInfo.fontScale}x
                    </Text>
                  </View>
                </View>
              </View>

              {/* ✅ Application Information */}
              <View style={styles.infoCategory}>
                <Text style={styles.infoCategoryTitle}>📦 Application</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Environment:</Text>
                    <Text style={styles.infoValue}>
                      {systemInfo.environment}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Bundle Mode:</Text>
                    <Text style={styles.infoValue}>
                      {systemInfo.bundleMode}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>API Base:</Text>
                    <Text style={styles.infoValue}>{API_CONFIG.BASE_URL}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Timeout:</Text>
                    <Text style={styles.infoValue}>
                      {API_CONFIG.TIMEOUT || 15000}ms
                    </Text>
                  </View>
                </View>
              </View>

              {/* ✅ Runtime Information */}
              <View style={styles.infoCategory}>
                <Text style={styles.infoCategoryTitle}>⏰ Runtime</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Timezone:</Text>
                    <Text style={styles.infoValue}>{systemInfo.timezone}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Language:</Text>
                    <Text style={styles.infoValue}>{systemInfo.language}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Session Started:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(systemInfo.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Connection Type:</Text>
                    <Text style={styles.infoValue}>
                      {systemInfo.connectionType}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ✅ Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

// ✅ Add new styles for the enhanced UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  // ✅ Dashboard styles
  dashboardContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E86AB',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },

  // ✅ NEW: Statistics Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },

  // ✅ Progress Bar
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498DB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },

  // ✅ Configuration Container
  configContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D6D7E',
    flex: 1,
  },
  configValue: {
    fontSize: 12,
    color: '#2C3E50',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 2,
    textAlign: 'right',
  },

  // ✅ Enhanced Sections
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  expandIcon: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: 'bold',
  },
  sectionContent: {
    padding: 16,
  },

  // ✅ NEW: Options Content
  optionsContent: {
    padding: 16,
  },
  optionGroupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498DB',
    marginBottom: 12,
  },

  // ✅ Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  categoryChipSelected: {
    backgroundColor: '#3498DB',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: 'white',
  },

  // ✅ Options Grid
  optionsGrid: {
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  optionChipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#3498DB',
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D6D7E',
    textAlign: 'center',
  },
  optionChipTextSelected: {
    color: '#3498DB',
  },

  // ✅ Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#3498DB',
  },
  criticalButton: {
    backgroundColor: '#E74C3C',
  },
  exportButton: {
    backgroundColor: '#27AE60',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // ✅ Category Section
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E9ECEF',
  },

  // ✅ Enhanced Results
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  successCard: {
    backgroundColor: '#D5EDDA',
    borderLeftColor: '#27AE60',
  },
  errorCard: {
    backgroundColor: '#F8D7DA',
    borderLeftColor: '#E74C3C',
  },
  skippedCard: {
    backgroundColor: '#FFF3CD',
    borderLeftColor: '#F39C12',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    marginRight: 8,
  },
  resultBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  criticalBadge: {
    fontSize: 10,
    color: '#C0392B',
    fontWeight: 'bold',
  },
  authBadge: {
    fontSize: 10,
    color: '#E67E22',
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  methodText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resultDescription: {
    fontSize: 13,
    color: '#5D6D7E',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  resultDetails: {
    fontSize: 14,
    color: '#5D6D7E',
    marginBottom: 4,
  },
  resultUrl: {
    fontSize: 11,
    color: '#85929E',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },

  // ✅ Warning Container
  warningContainer: {
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F39C12',
  },
  warningText: {
    fontSize: 12,
    color: '#B7950B',
    fontWeight: '600',
  },

  errorContainer: {
    backgroundColor: '#FADBD8',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#C0392B',
    fontWeight: '600',
  },
  errorType: {
    fontSize: 10,
    color: '#85929E',
    marginTop: 4,
    fontStyle: 'italic',
  },
  dataContainer: {
    backgroundColor: '#D4F6D4',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  dataLabel: {
    fontSize: 12,
    color: '#1E8449',
    fontWeight: '600',
    marginBottom: 4,
  },
  dataText: {
    fontSize: 10,
    color: '#27AE60',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 14,
  },
  responseSize: {
    fontSize: 10,
    color: '#85929E',
    marginTop: 4,
    textAlign: 'right',
  },

  // ✅ Troubleshooting Styles
  troubleshootContent: {
    padding: 16,
  },

  // ✅ Troubleshoot Stats
  troubleshootStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  troubleshootStatItem: {
    alignItems: 'center',
  },
  troubleshootStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  troubleshootStatLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginTop: 2,
  },

  // Issues
  issuesContainer: {
    marginBottom: 20,
  },
  issueItem: {
    backgroundColor: '#FEF9E7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  issueTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D68910',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 13,
    color: '#7D6608',
    marginBottom: 4,
  },
  issueLikelihood: {
    fontSize: 11,
    color: '#B7950B',
    fontStyle: 'italic',
  },

  // Solutions
  solutionsContainer: {
    marginBottom: 20,
  },
  solutionItem: {
    backgroundColor: '#E8F8F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  solutionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E8449',
    marginBottom: 8,
  },
  solutionAction: {
    fontSize: 13,
    color: '#27AE60',
    lineHeight: 18,
    marginBottom: 2,
    paddingLeft: 8,
  },

  // Category titles
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 12,
  },

  // ✅ Quick Actions
  quickActionsContainer: {
    marginBottom: 10,
  },
  quickActionButton: {
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498DB',
  },
  quickActionText: {
    fontSize: 14,
    color: '#2980B9',
    fontWeight: '600',
  },

  // ✅ Dynamic Dev Info Styles
  devInfoContent: {
    padding: 16,
  },
  infoCategory: {
    marginBottom: 20,
  },
  infoCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498DB',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E3F2FD',
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D6D7E',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    textAlign: 'right',
  },

  // ✅ Bottom Spacer
  bottomSpacer: {
    height: 80,
  },
});

export default ConnectionTest;





































































// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   RefreshControl,
//   Platform,
//   Alert,
//   Animated,
// } from 'react-native';
// import { API_CONFIG } from '../constants/config';

// const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// const ConnectionTest = () => {
//   const [connectionStatus, setConnectionStatus] = useState('untested');
//   const [testResults, setTestResults] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [expandedSections, setExpandedSections] = useState({
//     results: true,
//     troubleshoot: true,
//     devInfo: false,
//   });

//   // ✅ NEW: Built-in system information (no external dependencies)
//   const [systemInfo, setSystemInfo] = useState({});

//   // ✅ Animation values
//   const [pulseAnimation] = useState(new Animated.Value(1));
//   const [progressAnimation] = useState(new Animated.Value(0));

//   const testEndpoints = [
//     { name: 'Health Check', url: `${API_CONFIG.BASE_URL}/health`, priority: 'high', critical: true },
//     { name: 'Test Endpoint', url: `${API_CONFIG.BASE_URL}/test`, priority: 'high', critical: true },
//     { name: 'Announcements', url: `${API_CONFIG.BASE_URL}/announcements`, priority: 'medium', critical: false },
//     { name: 'Dev Info', url: `${API_CONFIG.BASE_URL}/dev/info`, priority: 'low', critical: false },
//     { name: 'Status', url: `${API_CONFIG.BASE_URL}/status`, priority: 'medium', critical: false },
//   ];

//   // ✅ NEW: Collect system information using built-in APIs only
//   const collectSystemInfo = async () => {
//     try {
//       const screen = Dimensions.get('screen');
//       const window = Dimensions.get('window');

//       const info = {
//         // Platform Information
//         platform: Platform.OS,
//         platformVersion: Platform.Version,

//         // Screen Information
//         screenWidth: screen.width,
//         screenHeight: screen.height,
//         windowWidth: window.width,
//         windowHeight: window.height,
//         screenDensity: screen.scale,
//         fontScale: screen.fontScale,

//         // Environment
//         isDevelopment: __DEV__,

//         // Estimated device type
//         deviceType: screen.width >= 768 ? 'tablet' : 'phone',
//         orientation: screen.width > screen.height ? 'landscape' : 'portrait',

//         // Runtime Information
//         timestamp: new Date().toISOString(),
//         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//         language: 'en-US', // Default fallback

//         // Performance estimates
//         estimatedMemory: Platform.OS === 'ios' ? '4GB+' : '2-8GB',

//         // Network estimation
//         connectionType: 'WiFi/Cellular',

//         // App information
//         environment: __DEV__ ? 'Development' : 'Production',
//         bundleMode: __DEV__ ? 'Debug' : 'Release',
//       };

//       setSystemInfo(info);
//       return info;
//     } catch (error) {
//       console.warn('Could not collect system info:', error);
//       const fallbackInfo = {
//         platform: Platform.OS,
//         platformVersion: Platform.Version,
//         screenWidth,
//         screenHeight,
//         timestamp: new Date().toISOString(),
//         environment: __DEV__ ? 'Development' : 'Production',
//       };
//       setSystemInfo(fallbackInfo);
//       return fallbackInfo;
//     }
//   };

//   // ✅ NEW: Dynamic troubleshooting based on actual results
//   const generateDynamicTroubleshooting = () => {
//     const failedResults = testResults.filter(result => !result.success);
//     const successResults = testResults.filter(result => result.success);
//     const criticalFailures = failedResults.filter(result =>
//       testEndpoints.find(ep => ep.name === result.name)?.critical
//     );

//     const issues = [];
//     const solutions = [];

//     // ✅ Analyze failure patterns
//     if (failedResults.length === testResults.length) {
//       // Complete failure
//       issues.push({
//         type: 'critical',
//         title: '🚨 Complete Connection Failure',
//         description: 'All endpoints are unreachable',
//         likelihood: 'high',
//         impact: 'App completely non-functional'
//       });

//       solutions.push({
//         priority: 'immediate',
//         title: '1. Check Backend Server Status',
//         actions: [
//           'Open terminal and navigate to backend folder',
//           'Run: npm run dev or node server.js',
//           'Check console for error messages',
//           'Ensure MongoDB is running and connected',
//           'Verify port 5000 is not blocked'
//         ]
//       });

//       solutions.push({
//         priority: 'immediate',
//         title: '2. Verify Network Configuration',
//         actions: [
//           `Current IP: ${getBackendIP()} - Check if correct`,
//           'Run ipconfig (Windows) or ifconfig (Mac/Linux)',
//           'Ensure mobile and computer on same WiFi network',
//           'Test backend in browser: http://${getBackendIP()}:5000/api/health',
//           'Disable VPN if active'
//         ]
//       });

//     } else if (criticalFailures.length > 0) {
//       // Critical endpoints failing
//       issues.push({
//         type: 'high',
//         title: '⚠️ Critical System Failure',
//         description: `${criticalFailures.length} essential endpoints down`,
//         likelihood: 'medium',
//         impact: 'Core functionality broken'
//       });

//       solutions.push({
//         priority: 'high',
//         title: 'Fix Critical Endpoints',
//         actions: [
//           'Check backend route definitions',
//           'Verify database connectivity',
//           'Review recent code changes',
//           'Check server logs for specific errors',
//           'Restart backend server completely'
//         ]
//       });
//     }

//     // ✅ Analyze response times
//     const slowResults = successResults.filter(result =>
//       parseInt(result.duration) > 3000
//     );

//     if (slowResults.length > 0) {
//       issues.push({
//         type: 'performance',
//         title: '🐌 Performance Degradation',
//         description: `${slowResults.length} endpoints responding slowly (>3s)`,
//         likelihood: 'medium',
//         impact: 'Poor user experience'
//       });

//       solutions.push({
//         priority: 'medium',
//         title: 'Optimize Performance',
//         actions: [
//           'Check database query efficiency',
//           'Monitor server CPU and memory usage',
//           'Test network speed and stability',
//           'Review API endpoint implementations',
//           'Consider adding caching layers'
//         ]
//       });
//     }

//     // ✅ Analyze timeout patterns
//     const timeoutErrors = failedResults.filter(result =>
//       result.error && (result.error.includes('timeout') || result.error.includes('aborted'))
//     );

//     if (timeoutErrors.length > 0) {
//       issues.push({
//         type: 'network',
//         title: '⏱️ Network Timeout Issues',
//         description: `${timeoutErrors.length} requests timing out`,
//         likelihood: 'high',
//         impact: 'Unreliable connectivity'
//       });

//       solutions.push({
//         priority: 'high',
//         title: 'Resolve Network Timeouts',
//         actions: [
//           'Increase fetch timeout to 15000ms',
//           'Check WiFi signal strength',
//           'Test with mobile data vs WiFi',
//           'Restart router/modem if persistent',
//           'Check for network interference'
//         ]
//       });
//     }

//     // ✅ Platform-specific issues
//     if (Platform.OS === 'android' && failedResults.length > 0) {
//       solutions.push({
//         priority: 'medium',
//         title: 'Android-Specific Fixes',
//         actions: [
//           'Clear Metro cache: npx react-native start --reset-cache',
//           'Check Android network security config',
//           'Verify INTERNET permission in AndroidManifest.xml',
//           'Test on physical device vs emulator',
//           'Check Android firewall settings'
//         ]
//       });
//     }

//     if (Platform.OS === 'ios' && failedResults.length > 0) {
//       solutions.push({
//         priority: 'medium',
//         title: 'iOS-Specific Fixes',
//         actions: [
//           'Check App Transport Security settings',
//           'Verify NSAppTransportSecurity in Info.plist',
//           'Test on physical device vs simulator',
//           'Check iOS network permissions',
//           'Restart iOS Simulator'
//         ]
//       });
//     }

//     // ✅ IP Address analysis
//     const currentIP = API_CONFIG.BASE_URL.match(/\/\/([^:]+):/)?.[1];
//     const expectedIP = '192.168.0.102';

//     if (currentIP !== expectedIP) {
//       issues.push({
//         type: 'configuration',
//         title: '🌐 IP Address Configuration Error',
//         description: `Using ${currentIP}, but expected ${expectedIP}`,
//         likelihood: 'high',
//         impact: 'Cannot reach backend server'
//       });

//       solutions.push({
//         priority: 'immediate',
//         title: 'Fix IP Address Configuration',
//         actions: [
//           `Update API_CONFIG.BASE_URL to http://${expectedIP}:5000/api`,
//           'Restart Expo development server',
//           'Clear Metro bundler cache',
//           'Verify backend is running on correct IP',
//           'Check computer\'s current IP address'
//         ]
//       });
//     }

//     return { issues, solutions };
//   };

//   // ✅ Helper function to extract backend IP
//   const getBackendIP = () => {
//     return API_CONFIG.BASE_URL.match(/\/\/([^:]+):/)?.[1] || 'unknown';
//   };

//   // ✅ NEW: Generate comprehensive network analysis
//   const generateNetworkAnalysis = () => {
//     const analysis = {
//       backendIP: getBackendIP(),
//       configuredURL: API_CONFIG.BASE_URL,
//       expectedURL: 'http://192.168.0.102:5000/api',
//       platform: Platform.OS,
//       latency: [],
//       reliability: 0,
//       averageResponseTime: 0,
//       healthScore: 0,
//     };

//     // Calculate metrics from test results
//     const successfulResults = testResults.filter(r => r.success);
//     if (successfulResults.length > 0) {
//       analysis.latency = successfulResults.map(r => parseInt(r.duration) || 0);
//       analysis.reliability = (successfulResults.length / testResults.length) * 100;
//       analysis.averageResponseTime = analysis.latency.reduce((a, b) => a + b, 0) / analysis.latency.length;

//       // Calculate health score (0-100)
//       let healthScore = analysis.reliability;
//       if (analysis.averageResponseTime < 1000) healthScore += 10;
//       else if (analysis.averageResponseTime > 3000) healthScore -= 20;

//       analysis.healthScore = Math.max(0, Math.min(100, healthScore));
//     }

//     return analysis;
//   };

//   const testConnection = async () => {
//     setIsLoading(true);
//     setTestResults([]);
//     setConnectionStatus('testing');

//     // ✅ Collect system info
//     await collectSystemInfo();

//     // ✅ Start pulse animation
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnimation, { toValue: 1.2, duration: 800, useNativeDriver: true }),
//         Animated.timing(pulseAnimation, { toValue: 1, duration: 800, useNativeDriver: true }),
//       ])
//     ).start();

//     console.log('🧪 Testing backend connection...');
//     console.log('📡 Frontend Base URL:', API_CONFIG.BASE_URL);

//     const results = [];
//     const totalEndpoints = testEndpoints.length;

//     for (let i = 0; i < testEndpoints.length; i++) {
//       const endpoint = testEndpoints[i];

//       // ✅ Update progress
//       Animated.timing(progressAnimation, {
//         toValue: (i / totalEndpoints),
//         duration: 200,
//         useNativeDriver: false,
//       }).start();

//       try {
//         console.log(`🔗 Testing: ${endpoint.url}`);

//         const startTime = Date.now();
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 10000);

//         const response = await fetch(endpoint.url, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//           },
//           signal: controller.signal,
//         });

//         clearTimeout(timeoutId);
//         const endTime = Date.now();

//         const data = await response.json();
//         const duration = endTime - startTime;

//         const result = {
//           name: endpoint.name,
//           url: endpoint.url,
//           status: response.status,
//           success: response.ok,
//           duration: `${duration}ms`,
//           data: data,
//           priority: endpoint.priority,
//           critical: endpoint.critical,
//           timestamp: new Date().toISOString(),
//           headers: Object.fromEntries(response.headers.entries()),
//           responseSize: JSON.stringify(data).length,
//         };

//         results.push(result);
//         console.log(`✅ ${endpoint.name}: ${response.status} (${duration}ms)`);

//       } catch (error) {
//         const result = {
//           name: endpoint.name,
//           url: endpoint.url,
//           status: 'ERROR',
//           success: false,
//           duration: 'timeout',
//           error: error.message,
//           priority: endpoint.priority,
//           critical: endpoint.critical,
//           timestamp: new Date().toISOString(),
//           errorType: error.name || 'NetworkError',
//         };

//         results.push(result);
//         console.log(`❌ ${endpoint.name}: ${error.message}`);
//       }
//     }

//     // ✅ Complete progress
//     Animated.timing(progressAnimation, {
//       toValue: 1,
//       duration: 200,
//       useNativeDriver: false,
//     }).start();

//     // ✅ Stop pulse animation
//     pulseAnimation.stopAnimation();
//     pulseAnimation.setValue(1);

//     setTestResults(results);
//     setIsLoading(false);

//     const successCount = results.filter(r => r.success).length;
//     const totalCount = results.length;

//     if (successCount === totalCount) {
//       setConnectionStatus('success');
//       console.log('🎉 All endpoints working!');
//     } else if (successCount > 0) {
//       setConnectionStatus('partial');
//       console.log(`⚠️ ${successCount}/${totalCount} endpoints working`);
//     } else {
//       setConnectionStatus('failed');
//       console.log('❌ No endpoints working');
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await testConnection();
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     collectSystemInfo();
//     testConnection();
//   }, []);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'success': return '#27AE60';
//       case 'partial': return '#F39C12';
//       case 'failed': return '#E74C3C';
//       case 'testing': return '#3498DB';
//       default: return '#7F8C8D';
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status) {
//       case 'success': return '✅ All Systems Operational';
//       case 'partial': return '⚠️ Partial Connection';
//       case 'failed': return '❌ Connection Failed';
//       case 'testing': return '⏳ Testing in Progress...';
//       default: return '🔄 Ready to Test';
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'high': return '#E74C3C';
//       case 'medium': return '#F39C12';
//       case 'low': return '#7F8C8D';
//       default: return '#3498DB';
//     }
//   };

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const exportResults = () => {
//     const networkAnalysis = generateNetworkAnalysis();
//     const troubleshooting = generateDynamicTroubleshooting();

//     const exportData = {
//       timestamp: new Date().toISOString(),
//       status: connectionStatus,
//       frontend_url: API_CONFIG.BASE_URL,
//       results: testResults,
//       system_info: systemInfo,
//       network_analysis: networkAnalysis,
//       troubleshooting: troubleshooting,
//       environment: __DEV__ ? 'Development' : 'Production',
//       platform: Platform.OS,
//       summary: {
//         total_endpoints: testResults.length,
//         successful: testResults.filter(r => r.success).length,
//         failed: testResults.filter(r => !r.success).length,
//         critical_failures: testResults.filter(r => !r.success && r.critical).length,
//         average_response_time: networkAnalysis.averageResponseTime,
//         health_score: networkAnalysis.healthScore,
//       }
//     };

//     console.log('📋 Connection Test Export:', JSON.stringify(exportData, null, 2));
//     Alert.alert(
//       '📋 Results Exported',
//       `Complete diagnostic report logged to console.\n\nHealth Score: ${networkAnalysis.healthScore.toFixed(1)}/100\nReliability: ${networkAnalysis.reliability.toFixed(1)}%\n\nCheck console for full report.`,
//       [{ text: 'Got it!' }]
//     );
//   };

//   // ✅ Helper functions for formatting
//   const formatBytes = (bytes) => {
//     if (!bytes || bytes === 'Unknown') return 'Unknown';
//     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//     if (bytes === 0) return '0 Bytes';
//     const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
//     return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
//   };

//   const getHealthColor = (score) => {
//     if (score >= 80) return '#27AE60';
//     if (score >= 60) return '#F39C12';
//     return '#E74C3C';
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.contentContainer}
//         showsVerticalScrollIndicator={true}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#2E86AB']}
//             tintColor="#2E86AB"
//             title="Pull to test connection..."
//           />
//         }
//       >
//         {/* ✅ Enhanced Status Dashboard */}
//         <View style={styles.dashboardContainer}>
//           <Text style={styles.title}>🔗 Connection Test Dashboard</Text>

//           <Animated.View style={[
//             styles.statusCard,
//             { transform: [{ scale: isLoading ? pulseAnimation : 1 }] }
//           ]}>
//             <View style={styles.statusHeader}>
//               <Text style={[styles.statusText, { color: getStatusColor(connectionStatus) }]}>
//                 {getStatusText(connectionStatus)}
//               </Text>
//               <Text style={styles.timestampText}>
//                 {new Date().toLocaleString()}
//               </Text>
//             </View>

//             {/* ✅ Health Score */}
//             {testResults.length > 0 && (
//               <View style={styles.healthContainer}>
//                 <Text style={styles.healthLabel}>System Health:</Text>
//                 <Text style={[styles.healthScore, { color: getHealthColor(generateNetworkAnalysis().healthScore) }]}>
//                   {generateNetworkAnalysis().healthScore.toFixed(1)}/100
//                 </Text>
//               </View>
//             )}

//             {/* ✅ Progress Bar */}
//             {isLoading && (
//               <View style={styles.progressContainer}>
//                 <View style={styles.progressBar}>
//                   <Animated.View
//                     style={[
//                       styles.progressFill,
//                       {
//                         width: progressAnimation.interpolate({
//                           inputRange: [0, 1],
//                           outputRange: ['0%', '100%'],
//                         }),
//                       },
//                     ]}
//                   />
//                 </View>
//                 <Text style={styles.progressText}>
//                   Testing endpoints... {testResults.length}/{testEndpoints.length}
//                 </Text>
//               </View>
//             )}

//             <View style={styles.configRow}>
//               <Text style={styles.configLabel}>Frontend:</Text>
//               <Text style={styles.configValue}>{API_CONFIG.BASE_URL}</Text>
//             </View>
//             <View style={styles.configRow}>
//               <Text style={styles.configLabel}>Expected:</Text>
//               <Text style={styles.configValue}>http://192.168.0.102:5000/api</Text>
//             </View>
//             <View style={styles.configRow}>
//               <Text style={styles.configLabel}>Platform:</Text>
//               <Text style={styles.configValue}>{Platform.OS} {Platform.Version}</Text>
//             </View>
//           </Animated.View>

//           {/* ✅ Quick Actions */}
//           <View style={styles.actionsContainer}>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.testButton, isLoading && styles.disabledButton]}
//               onPress={testConnection}
//               disabled={isLoading}
//             >
//               <Text style={styles.actionButtonText}>
//                 {isLoading ? '⏳ Testing...' : '🔄 Run Test'}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.actionButton, styles.exportButton]}
//               onPress={exportResults}
//             >
//               <Text style={styles.actionButtonText}>📋 Export</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* ✅ Enhanced Test Results */}
//         {testResults.length > 0 && (
//           <View style={styles.sectionContainer}>
//             <TouchableOpacity
//               style={styles.sectionHeader}
//               onPress={() => toggleSection('results')}
//             >
//               <Text style={styles.sectionTitle}>
//                 📊 Test Results ({testResults.filter(r => r.success).length}/{testResults.length})
//               </Text>
//               <Text style={styles.expandIcon}>
//                 {expandedSections.results ? '▼' : '▶'}
//               </Text>
//             </TouchableOpacity>

//             {expandedSections.results && (
//               <View style={styles.sectionContent}>
//                 {testResults.map((result, index) => (
//                   <View key={index} style={[
//                     styles.resultCard,
//                     result.success ? styles.successCard : styles.errorCard
//                   ]}>
//                     <View style={styles.resultHeader}>
//                       <Text style={styles.resultName}>
//                         {result.success ? '✅' : '❌'} {result.name}
//                         {result.critical && <Text style={styles.criticalBadge}> CRITICAL</Text>}
//                       </Text>
//                       <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(result.priority) }]}>
//                         <Text style={styles.priorityText}>{result.priority}</Text>
//                       </View>
//                     </View>

//                     <Text style={styles.resultDetails}>
//                       Status: {result.status} | Duration: {result.duration}
//                     </Text>
//                     <Text style={styles.resultUrl} numberOfLines={1} ellipsizeMode="middle">
//                       {result.url}
//                     </Text>

//                     {result.error && (
//                       <View style={styles.errorContainer}>
//                         <Text style={styles.errorText}>🚨 {result.error}</Text>
//                         {result.errorType && (
//                           <Text style={styles.errorType}>Type: {result.errorType}</Text>
//                         )}
//                       </View>
//                     )}

//                     {result.data && result.success && (
//                       <View style={styles.dataContainer}>
//                         <Text style={styles.dataLabel}>📋 Response Preview:</Text>
//                         <Text style={styles.dataText} numberOfLines={2}>
//                           {JSON.stringify(result.data, null, 2)}
//                         </Text>
//                         {result.responseSize && (
//                           <Text style={styles.responseSize}>
//                             Size: {formatBytes(result.responseSize)}
//                           </Text>
//                         )}
//                       </View>
//                     )}
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>
//         )}

//         {/* ✅ NEW: Dynamic Troubleshooting Section */}
//         {testResults.length > 0 && (
//           <View style={styles.sectionContainer}>
//             <TouchableOpacity
//               style={styles.sectionHeader}
//               onPress={() => toggleSection('troubleshoot')}
//             >
//               <Text style={styles.sectionTitle}>🔧 Smart Troubleshooting</Text>
//               <Text style={styles.expandIcon}>
//                 {expandedSections.troubleshoot ? '▼' : '▶'}
//               </Text>
//             </TouchableOpacity>

//             {expandedSections.troubleshoot && (
//               <View style={styles.troubleshootContent}>
//                 {(() => {
//                   const { issues, solutions } = generateDynamicTroubleshooting();
//                   const networkAnalysis = generateNetworkAnalysis();

//                   return (
//                     <>
//                       {/* ✅ Network Analysis */}
//                       <View style={styles.analysisContainer}>
//                         <Text style={styles.analysisTitle}>📊 Connection Analysis</Text>
//                         <View style={styles.analysisGrid}>
//                           <View style={styles.analysisItem}>
//                             <Text style={styles.analysisLabel}>Health Score:</Text>
//                             <Text style={[styles.analysisValue, { color: getHealthColor(networkAnalysis.healthScore) }]}>
//                               {networkAnalysis.healthScore.toFixed(1)}/100
//                             </Text>
//                           </View>
//                           <View style={styles.analysisItem}>
//                             <Text style={styles.analysisLabel}>Reliability:</Text>
//                             <Text style={[styles.analysisValue, {
//                               color: networkAnalysis.reliability > 80 ? '#27AE60' :
//                                      networkAnalysis.reliability > 50 ? '#F39C12' : '#E74C3C'
//                             }]}>
//                               {networkAnalysis.reliability.toFixed(1)}%
//                             </Text>
//                           </View>
//                           {networkAnalysis.latency.length > 0 && (
//                             <View style={styles.analysisItem}>
//                               <Text style={styles.analysisLabel}>Avg Response:</Text>
//                               <Text style={styles.analysisValue}>
//                                 {networkAnalysis.averageResponseTime.toFixed(0)}ms
//                               </Text>
//                             </View>
//                           )}
//                           <View style={styles.analysisItem}>
//                             <Text style={styles.analysisLabel}>Platform:</Text>
//                             <Text style={styles.analysisValue}>{Platform.OS}</Text>
//                           </View>
//                         </View>
//                       </View>

//                       {/* ✅ Dynamic Issues */}
//                       {issues.length > 0 && (
//                         <View style={styles.issuesContainer}>
//                           <Text style={styles.categoryTitle}>🚨 Detected Issues</Text>
//                           {issues.map((issue, index) => (
//                             <View key={index} style={[
//                               styles.issueItem,
//                               { borderLeftColor: issue.type === 'critical' ? '#E74C3C' :
//                                                  issue.type === 'high' ? '#F39C12' : '#3498DB' }
//                             ]}>
//                               <Text style={styles.issueTitle}>{issue.title}</Text>
//                               <Text style={styles.issueDescription}>{issue.description}</Text>
//                               <Text style={styles.issueLikelihood}>
//                                 Likelihood: {issue.likelihood} | Impact: {issue.impact}
//                               </Text>
//                             </View>
//                           ))}
//                         </View>
//                       )}

//                       {/* ✅ Dynamic Solutions */}
//                       {solutions.length > 0 && (
//                         <View style={styles.solutionsContainer}>
//                           <Text style={styles.categoryTitle}>💡 Recommended Solutions</Text>
//                           {solutions.map((solution, index) => (
//                             <View key={index} style={[
//                               styles.solutionItem,
//                               { borderLeftColor: solution.priority === 'immediate' ? '#E74C3C' :
//                                                  solution.priority === 'high' ? '#F39C12' : '#27AE60' }
//                             ]}>
//                               <Text style={styles.solutionTitle}>{solution.title}</Text>
//                               {solution.actions.map((action, actionIndex) => (
//                                 <Text key={actionIndex} style={styles.solutionAction}>
//                                   • {action}
//                                 </Text>
//                               ))}
//                             </View>
//                           ))}
//                         </View>
//                       )}

//                       {/* ✅ Quick Browser Tests */}
//                       <View style={styles.quickTestsContainer}>
//                         <Text style={styles.categoryTitle}>🧪 Quick Browser Tests</Text>
//                         <TouchableOpacity
//                           style={styles.browserTestButton}
//                           onPress={() => {
//                             const url = `http://${networkAnalysis.backendIP}:5000/api/health`;
//                             Alert.alert('Browser Test', `Test this URL in your browser:\n\n${url}\n\nShould return JSON with status information.`);
//                           }}
//                         >
//                           <Text style={styles.browserTestText}>
//                             📱 Health: http://{networkAnalysis.backendIP}:5000/api/health
//                           </Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           style={styles.browserTestButton}
//                           onPress={() => {
//                             const url = `http://${networkAnalysis.backendIP}:5000/api/test`;
//                             Alert.alert('Browser Test', `Test this URL in your browser:\n\n${url}\n\nShould return test endpoint response.`);
//                           }}
//                         >
//                           <Text style={styles.browserTestText}>
//                             🧪 Test: http://{networkAnalysis.backendIP}:5000/api/test
//                           </Text>
//                         </TouchableOpacity>
//                       </View>
//                     </>
//                   );
//                 })()}
//               </View>
//             )}
//           </View>
//         )}

        // {/* ✅ Enhanced System Information */}
        // <View style={styles.sectionContainer}>
        //   <TouchableOpacity
        //     style={styles.sectionHeader}
        //     onPress={() => toggleSection('devInfo')}
        //   >
        //     <Text style={styles.sectionTitle}>👨‍💻 System Information</Text>
        //     <Text style={styles.expandIcon}>
        //       {expandedSections.devInfo ? '▼' : '▶'}
        //     </Text>
        //   </TouchableOpacity>

        //   {expandedSections.devInfo && (
        //     <View style={styles.devInfoContent}>
        //       {/* ✅ Platform Information */}
        //       <View style={styles.infoCategory}>
        //         <Text style={styles.infoCategoryTitle}>📱 Platform Information</Text>
        //         <View style={styles.infoGrid}>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Platform:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.platform}</Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Version:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.platformVersion}</Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Device Type:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.deviceType}</Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Orientation:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.orientation}</Text>
        //           </View>
        //         </View>
        //       </View>

        //       {/* ✅ Screen Information */}
        //       <View style={styles.infoCategory}>
        //         <Text style={styles.infoCategoryTitle}>🖥️ Display</Text>
        //         <View style={styles.infoGrid}>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Screen Size:</Text>
        //             <Text style={styles.infoValue}>
        //               {systemInfo.screenWidth}×{systemInfo.screenHeight}
        //             </Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Window Size:</Text>
        //             <Text style={styles.infoValue}>
        //               {systemInfo.windowWidth}×{systemInfo.windowHeight}
        //             </Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Density:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.screenDensity}x</Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Font Scale:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.fontScale}x</Text>
        //           </View>
        //         </View>
        //       </View>

        //       {/* ✅ Application Information */}
        //       <View style={styles.infoCategory}>
        //         <Text style={styles.infoCategoryTitle}>📦 Application</Text>
        //         <View style={styles.infoGrid}>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Environment:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.environment}</Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Bundle Mode:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.bundleMode}</Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>API Base:</Text>
        //             <Text style={styles.infoValue}>{API_CONFIG.BASE_URL}</Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Timeout:</Text>
        //             <Text style={styles.infoValue}>{API_CONFIG.TIMEOUT || 15000}ms</Text>
        //           </View>
        //         </View>
        //       </View>

        //       {/* ✅ Runtime Information */}
        //       <View style={styles.infoCategory}>
        //         <Text style={styles.infoCategoryTitle}>⏰ Runtime</Text>
        //         <View style={styles.infoGrid}>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Timezone:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.timezone}</Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Language:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.language}</Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Session Started:</Text>
        //             <Text style={styles.infoValue}>
        //               {new Date(systemInfo.timestamp).toLocaleTimeString()}
        //             </Text>
        //           </View>
        //           <View style={styles.infoItem}>
        //             <Text style={styles.infoLabel}>Connection Type:</Text>
        //             <Text style={styles.infoValue}>{systemInfo.connectionType}</Text>
        //           </View>
        //         </View>
        //       </View>
        //     </View>
        //   )}
        // </View>
//         {/* ✅ Bottom Spacer for Complete Scrolling */}
//         <View style={styles.bottomSpacer} />
//       </ScrollView>
//     </View>
//   );
// };

// // Keep all the existing styles exactly the same...
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   contentContainer: {
//     padding: 16,
//     paddingBottom: 100,
//   },

//   // ✅ Dashboard styles
//   dashboardContainer: {
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#2E86AB',
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   statusCard: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   statusHeader: {
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   statusText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   timestampText: {
//     fontSize: 12,
//     color: '#7F8C8D',
//     fontStyle: 'italic',
//   },

//   // ✅ NEW: Health Score
//   healthContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 8,
//   },
//   healthLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#5D6D7E',
//     marginRight: 8,
//   },
//   healthScore: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },

//   // ✅ Progress Bar
//   progressContainer: {
//     marginBottom: 16,
//   },
//   progressBar: {
//     height: 8,
//     backgroundColor: '#ECF0F1',
//     borderRadius: 4,
//     overflow: 'hidden',
//     marginBottom: 8,
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: '#3498DB',
//     borderRadius: 4,
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#7F8C8D',
//     textAlign: 'center',
//   },

//   configRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   configLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#5D6D7E',
//     flex: 1,
//   },
//   configValue: {
//     fontSize: 12,
//     color: '#85929E',
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//     flex: 2,
//     textAlign: 'right',
//   },

//   // ✅ Actions
//   actionsContainer: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   actionButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   testButton: {
//     backgroundColor: '#3498DB',
//   },
//   exportButton: {
//     backgroundColor: '#27AE60',
//   },
//   disabledButton: {
//     backgroundColor: '#BDC3C7',
//   },
//   actionButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },

//   // ✅ Enhanced Sections
//   sectionContainer: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     overflow: 'hidden',
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#F8F9FA',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E9ECEF',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2C3E50',
//     flex: 1,
//   },
//   expandIcon: {
//     fontSize: 16,
//     color: '#7F8C8D',
//     fontWeight: 'bold',
//   },
//   sectionContent: {
//     padding: 16,
//   },

//   // ✅ Enhanced Results
//   resultCard: {
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderLeftWidth: 4,
//   },
//   successCard: {
//     backgroundColor: '#D5EDDA',
//     borderLeftColor: '#27AE60',
//   },
//   errorCard: {
//     backgroundColor: '#F8D7DA',
//     borderLeftColor: '#E74C3C',
//   },
//   resultHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   resultName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2C3E50',
//     flex: 1,
//   },
//   criticalBadge: {
//     fontSize: 10,
//     color: '#E74C3C',
//     fontWeight: 'bold',
//   },
//   priorityBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   priorityText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//   },
//   resultDetails: {
//     fontSize: 14,
//     color: '#5D6D7E',
//     marginBottom: 4,
//   },
//   resultUrl: {
//     fontSize: 11,
//     color: '#85929E',
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//     marginBottom: 8,
//   },
//   errorContainer: {
//     backgroundColor: '#FADBD8',
//     padding: 8,
//     borderRadius: 6,
//     marginTop: 8,
//   },
//   errorText: {
//     fontSize: 12,
//     color: '#C0392B',
//     fontWeight: '600',
//   },
//   errorType: {
//     fontSize: 10,
//     color: '#85929E',
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
//   dataContainer: {
//     backgroundColor: '#D4F6D4',
//     padding: 8,
//     borderRadius: 6,
//     marginTop: 8,
//   },
//   dataLabel: {
//     fontSize: 12,
//     color: '#1E8449',
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   dataText: {
//     fontSize: 10,
//     color: '#27AE60',
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//     lineHeight: 14,
//   },
//   responseSize: {
//     fontSize: 10,
//     color: '#85929E',
//     marginTop: 4,
//     textAlign: 'right',
//   },

//   // ✅ Dynamic Troubleshooting Styles
//   troubleshootContent: {
//     padding: 16,
//   },

//   // Network Analysis
//   analysisContainer: {
//     backgroundColor: '#E8F4FD',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 20,
//     borderLeftWidth: 4,
//     borderLeftColor: '#3498DB',
//   },
//   analysisTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2980B9',
//     marginBottom: 12,
//   },
//   analysisGrid: {
//     gap: 8,
//   },
//   analysisItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 4,
//   },
//   analysisLabel: {
//     fontSize: 14,
//     color: '#5D6D7E',
//     fontWeight: '600',
//   },
//   analysisValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },

//   // Issues
//   issuesContainer: {
//     marginBottom: 20,
//   },
//   issueItem: {
//     backgroundColor: '#FEF9E7',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//     borderLeftWidth: 4,
//   },
//   issueTitle: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#D68910',
//     marginBottom: 4,
//   },
//   issueDescription: {
//     fontSize: 13,
//     color: '#7D6608',
//     marginBottom: 4,
//   },
//   issueLikelihood: {
//     fontSize: 11,
//     color: '#B7950B',
//     fontStyle: 'italic',
//   },

//   // Solutions
//   solutionsContainer: {
//     marginBottom: 20,
//   },
//   solutionItem: {
//     backgroundColor: '#E8F8F5',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 12,
//     borderLeftWidth: 4,
//   },
//   solutionTitle: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#1E8449',
//     marginBottom: 8,
//   },
//   solutionAction: {
//     fontSize: 13,
//     color: '#27AE60',
//     lineHeight: 18,
//     marginBottom: 2,
//     paddingLeft: 8,
//   },

//   // Category titles
//   categoryTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#E67E22',
//     marginBottom: 12,
//   },

//   // Quick Tests
//   quickTestsContainer: {
//     marginBottom: 10,
//   },
//   browserTestButton: {
//     backgroundColor: '#E8F4FD',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//     borderLeftWidth: 3,
//     borderLeftColor: '#3498DB',
//   },
//   browserTestText: {
//     fontSize: 12,
//     color: '#2980B9',
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//   },

//   // ✅ Dynamic Dev Info Styles
//   devInfoContent: {
//     padding: 16,
//   },
//   infoCategory: {
//     marginBottom: 20,
//   },
//   infoCategoryTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#3498DB',
//     marginBottom: 12,
//     paddingBottom: 8,
//     borderBottomWidth: 2,
//     borderBottomColor: '#E3F2FD',
//   },
//   infoGrid: {
//     gap: 8,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 8,
//   },
//   infoLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#5D6D7E',
//     flex: 1,
//   },
//   infoValue: {
//     fontSize: 14,
//     color: '#2C3E50',
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//     flex: 1,
//     textAlign: 'right',
//   },

//   // ✅ Bottom Spacer
//   bottomSpacer: {
//     height: 80,
//   },
// });

// export default ConnectionTest;
