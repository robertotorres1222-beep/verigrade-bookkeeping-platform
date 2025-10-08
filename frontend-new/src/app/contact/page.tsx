'use client';

import { useState } from 'react';
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    service: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/v1/contact/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Thank you for your message! We\'ll get back to you within 24 hours.');
        setFormData({ name: '', email: '', company: '', phone: '', message: '', service: '' });
      } else {
        alert('Sorry, there was an error sending your message. Please try again or contact us directly.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      alert('Sorry, there was an error sending your message. Please try again or contact us directly.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Get in Touch
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> With Us</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Ready to transform your business finances? Contact our team to get started 
              with VeriGrade's AI-powered bookkeeping platform.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Interest
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    <option value="bookkeeping">Professional Bookkeeping</option>
                    <option value="tax">Tax Preparation</option>
                    <option value="consulting">Financial Consulting</option>
                    <option value="payroll">Payroll Management</option>
                    <option value="enterprise">Enterprise Solutions</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about your business needs and how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Contact Information
              </h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <PhoneIcon className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">1-800-VERIGRADE</p>
                    <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">verigrade+hello@gmail.com</p>
                    <p className="text-sm text-gray-500">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPinIcon className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Office</h4>
                    <p className="text-gray-600">123 Business Ave<br />San Francisco, CA 94105</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Live Chat</h4>
                    <p className="text-gray-600">Available 24/7</p>
                    <button className="text-blue-600 hover:text-blue-500 text-sm font-medium mt-1">
                      Start Chat <ArrowRightIcon className="h-3 w-3 inline ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <a href="/pricing" className="block text-blue-600 hover:text-blue-500 text-sm">
                    View Pricing Plans
                  </a>
                  <a href="/product" className="block text-blue-600 hover:text-blue-500 text-sm">
                    Learn About Features
                  </a>
                  <a href="/resources" className="block text-blue-600 hover:text-blue-500 text-sm">
                    Browse Resources
                  </a>
                  <a href="/register" className="block text-blue-600 hover:text-blue-500 text-sm">
                    Start Free Trial
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">How quickly can you get started?</h3>
              <p className="text-gray-600 text-sm">Most businesses can be up and running within 24-48 hours of onboarding.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer custom integrations?</h3>
              <p className="text-gray-600 text-sm">Yes, we provide custom integrations for enterprise clients.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">What's included in the free trial?</h3>
              <p className="text-gray-600 text-sm">Full access to all features with no credit card required for 14 days.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Do you provide training?</h3>
              <p className="text-gray-600 text-sm">Yes, we offer comprehensive training and ongoing support.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



