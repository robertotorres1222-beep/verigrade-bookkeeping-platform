import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface DashboardData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    outstandingInvoices: number;
    bankBalance: number;
    recentTransactions: number;
  };
  charts: {
    revenueChart: Array<{ date: string; amount: number }>;
    expenseChart: Array<{ category: string; amount: number }>;
    profitLoss: Array<{ month: string; profit: number }>;
  };
  quickActions: Array<{
    id: string;
    title: string;
    icon: string;
    color: string;
    action: () => void;
  }>;
}

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'scan-receipt',
      title: 'Scan Receipt',
      icon: 'camera-alt',
      color: '#007AFF',
      action: () => {
        // Navigate to receipt scanner
        console.log('Navigate to receipt scanner');
      },
    },
    {
      id: 'add-expense',
      title: 'Add Expense',
      icon: 'add-circle',
      color: '#34C759',
      action: () => {
        console.log('Add expense');
      },
    },
    {
      id: 'create-invoice',
      title: 'Create Invoice',
      icon: 'description',
      color: '#FF9500',
      action: () => {
        console.log('Create invoice');
      },
    },
    {
      id: 'track-time',
      title: 'Track Time',
      icon: 'access-time',
      color: '#AF52DE',
      action: () => {
        console.log('Track time');
      },
    },
  ];

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>{user?.firstName}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="notifications" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#34C759' }]}>
            <Icon name="trending-up" size={24} color="white" />
            <Text style={styles.summaryLabel}>Revenue</Text>
            <Text style={styles.summaryValue}>
              ${dashboardData?.summary.totalRevenue.toLocaleString() || '0'}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FF3B30' }]}>
            <Icon name="trending-down" size={24} color="white" />
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryValue}>
              ${dashboardData?.summary.totalExpenses.toLocaleString() || '0'}
            </Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#007AFF' }]}>
            <Icon name="account-balance" size={24} color="white" />
            <Text style={styles.summaryLabel}>Bank Balance</Text>
            <Text style={styles.summaryValue}>
              ${dashboardData?.summary.bankBalance.toLocaleString() || '0'}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FF9500' }]}>
            <Icon name="description" size={24} color="white" />
            <Text style={styles.summaryLabel}>Outstanding</Text>
            <Text style={styles.summaryValue}>
              ${dashboardData?.summary.outstandingInvoices.toLocaleString() || '0'}
            </Text>
          </View>
        </View>
      </View>

      {/* Net Income Card */}
      <View style={styles.netIncomeCard}>
        <Text style={styles.netIncomeLabel}>Net Income This Month</Text>
        <Text style={styles.netIncomeValue}>
          ${dashboardData?.summary.netIncome.toLocaleString() || '0'}
        </Text>
        <Text style={styles.netIncomeSubtext}>
          {dashboardData?.summary.netIncome >= 0 ? '+12.5%' : '-8.2%'} from last month
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionButton, { backgroundColor: action.color }]}
              onPress={action.action}
            >
              <Icon name={action.icon} size={28} color="white" />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Charts Section */}
      <View style={styles.chartsContainer}>
        <Text style={styles.sectionTitle}>Revenue Trend</Text>
        {dashboardData?.charts.revenueChart && (
          <LineChart
            data={{
              labels: dashboardData.charts.revenueChart.map(item => item.date),
              datasets: [{
                data: dashboardData.charts.revenueChart.map(item => item.amount),
              }],
            }}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        )}

        <Text style={styles.sectionTitle}>Expenses by Category</Text>
        {dashboardData?.charts.expenseChart && (
          <BarChart
            data={{
              labels: dashboardData.charts.expenseChart.map(item => item.category),
              datasets: [{
                data: dashboardData.charts.expenseChart.map(item => item.amount),
              }],
            }}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <Icon name="receipt" size={20} color="#34C759" />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Receipt scanned</Text>
            <Text style={styles.activitySubtitle}>Office supplies - $45.99</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>
        <View style={styles.activityItem}>
          <Icon name="description" size={20} color="#007AFF" />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Invoice sent</Text>
            <Text style={styles.activitySubtitle}>Client ABC - $1,250.00</Text>
            <Text style={styles.activityTime}>4 hours ago</Text>
          </View>
        </View>
        <View style={styles.activityItem}>
          <Icon name="account-balance" size={20} color="#FF9500" />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Bank sync completed</Text>
            <Text style={styles.activitySubtitle}>15 new transactions imported</Text>
            <Text style={styles.activityTime}>1 day ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationButton: {
    padding: 8,
  },
  summaryContainer: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  summaryLabel: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.9,
  },
  summaryValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  netIncomeCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  netIncomeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  netIncomeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  netIncomeSubtext: {
    fontSize: 14,
    color: '#34C759',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  chartsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  recentActivityContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default DashboardScreen;
