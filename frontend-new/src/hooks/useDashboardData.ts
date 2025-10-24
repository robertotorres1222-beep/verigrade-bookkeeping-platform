import { useQuery } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/config/api'

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.business.dashboard)
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.business.invoices)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}













