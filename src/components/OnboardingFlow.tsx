'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ReactNode
}

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    industry: '',
    employees: '',
    monthlyRevenue: '',
    bankAccounts: [] as string[],
    accountingSoftware: '',
    goals: [] as string[]
  })

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to VeriGrade',
      description: 'Let\'s set up your bookkeeping platform',
      component: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto"
          >
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Get Started in Minutes</h2>
            <p className="text-gray-600 mt-2">We'll help you set up your bookkeeping system step by step</p>
          </div>
        </div>
      )
    },
    {
      id: 'business-info',
      title: 'Business Information',
      description: 'Tell us about your business',
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Your Business Name"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                placeholder="LLC, Corporation, etc."
                value={formData.businessType}
                onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="Technology, Retail, Services, etc."
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="employees">Number of Employees</Label>
              <Input
                id="employees"
                type="number"
                placeholder="1-10, 11-50, etc."
                value={formData.employees}
                onChange={(e) => setFormData(prev => ({ ...prev, employees: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'financial-info',
      title: 'Financial Overview',
      description: 'Help us understand your financial needs',
      component: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="monthlyRevenue">Monthly Revenue (estimated)</Label>
            <Input
              id="monthlyRevenue"
              type="number"
              placeholder="$0 - $10,000, $10,000 - $50,000, etc."
              value={formData.monthlyRevenue}
              onChange={(e) => setFormData(prev => ({ ...prev, monthlyRevenue: e.target.value }))}
            />
          </div>
          <div>
            <Label>Current Accounting Software</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {['QuickBooks', 'Xero', 'Wave', 'FreshBooks', 'None', 'Other'].map((software) => (
                <Button
                  key={software}
                  onClick={() => setFormData(prev => ({ ...prev, accountingSoftware: software }))}
                  className={`justify-start ${formData.accountingSoftware === software ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                >
                  {software}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'Your Goals',
      description: 'What do you want to achieve with VeriGrade?',
      component: (
        <div className="space-y-4">
          {[
            { id: 'automate-bookkeeping', label: 'Automate bookkeeping tasks' },
            { id: 'real-time-insights', label: 'Get real-time financial insights' },
            { id: 'tax-preparation', label: 'Simplify tax preparation' },
            { id: 'expense-tracking', label: 'Better expense tracking' },
            { id: 'invoice-management', label: 'Streamline invoicing' },
            { id: 'financial-reporting', label: 'Generate financial reports' }
          ].map((goal) => (
              <Button
                key={goal.id}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    goals: prev.goals.includes(goal.id)
                      ? prev.goals.filter(id => id !== goal.id)
                      : [...prev.goals, goal.id]
                  }))
                }}
                className={`w-full justify-start ${formData.goals.includes(goal.id) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
              >
                {goal.label}
              </Button>
          ))}
        </div>
      )
    },
    {
      id: 'completion',
      title: 'Setup Complete!',
      description: 'You\'re all set to start using VeriGrade',
      component: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
          >
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to VeriGrade!</h2>
            <p className="text-gray-600 mt-2">Your bookkeeping platform is ready to use</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Connect your bank accounts</li>
              <li>• Import existing transactions</li>
              <li>• Set up your chart of accounts</li>
              <li>• Configure tax settings</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    // Save onboarding data and redirect to dashboard
    console.log('Onboarding completed:', formData)
    // In a real app, you'd save this data and redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </div>
              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <motion.div
                className="bg-indigo-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </CardHeader>
          
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {steps[currentStep].component}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="bg-gray-100 text-gray-900 hover:bg-gray-200"
              >
                Previous
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button onClick={completeOnboarding}>
                  Complete Setup
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
