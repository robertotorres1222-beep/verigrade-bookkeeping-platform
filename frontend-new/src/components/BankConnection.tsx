'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface BankAccount {
  id: string
  name: string
  type: string
  balance: number
  lastSync: string
  status: 'connected' | 'error' | 'syncing'
}

export default function BankConnection() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      name: 'Chase Business Checking',
      type: 'Checking',
      balance: 15420.50,
      lastSync: '2 minutes ago',
      status: 'connected'
    },
    {
      id: '2', 
      name: 'Chase Business Credit Card',
      type: 'Credit Card',
      balance: -2340.75,
      lastSync: '2 minutes ago',
      status: 'connected'
    }
  ])

  const handleConnectBank = async () => {
    setIsConnecting(true)
    
    try {
      // In a real implementation, this would initiate Plaid Link
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate adding a new account
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        name: 'Wells Fargo Business Savings',
        type: 'Savings',
        balance: 8750.25,
        lastSync: 'Just now',
        status: 'connected'
      }
      
      setConnectedAccounts(prev => [...prev, newAccount])
    } catch (error) {
      console.error('Bank connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSyncAccount = async (accountId: string) => {
    setConnectedAccounts(prev => 
      prev.map(account => 
        account.id === accountId 
          ? { ...account, status: 'syncing' as const }
          : account
      )
    )

    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setConnectedAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { 
                ...account, 
                status: 'connected' as const,
                lastSync: 'Just now',
                balance: account.balance + (Math.random() - 0.5) * 100 // Simulate balance change
              }
            : account
        )
      )
    } catch (error) {
      setConnectedAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, status: 'error' as const }
            : account
        )
      )
    }
  }

  const handleDisconnectAccount = async (accountId: string) => {
    setConnectedAccounts(prev => 
      prev.filter(account => account.id !== accountId)
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Bank Connections</h1>
        <p className="mt-2 text-gray-600">Connect your bank accounts for automatic transaction sync</p>
      </motion.div>

      {/* Connect New Bank */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Connect New Bank Account</h3>
            <p className="text-sm text-gray-500">Securely connect your bank account using Plaid</p>
          </div>
          <button
            onClick={handleConnectBank}
            disabled={isConnecting}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Connect Bank
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Connected Accounts */}
      <div className="space-y-6">
        {connectedAccounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  account.status === 'connected' ? 'bg-green-100' : 
                  account.status === 'syncing' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    account.status === 'connected' ? 'text-green-600' : 
                    account.status === 'syncing' ? 'text-blue-600' : 'text-red-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500">{account.type}</p>
                  <p className="text-sm text-gray-400">Last sync: {account.lastSync}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      account.status === 'connected' ? 'bg-green-400' : 
                      account.status === 'syncing' ? 'bg-blue-400' : 'bg-red-400'
                    }`}></div>
                    <span className={`text-xs font-medium capitalize ${
                      account.status === 'connected' ? 'text-green-600' : 
                      account.status === 'syncing' ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {account.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncAccount(account.id)}
                    disabled={account.status === 'syncing'}
                    className="p-2 text-gray-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Sync Account"
                  >
                    {account.status === 'syncing' ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDisconnectAccount(account.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Disconnect Account"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {connectedAccounts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bank accounts connected</h3>
          <p className="mt-1 text-sm text-gray-500">Connect your first bank account to get started.</p>
        </motion.div>
      )}
    </div>
  )
}
