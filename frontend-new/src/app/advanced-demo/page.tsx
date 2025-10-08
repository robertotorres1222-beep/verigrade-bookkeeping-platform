'use client'

import AdvancedLayout from '@/components/AdvancedLayout'
import AdvancedModal, { ConfirmModal, useModal, useModalManager } from '@/components/AdvancedModal'
import AdvancedDataTable from '@/components/AdvancedDataTable'
import AdvancedCharts, { generateChartData } from '@/components/AdvancedCharts'
import { Column } from '@/components/AdvancedDataTable'

// Sample data for demonstration
const sampleData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-15',
    amount: 1500,
    department: 'Engineering'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Pending',
    lastLogin: '2024-01-14',
    amount: -250,
    department: 'Marketing'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Manager',
    status: 'Active',
    lastLogin: '2024-01-13',
    amount: 3200,
    department: 'Sales'
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'User',
    status: 'Inactive',
    lastLogin: '2024-01-10',
    amount: 800,
    department: 'HR'
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-12',
    amount: 2100,
    department: 'Finance'
  }
]

const columns: Column[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    filterable: true
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    filterable: true
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    filterable: true
  },
  {
    key: 'department',
    label: 'Department',
    sortable: true,
    filterable: true
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: string) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        value === 'Active' 
          ? 'bg-green-100 text-green-800'
          : value === 'Pending'
          ? 'bg-yellow-100 text-yellow-800'
          : value === 'Inactive'
          ? 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )
  },
  {
    key: 'lastLogin',
    label: 'Last Login',
    sortable: true,
    render: (value: string) => (
      <span className="text-gray-600">
        {new Date(value).toLocaleDateString()}
      </span>
    )
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    render: (value: number) => (
      <span className={`font-mono ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {value >= 0 ? '+' : ''}${Math.abs(value).toLocaleString()}
      </span>
    )
  }
]

export default function AdvancedDemoPage() {
  const { isOpen: isBasicModalOpen, open: openBasicModal, close: closeBasicModal } = useModal()
  const { isOpen: isFormModalOpen, open: openFormModal, close: closeFormModal } = useModal()
  const { isOpen: isSuccessModalOpen, open: openSuccessModal, close: closeSuccessModal } = useModal()
  const { isOpen: isWarningModalOpen, open: openWarningModal, close: closeWarningModal } = useModal()
  const { isOpen: isErrorModalOpen, open: openErrorModal, close: closeErrorModal } = useModal()
  const { isOpen: isInfoModalOpen, open: openInfoModal, close: closeInfoModal } = useModal()
  
  const { isOpen: isConfirmModalOpen, open: openConfirmModal, close: closeConfirmModal } = useModal()
  const { isOpen: isDeleteModalOpen, open: openDeleteModal, close: closeDeleteModal } = useModal()

  const modalManager = useModalManager()

  const handleConfirm = () => {
    console.log('Confirmed!')
    closeConfirmModal()
  }

  const handleDelete = () => {
    console.log('Deleted!')
    closeDeleteModal()
  }

  return (
    <AdvancedLayout title="Advanced Components Demo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Advanced Components Showcase
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Experience the power of modern, interactive UI components with advanced animations and functionality.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg">
                  ✨ Animations
                </div>
                <div className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
                  🎨 Modern Design
                </div>
                <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg">
                  🚀 Performance
                </div>
                <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg">
                  📱 Responsive
                </div>
              </div>
            </div>
          </div>

          {/* Modal Demos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Advanced Modals</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <button
                onClick={openBasicModal}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Basic Modal
              </button>
              
              <button
                onClick={openFormModal}
                className="px-4 py-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Form Modal
              </button>
              
              <button
                onClick={openSuccessModal}
                className="px-4 py-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                Success Modal
              </button>
              
              <button
                onClick={openWarningModal}
                className="px-4 py-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
              >
                Warning Modal
              </button>
              
              <button
                onClick={openErrorModal}
                className="px-4 py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                Error Modal
              </button>
              
              <button
                onClick={openInfoModal}
                className="px-4 py-3 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                Info Modal
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirmation Modals</h3>
              <div className="flex space-x-4">
                <button
                  onClick={openConfirmModal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Confirm Action
                </button>
                <button
                  onClick={openDeleteModal}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Charts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Advanced Charts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AdvancedCharts
                type="line"
                data={generateChartData('revenue')}
                title="Revenue Trend"
                height={250}
              />
              <AdvancedCharts
                type="bar"
                data={generateChartData('expenses')}
                title="Expenses Breakdown"
                height={250}
              />
              <AdvancedCharts
                type="area"
                data={generateChartData('profit')}
                title="Profit Analysis"
                height={250}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdvancedCharts
                type="pie"
                data={generateChartData('categories')}
                title="Expense Categories"
                height={300}
              />
              <AdvancedCharts
                type="doughnut"
                data={generateChartData('categories')}
                title="Revenue Sources"
                height={300}
              />
            </div>
          </div>

          {/* Advanced Data Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Advanced Data Table</h2>
            
            <AdvancedDataTable
              data={sampleData}
              columns={columns}
              title="User Management System"
              searchable={true}
              filterable={true}
              exportable={true}
              selectable={true}
              actions={{
                view: (row) => {
                  modalManager.open('viewModal')
                  console.log('View user:', row)
                },
                edit: (row) => {
                  modalManager.open('editModal')
                  console.log('Edit user:', row)
                },
                delete: (row) => {
                  openDeleteModal()
                  console.log('Delete user:', row)
                }
              }}
            />
          </div>

          {/* Feature Highlights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Advanced Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">A</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Advanced Animations
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Smooth, performant animations using Framer Motion with spring physics and gesture support.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-700">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">R</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Real-time Updates
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Live data synchronization with WebSocket connections and automatic UI updates.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">T</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Type Safety
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Full TypeScript support with comprehensive type definitions and strict mode enabled.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">D</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Dark Mode
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Beautiful dark mode support with system preference detection and manual toggle.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-700">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">M</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Mobile First
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Responsive design that works perfectly on all devices from mobile to desktop.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">P</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Performance
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Optimized for speed with lazy loading, code splitting, and efficient rendering.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdvancedModal
        isOpen={isBasicModalOpen}
        onClose={closeBasicModal}
        title="Basic Modal"
        size="md"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This is a basic modal with default styling. It includes a title, close button, and overlay click to close.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={closeBasicModal}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={closeBasicModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </AdvancedModal>

      <AdvancedModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title="Form Modal"
        size="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your message"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeFormModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={closeFormModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </AdvancedModal>

      <AdvancedModal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        title="Success!"
        type="success"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Your action was completed successfully. All changes have been saved.
        </p>
        <div className="flex justify-center mt-6">
          <button
            onClick={closeSuccessModal}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Great!
          </button>
        </div>
      </AdvancedModal>

      <AdvancedModal
        isOpen={isWarningModalOpen}
        onClose={closeWarningModal}
        title="Warning"
        type="warning"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 text-center">
          This action cannot be undone. Please make sure you want to proceed.
        </p>
        <div className="flex justify-center space-x-3 mt-6">
          <button
            onClick={closeWarningModal}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={closeWarningModal}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Proceed
          </button>
        </div>
      </AdvancedModal>

      <AdvancedModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title="Error"
        type="error"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Something went wrong. Please try again or contact support if the problem persists.
        </p>
        <div className="flex justify-center space-x-3 mt-6">
          <button
            onClick={closeErrorModal}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={closeErrorModal}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </AdvancedModal>

      <AdvancedModal
        isOpen={isInfoModalOpen}
        onClose={closeInfoModal}
        title="Information"
        type="info"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Here's some helpful information about this feature. You can learn more by clicking the link below.
        </p>
        <div className="flex justify-center mt-6">
          <button
            onClick={closeInfoModal}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </AdvancedModal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirm}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action? This cannot be undone."
        confirmText="Yes, proceed"
        cancelText="Cancel"
        type="default"
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Item"
        message="This will permanently delete the selected item. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
      />
    </AdvancedLayout>
  )
}
