'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface FormField {
  id: string
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'radio' | 'file'
  label: string
  placeholder?: string
  required?: boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  options?: string[] // For select, radio
  conditional?: {
    dependsOn: string
    value: any
  }
}

interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

interface FormConfig {
  id: string
  title: string
  description?: string
  sections: FormSection[]
  submitText?: string
  validation?: 'onSubmit' | 'onChange' | 'onBlur'
}

export default function AdvancedFormBuilder() {
  const [formConfig, setFormConfig] = useState<FormConfig>({
    id: 'new-form',
    title: 'New Form',
    description: 'Build your custom form',
    sections: [
      {
        id: 'section-1',
        title: 'Basic Information',
        fields: []
      }
    ],
    submitText: 'Submit',
    validation: 'onSubmit'
  })

  const [activeSection, setActiveSection] = useState('section-1')
  const [previewMode, setPreviewMode] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: DocumentTextIcon },
    { type: 'email', label: 'Email', icon: DocumentTextIcon },
    { type: 'number', label: 'Number', icon: CurrencyDollarIcon },
    { type: 'select', label: 'Dropdown', icon: DocumentTextIcon },
    { type: 'textarea', label: 'Text Area', icon: DocumentTextIcon },
    { type: 'date', label: 'Date Picker', icon: CalendarIcon },
    { type: 'checkbox', label: 'Checkbox', icon: CheckCircleIcon },
    { type: 'radio', label: 'Radio Button', icon: CheckCircleIcon },
    { type: 'file', label: 'File Upload', icon: DocumentTextIcon }
  ]

  const addField = useCallback((sectionId: string, fieldType: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType as FormField['type'],
      label: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      required: false
    }

    setFormConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    }))
  }, [])

  const updateField = useCallback((sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    setFormConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : section
      )
    }))
  }, [])

  const removeField = useCallback((sectionId: string, fieldId: string) => {
    setFormConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
          : section
      )
    }))
  }, [])

  const addSection = useCallback(() => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      fields: []
    }

    setFormConfig(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }, [])

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`
    }

    if (field.validation) {
      const { min, max, pattern, message } = field.validation

      if (min !== undefined && Number(value) < min) {
        return message || `${field.label} must be at least ${min}`
      }

      if (max !== undefined && Number(value) > max) {
        return message || `${field.label} must be at most ${max}`
      }

      if (pattern && !new RegExp(pattern).test(value)) {
        return message || `${field.label} format is invalid`
      }
    }

    return null
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))

    if (formConfig.validation === 'onChange') {
      const section = formConfig.sections.find(s => s.fields.some(f => f.id === fieldId))
      const field = section?.fields.find(f => f.id === fieldId)
      
      if (field) {
        const error = validateField(field, value)
        setErrors(prev => ({
          ...prev,
          [fieldId]: error || ''
        }))
      }
    }
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}

    formConfig.sections.forEach(section => {
      section.fields.forEach(field => {
        const error = validateField(field, formData[field.id])
        if (error) {
          newErrors[field.id] = error
        }
      })
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData)
      // Handle form submission
    }
  }

  const renderField = (field: FormField) => {
    const fieldId = field.id
    const value = formData[fieldId] || ''
    const error = errors[fieldId]

    const baseClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      error ? 'border-red-300' : 'border-gray-300'
    }`

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={fieldId}>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={baseClasses}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={fieldId}>
            <textarea
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              rows={4}
              className={baseClasses}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={fieldId}>
            <select
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={baseClasses}
            >
              <option value="">Select an option</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'date':
        return (
          <div key={fieldId}>
            <input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={baseClasses}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'checkbox':
        return (
          <div key={fieldId} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'radio':
        return (
          <div key={fieldId}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  name={fieldId}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </div>
            ))}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'file':
        return (
          <div key={fieldId}>
            <input
              type="file"
              onChange={(e) => handleFieldChange(fieldId, e.target.files?.[0])}
              className={baseClasses}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  const activeSectionData = formConfig.sections.find(s => s.id === activeSection)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Form Builder</h1>
              <p className="text-gray-600 mt-1">Create dynamic forms with validation and conditional logic</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  previewMode 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <EyeIcon className="w-4 h-4 inline mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Save Form
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Form Structure */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Structure</h3>
              
              {/* Form Settings */}
              <div className="mb-6">
                <input
                  type="text"
                  value={formConfig.title}
                  onChange={(e) => setFormConfig(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                  placeholder="Form Title"
                />
                <textarea
                  value={formConfig.description || ''}
                  onChange={(e) => setFormConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Form Description"
                  rows={3}
                />
              </div>

              {/* Sections */}
              <div className="space-y-3">
                {formConfig.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      activeSection === section.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{section.title}</h4>
                        <p className="text-sm text-gray-500">{section.fields.length} fields</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (formConfig.sections.length > 1) {
                            setFormConfig(prev => ({
                              ...prev,
                              sections: prev.sections.filter(s => s.id !== section.id)
                            }))
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                        disabled={formConfig.sections.length === 1}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addSection}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 inline mr-2" />
                  Add Section
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {previewMode ? (
              /* Preview Mode */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{formConfig.title}</h2>
                  {formConfig.description && (
                    <p className="text-gray-600 mt-2">{formConfig.description}</p>
                  )}
                </div>

                <div className="space-y-6">
                  {formConfig.sections.map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
                      {section.description && (
                        <p className="text-gray-600 mb-4">{section.description}</p>
                      )}
                      
                      <div className="space-y-4">
                        {section.fields.map((field) => (
                          <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {renderField(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {formConfig.submitText || 'Submit'}
                  </button>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Section: {activeSectionData?.title}</h2>
                  <p className="text-gray-600 mt-1">Add and configure fields for this section</p>
                </div>

                {/* Field Types */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Field</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {fieldTypes.map((fieldType) => (
                      <button
                        key={fieldType.type}
                        onClick={() => addField(activeSection, fieldType.type)}
                        className="p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                      >
                        <fieldType.icon className="w-5 h-5 text-gray-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">{fieldType.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fields in Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Fields in Section</h3>
                  {activeSectionData?.fields.map((field) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">{field.label}</h4>
                        <button
                          onClick={() => removeField(activeSection, field.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(activeSection, field.id, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => updateField(activeSection, field.id, { type: e.target.value as FormField['type'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {fieldTypes.map((type) => (
                              <option key={type.type} value={type.type}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(activeSection, field.id, { placeholder: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.required || false}
                              onChange={(e) => updateField(activeSection, field.id, { required: e.target.checked })}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Required</span>
                          </label>
                        </div>
                      </div>

                      {/* Field Preview */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                        {renderField(field)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}




