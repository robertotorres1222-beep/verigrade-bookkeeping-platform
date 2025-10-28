'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function GlobalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);

  const navigation = [
    { name: 'Product', href: '/product' },
    { name: 'Services', href: '/services' },
    { name: 'Advanced', href: '/advanced' },
    { name: 'Demo', href: '/advanced-demo' },
    { name: 'About', href: '/about' },
    { name: 'Resources', href: '/resources' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Help', href: '/help' },
    { name: 'Security', href: '/security' },
  ];

  const contactOptions = [
    {
      name: 'Video Call',
      description: 'Schedule a video consultation',
      icon: VideoCameraIcon,
      href: '/contact',
      color: 'text-blue-600'
    },
    {
      name: 'Text Back',
      description: 'We\'ll text you back quickly',
      icon: ChatBubbleLeftRightIcon,
      href: '/contact',
      color: 'text-green-600'
    },
    {
      name: 'Write Back',
      description: 'Send us a message',
      icon: DocumentTextIcon,
      href: '/contact',
      color: 'text-purple-600'
    }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          {/* Logo and Home Link */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-gray-900">VeriGrade</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {/* Home Button */}
            <Link
              href="/"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>

            {/* Contact Dropdown */}
            <div className="relative">
              <button
                onClick={() => setContactMenuOpen(!contactMenuOpen)}
                className="bg-blue-600 text-white hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <PhoneIcon className="h-4 w-4" />
                Contact Us
              </button>

              {/* Contact Dropdown Menu */}
              {contactMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {contactOptions.map((option) => (
                    <Link
                      key={option.name}
                      href={option.href}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setContactMenuOpen(false)}
                    >
                      <option.icon className={`h-5 w-5 mr-3 ${option.color}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{option.name}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Login/Register */}
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              href="/"
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              <HomeIcon className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Contact Options */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-3 py-2 text-sm font-medium text-gray-500">Contact Options:</div>
                {contactOptions.map((option) => (
                  <Link
                    key={option.name}
                    href={option.href}
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <option.icon className={`h-5 w-5 mr-3 ${option.color}`} />
                    <div>
                      <div className="text-sm font-medium">{option.name}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile Auth */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-500 block px-3 py-2 text-base font-medium rounded-lg mx-3 mt-2 text-center transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close dropdown */}
      {contactMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setContactMenuOpen(false)}
        />
      )}
    </header>
  );
}
