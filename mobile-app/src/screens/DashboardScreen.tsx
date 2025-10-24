import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, List, Chip } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { useSync } from '../contexts/SyncContext';
import { apiService } from '../services/apiService';

export default function DashboardScreen() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const { isOnline, isOfflineMode, pendingActions } = useOffline();
  const { isSyncing, syncProgress, getSyncStatus } = useSync();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getDashboardData();
      setDashboardData(data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = () => {
    if (isOfflineMode) return '#FF9500';
    if (!isOnline) return '#FF3B30';
    if (isSyncing) return '#007AFF';
    return '#34C759';
  };

  const getStatusText = () => {
    if (isOfflineMode) return 'Offline Mode';
    if (!isOnline) return 'No Connection';
    if (isSyncing) return `Syncing... ${syncProgress}%`;
    return 'Online';
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Status Bar */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusRow}>
            <Chip 
              icon="wifi" 
              style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
            >
              {getStatusText()}
            </Chip>
            {pendingActions.length > 0 && (
              <Chip icon="clock" style={styles.pendingChip}>
                {pendingActions.length} Pending
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Welcome Card */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title>Welcome back, {user?.firstName}!</Title>
          <Paragraph>Here's your financial overview</Paragraph>
        </Card.Content>
      </Card>

      {/* Financial Summary */}
      {dashboardData && (
        <>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title>Financial Summary</Title>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Paragraph style={styles.summaryLabel}>Total Income</Paragraph>
                  <Title style={styles.summaryValue}>
                    ${dashboardData.totalIncome?.toLocaleString() || '0'}
                  </Title>
                </View>
                <View style={styles.summaryItem}>
                  <Paragraph style={styles.summaryLabel}>Total Expenses</Paragraph>
                  <Title style={styles.summaryValue}>
                    ${dashboardData.totalExpenses?.toLocaleString() || '0'}
                  </Title>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Paragraph style={styles.summaryLabel}>Net Income</Paragraph>
                  <Title style={[
                    styles.summaryValue,
                    { color: (dashboardData.netIncome || 0) >= 0 ? '#34C759' : '#FF3B30' }
                  ]}>
                    ${dashboardData.netIncome?.toLocaleString() || '0'}
                  </Title>
                </View>
                <View style={styles.summaryItem}>
                  <Paragraph style={styles.summaryLabel}>Pending Invoices</Paragraph>
                  <Title style={styles.summaryValue}>
                    ${dashboardData.pendingInvoices?.toLocaleString() || '0'}
                  </Title>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Recent Transactions */}
          <Card style={styles.transactionsCard}>
            <Card.Content>
              <Title>Recent Transactions</Title>
              {dashboardData.recentTransactions?.map((transaction: any, index: number) => (
                <List.Item
                  key={index}
                  title={transaction.description}
                  description={`${transaction.type} • ${new Date(transaction.date).toLocaleDateString()}`}
                  right={() => (
                    <Paragraph style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'income' ? '#34C759' : '#FF3B30' }
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                    </Paragraph>
                  )}
                />
              ))}
            </Card.Content>
          </Card>

          {/* Quick Actions */}
          <Card style={styles.actionsCard}>
            <Card.Content>
              <Title>Quick Actions</Title>
              <View style={styles.actionButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => {}}
                  style={styles.actionButton}
                >
                  Add Expense
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => {}}
                  style={styles.actionButton}
                >
                  Create Invoice
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => {}}
                  style={styles.actionButton}
                >
                  Scan Receipt
                </Button>
              </View>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Sync Status */}
      <Card style={styles.syncCard}>
        <Card.Content>
          <Title>Sync Status</Title>
          <Paragraph>{getSyncStatus()}</Paragraph>
          {isSyncing && (
            <Paragraph>Progress: {syncProgress}%</Paragraph>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusCard: {
    margin: 16,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    marginRight: 8,
  },
  pendingChip: {
    backgroundColor: '#FF9500',
  },
  welcomeCard: {
    margin: 16,
    marginTop: 8,
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionsCard: {
    margin: 16,
    marginTop: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  actionButton: {
    margin: 4,
    flex: 1,
    minWidth: 100,
  },
  syncCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 100,
  },
});