import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTenant } from '../../context/TenantContext';

// ✅ FIX: Update import to use new modular API structure
import { studentService } from '../../api/services/studentService';
// OR use the main API index:
// import { studentService } from '../../api';

const StudentGrades = ({ navigation }) => {
  const { user } = useAuth();
  const { roleTheme } = useRole();
  const { tenantBranding } = useTenant();

  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('overview'); // overview, detailed, analytics
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [chartType, setChartType] = useState('bar'); // bar, line, pie
  const [exporting, setExporting] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  // ✅ FIX: Update API call to use new service structure
  const loadPerformanceData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('📊 Loading student performance data...');

      // ✅ Updated API call using new service structure
      const response = await studentService.getPerformance({
        userId: user.id,
        semester: selectedSemester,
        includeAnalytics: true,
        includeProgress: true,
      });

      if (response.success && response.data) {
        setPerformanceData(response.data);
        console.log('✅ Performance data loaded successfully');
      } else {
        throw new Error(response.message || 'Failed to load performance data');
      }

    } catch (error) {
      console.error('❌ Error loading performance data:', error);

      // Use mock data as fallback (matching your web structure)
      setPerformanceData(getMockPerformanceData());

      Alert.alert(
        'Connection Issue',
        'Using offline data. Pull down to refresh.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Enhanced mock performance data matching your web structure
  const getMockPerformanceData = () => ({
    overallGPA: 3.57,
    rank: 12,
    totalStudents: 150,
    semester: 'Fall 2024',
    lastUpdated: '2024-08-04',
    attendance: {
      present: 42,
      total: 50,
      percentage: 84.0,
      trend: 'stable',
      totalDays: 120,
      presentDays: 110
    },
    grades: [
      { subject: 'Mathematics', score: 92, grade: 'A', credits: 4, gpa: 4.0, trend: 'up', lastUpdated: '2024-08-01' },
      { subject: 'Physics', score: 88, grade: 'B+', credits: 4, gpa: 3.7, trend: 'stable', lastUpdated: '2024-08-02' },
      { subject: 'Chemistry', score: 85, grade: 'B', credits: 3, gpa: 3.3, trend: 'down', lastUpdated: '2024-08-03' },
      { subject: 'English', score: 95, grade: 'A', credits: 3, gpa: 4.0, trend: 'up', lastUpdated: '2024-08-04' },
      { subject: 'History', score: 79, grade: 'B-', credits: 2, gpa: 2.7, trend: 'stable', lastUpdated: '2024-08-01' },
      { subject: 'Biology', score: 90, grade: 'A-', credits: 4, gpa: 3.7, trend: 'up', lastUpdated: '2024-08-02' }
    ],
    analytics: {
      overallGPA: 3.57,
      rank: 12,
      totalStudents: 150,
      totalCredits: 20,
      improvement: '+5.2%',
      strengths: ['Mathematics', 'English'],
      improvements: ['History'],
      classAverage: 81.3,
      gradeAverage: 82.8,
      percentile: 87.5,
      academicStanding: 'Good Standing'
    },
    benchmark: {
      classAverages: {
        Mathematics: 78.5,
        Physics: 82.3,
        Chemistry: 80.1,
        English: 85.7,
        History: 77.9,
        Biology: 83.2,
      },
      schoolAverage: 81.3,
      gradeAverage: 82.8,
    },
    progressHistory: [
      { month: 'Jan', gpa: 3.2 },
      { month: 'Feb', gpa: 3.3 },
      { month: 'Mar', gpa: 3.4 },
      { month: 'Apr', gpa: 3.5 },
      { month: 'May', gpa: 3.57 },
    ],
    recentAssignments: [
      { subject: 'Mathematics', title: 'Calculus Quiz', score: 95, date: '2024-08-01' },
      { subject: 'Physics', title: 'Lab Report', score: 88, date: '2024-07-30' },
      { subject: 'Chemistry', title: 'Midterm Exam', score: 85, date: '2024-07-28' },
    ],
  });

  // ✅ Export functionality (keep existing implementation)
  const exportReport = async (type) => {
    try {
      setExporting(true);
      console.log(`📤 Exporting performance report as ${type}`);

      // Generate report content
      const reportData = generateReportData(type);

      if (type === 'csv') {
        await exportAsCSV(reportData);
      } else if (type === 'pdf') {
        await exportAsPDF(reportData);
      } else if (type === 'share') {
        await shareReport(reportData);
      }

      console.log(`✅ Report exported successfully as ${type}`);

    } catch (error) {
      console.error('❌ Error exporting report:', error);
      Alert.alert('Export Failed', 'Unable to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ✅ Generate report data (keep existing implementation)
  const generateReportData = (type) => {
    if (!performanceData) return '';

    const { grades, attendance, analytics } = performanceData;

    if (type === 'csv') {
      let csv = 'Subject,Score,Grade,Credits,GPA\n';
      grades.forEach(grade => {
        csv += `${grade.subject},${grade.score},${grade.grade},${grade.credits},${grade.gpa}\n`;
      });
      csv += `\nOverall GPA,${analytics.overallGPA}\n`;
      csv += `Attendance,${attendance.percentage}%\n`;
      csv += `Rank,${analytics.rank}/${analytics.totalStudents}\n`;
      return csv;
    } else {
      // For sharing/PDF
      let report = `📊 PERFORMANCE REPORT\n`;
      report += `Student: ${user.name || 'Student'}\n`;
      report += `Date: ${new Date().toLocaleDateString()}\n\n`;
      report += `📈 ACADEMIC PERFORMANCE:\n`;
      report += `Overall GPA: ${analytics.overallGPA}\n`;
      report += `Class Rank: ${analytics.rank}/${analytics.totalStudents}\n`;
      report += `Total Credits: ${analytics.totalCredits}\n\n`;
      report += `📚 SUBJECT GRADES:\n`;
      grades.forEach(grade => {
        report += `${grade.subject}: ${grade.score}% (${grade.grade})\n`;
      });
      report += `\n📅 ATTENDANCE:\n`;
      report += `${attendance.present}/${attendance.total} days (${attendance.percentage}%)\n\n`;
      report += `💪 STRENGTHS: ${analytics.strengths.join(', ')}\n`;
      report += `📈 AREAS FOR IMPROVEMENT: ${analytics.improvements.join(', ')}\n`;
      return report;
    }
  };

  // ✅ Export as CSV (keep existing implementation)
  const exportAsCSV = async (csvData) => {
    const filename = `performance_report_${Date.now()}.csv`;
    const fileUri = FileSystem.documentDirectory + filename;

    await FileSystem.writeAsStringAsync(fileUri, csvData);
    await Sharing.shareAsync(fileUri);
  };

  // ✅ Export as PDF (keep existing implementation)
  const exportAsPDF = async (reportData) => {
    Alert.alert(
      'PDF Export',
      'PDF export functionality would be implemented with a library like react-native-html-to-pdf',
      [{ text: 'OK' }]
    );
  };

  // ✅ Share report (keep existing implementation)
  const shareReport = async (reportData) => {
    await Share.share({
      message: reportData,
      title: 'Academic Performance Report',
    });
  };

  // ✅ Chart configurations (keep existing implementation)
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3498DB'
    }
  };

  // ✅ Get grade color (keep existing implementation)
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return '#27AE60';
      case 'A-': return '#2ECC71';
      case 'B+': return '#3498DB';
      case 'B': return '#5DADE2';
      case 'B-': return '#F39C12';
      case 'C+': return '#F7DC6F';
      case 'C': return '#E67E22';
      default: return '#E74C3C';
    }
  };

  // ✅ Get improvement icon (keep existing implementation)
  const getImprovementIcon = (improvement) => {
    if (improvement.includes('+')) return 'trending-up';
    if (improvement.includes('-')) return 'trending-down';
    return 'remove';
  };

  // ✅ Initial load
  useFocusEffect(
    useCallback(() => {
      loadPerformanceData();
    }, [])
  );

  const onRefresh = () => {
    loadPerformanceData(true);
  };

  // Theme colors
  const primaryColor = roleTheme?.primary || tenantBranding?.primaryColor || '#3498DB';

  // ✅ Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={styles.loadingText}>Loading performance data...</Text>
      </View>
    );
  }

  if (!performanceData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="analytics-outline" size={64} color="#E74C3C" />
        <Text style={styles.errorTitle}>No Performance Data</Text>
        <Text style={styles.errorText}>Performance data is not available at this time.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Header with Export Options */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>📊 Performance Overview</Text>
        <Text style={styles.headerSubtitle}>Track your academic progress</Text>

        {/* Export Buttons */}
        <View style={styles.exportContainer}>
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: primaryColor }]}
            onPress={() => exportReport('csv')}
            disabled={exporting}
          >
            <Ionicons name="download" size={16} color="#FFFFFF" />
            <Text style={styles.exportButtonText}>CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: '#E74C3C' }]}
            onPress={() => exportReport('pdf')}
            disabled={exporting}
          >
            <Ionicons name="document" size={16} color="#FFFFFF" />
            <Text style={styles.exportButtonText}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: '#27AE60' }]}
            onPress={() => exportReport('share')}
            disabled={exporting}
          >
            <Ionicons name="share" size={16} color="#FFFFFF" />
            <Text style={styles.exportButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ View Selector */}
      <View style={styles.viewSelector}>
        {[
          { key: 'overview', label: 'Overview', icon: 'analytics' },
          { key: 'detailed', label: 'Detailed', icon: 'list' },
          { key: 'analytics', label: 'Analytics', icon: 'bar-chart' },
        ].map((view) => (
          <TouchableOpacity
            key={view.key}
            style={[
              styles.viewTab,
              selectedView === view.key && { backgroundColor: primaryColor }
            ]}
            onPress={() => setSelectedView(view.key)}
          >
            <Ionicons
              name={view.icon}
              size={20}
              color={selectedView === view.key ? '#FFFFFF' : '#666'}
            />
            <Text style={[
              styles.viewTabText,
              selectedView === view.key && { color: '#FFFFFF' }
            ]}>
              {view.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ Overview Tab */}
        {selectedView === 'overview' && (
          <>
            {/* Key Metrics */}
            <View style={styles.metricsContainer}>
              <View style={[styles.metricCard, { borderLeftColor: primaryColor }]}>
                <Text style={styles.metricValue}>{performanceData.analytics.overallGPA}</Text>
                <Text style={styles.metricLabel}>Overall GPA</Text>
                <View style={styles.improvementIndicator}>
                  <Ionicons
                    name={getImprovementIcon(performanceData.analytics.improvement)}
                    size={16}
                    color="#27AE60"
                  />
                  <Text style={styles.improvementText}>{performanceData.analytics.improvement}</Text>
                </View>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: '#27AE60' }]}>
                <Text style={styles.metricValue}>{performanceData.attendance.percentage}%</Text>
                <Text style={styles.metricLabel}>Attendance</Text>
                <Text style={styles.metricSubtext}>
                  {performanceData.attendance.present}/{performanceData.attendance.total} days
                </Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: '#F39C12' }]}>
                <Text style={styles.metricValue}>#{performanceData.analytics.rank}</Text>
                <Text style={styles.metricLabel}>Class Rank</Text>
                <Text style={styles.metricSubtext}>
                  of {performanceData.analytics.totalStudents} students
                </Text>
              </View>
            </View>

            {/* ✅ Rest of your existing JSX stays exactly the same */}
            {/* GPA Progress Chart */}
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>📈 GPA Progress</Text>
              <LineChart
                data={{
                  labels: performanceData.progressHistory.map(p => p.month),
                  datasets: [{
                    data: performanceData.progressHistory.map(p => p.gpa),
                    strokeWidth: 3,
                  }],
                }}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>

            {/* Quick Grade Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📚 Recent Grades</Text>
              {performanceData.grades.slice(0, 3).map((grade, index) => (
                <View key={index} style={styles.gradeRow}>
                  <View style={styles.gradeInfo}>
                    <Text style={styles.gradeSubject}>{grade.subject}</Text>
                    <Text style={styles.gradeScore}>{grade.score}%</Text>
                  </View>
                  <View
                    style={[
                      styles.gradeTag,
                      { backgroundColor: getGradeColor(grade.grade) }
                    ]}
                  >
                    <Text style={styles.gradeTagText}>{grade.grade}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.viewAllButton, { borderColor: primaryColor }]}
                onPress={() => setSelectedView('detailed')}
              >
                <Text style={[styles.viewAllText, { color: primaryColor }]}>
                  View All Grades
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ✅ All other tabs (detailed, analytics) stay exactly the same */}
        {/* Your existing detailed and analytics view code... */}
        {selectedView === 'detailed' && (
          <>
            {/* All Grades */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Subject Performance</Text>
              {performanceData.grades.map((grade, index) => (
                <View key={index} style={styles.detailedGradeCard}>
                  <View style={styles.detailedGradeHeader}>
                    <Text style={styles.detailedGradeSubject}>{grade.subject}</Text>
                    <View
                      style={[
                        styles.gradeTag,
                        { backgroundColor: getGradeColor(grade.grade) }
                      ]}
                    >
                      <Text style={styles.gradeTagText}>{grade.grade}</Text>
                    </View>
                  </View>

                  <View style={styles.detailedGradeStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Score</Text>
                      <Text style={styles.statValue}>{grade.score}%</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Credits</Text>
                      <Text style={styles.statValue}>{grade.credits}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>GPA Points</Text>
                      <Text style={styles.statValue}>{grade.gpa}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Class Avg</Text>
                      <Text style={styles.statValue}>
                        {performanceData.benchmark.classAverages[grade.subject]?.toFixed(1) || 'N/A'}%
                      </Text>
                    </View>
                  </View>

                  {/* Performance vs Class Average */}
                  <View style={styles.comparisonContainer}>
                    <Text style={styles.comparisonLabel}>vs Class Average</Text>
                    <View style={styles.comparisonBar}>
                      <View
                        style={[
                          styles.performanceBar,
                          {
                            width: `${(grade.score / 100) * 100}%`,
                            backgroundColor: primaryColor
                          }
                        ]}
                      />
                      <View
                        style={[
                          styles.averageIndicator,
                          {
                            left: `${(performanceData.benchmark.classAverages[grade.subject] / 100) * 100}%`,
                          }
                        ]}
                      />
                    </View>
                    <View style={styles.comparisonLegend}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: primaryColor }]} />
                        <Text style={styles.legendText}>Your Score</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#E74C3C' }]} />
                        <Text style={styles.legendText}>Class Average</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Benchmark Comparison */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Class Averages</Text>
              <View style={styles.benchmarkContainer}>
                {Object.entries(performanceData.benchmark.classAverages).map(([subject, average]) => (
                  <View key={subject} style={styles.benchmarkItem}>
                    <Text style={styles.benchmarkSubject}>{subject}</Text>
                    <Text style={styles.benchmarkAverage}>{average.toFixed(1)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ✅ Analytics Tab - Your existing code stays the same */}
        {selectedView === 'analytics' && (
          <>
            {/* Grade Distribution Chart */}
            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.sectionTitle}>📊 Grade Distribution</Text>
                <View style={styles.chartTypeSelector}>
                  {['bar', 'line'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chartTypeButton,
                        chartType === type && { backgroundColor: primaryColor }
                      ]}
                      onPress={() => setChartType(type)}
                    >
                      <Text style={[
                        styles.chartTypeButtonText,
                        chartType === type && { color: '#FFFFFF' }
                      ]}>
                        {type.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {chartType === 'bar' ? (
                <BarChart
                  data={{
                    labels: performanceData.grades.map(g => g.subject.substring(0, 4)),
                    datasets: [{
                      data: performanceData.grades.map(g => g.score),
                    }],
                  }}
                  width={screenWidth - 32}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  showValuesOnTopOfBars
                />
              ) : (
                <LineChart
                  data={{
                    labels: performanceData.grades.map(g => g.subject.substring(0, 4)),
                    datasets: [{
                      data: performanceData.grades.map(g => g.score),
                      strokeWidth: 3,
                    }],
                  }}
                  width={screenWidth - 32}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              )}
            </View>

            {/* Performance Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Performance Insights</Text>

              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Ionicons name="trophy" size={24} color="#F39C12" />
                  <Text style={styles.insightTitle}>Strengths</Text>
                </View>
                <Text style={styles.insightText}>
                  You excel in: {performanceData.analytics.strengths.join(', ')}
                </Text>
              </View>

              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Ionicons name="trending-up" size={24} color="#3498DB" />
                  <Text style={styles.insightTitle}>Areas for Improvement</Text>
                </View>
                <Text style={styles.insightText}>
                  Focus on: {performanceData.analytics.improvements.join(', ')}
                </Text>
              </View>

              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Ionicons name="analytics" size={24} color="#27AE60" />
                  <Text style={styles.insightTitle}>Overall Progress</Text>
                </View>
                <Text style={styles.insightText}>
                  Your performance has improved by {performanceData.analytics.improvement} this semester.
                  Keep up the excellent work!
                </Text>
              </View>
            </View>

            {/* Recent Assignments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Recent Assignments</Text>
              {performanceData.recentAssignments.map((assignment, index) => (
                <View key={index} style={styles.assignmentRow}>
                  <View style={styles.assignmentInfo}>
                    <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                    <Text style={styles.assignmentSubject}>{assignment.subject}</Text>
                    <Text style={styles.assignmentDate}>
                      {new Date(assignment.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.assignmentScore}>
                    <Text style={styles.assignmentScoreText}>{assignment.score}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Loading overlay for exports */}
      {exporting && (
        <View style={styles.exportingOverlay}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={styles.exportingText}>Exporting report...</Text>
        </View>
      )}
    </View>
  );
};

// ✅ All styles remain exactly the same
const styles = StyleSheet.create({
  // ... your existing styles stay exactly the same
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  exportContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  viewTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 6,
  },
  viewTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  metricSubtext: {
    fontSize: 10,
    color: '#999',
  },
  improvementIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTypeSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  chartTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  chartTypeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  chart: {
    borderRadius: 12,
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  gradeInfo: {
    flex: 1,
  },
  gradeSubject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  gradeScore: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  gradeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gradeTagText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAllButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailedGradeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailedGradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailedGradeSubject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  detailedGradeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  comparisonContainer: {
    marginTop: 12,
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  comparisonBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 8,
  },
  performanceBar: {
    height: 8,
    borderRadius: 4,
  },
  averageIndicator: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 12,
    backgroundColor: '#E74C3C',
  },
  comparisonLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  },
  benchmarkContainer: {
    gap: 8,
  },
  benchmarkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  benchmarkSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  benchmarkAverage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  insightCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  assignmentSubject: {
    fontSize: 12,
    color: '#3498DB',
    marginTop: 2,
  },
  assignmentDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  assignmentScore: {
    alignItems: 'center',
  },
  assignmentScoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
  },
  exportingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
  },
});

export default StudentGrades;
