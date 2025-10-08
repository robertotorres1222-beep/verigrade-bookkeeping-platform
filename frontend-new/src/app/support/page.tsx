'use client';

import { 
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function SupportPage() {
  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help with our 24/7 chat support",
      icon: ChatBubbleLeftRightIcon,
      availability: "24/7",
      responseTime: "Immediate",
      features: ["Instant responses", "Screen sharing", "File sharing", "Chat history"],
      action: "Start Chat",
      color: "bg-green-600 hover:bg-green-500"
    },
    {
      title: "Email Support",
      description: "Send us a detailed message and we'll respond quickly",
      icon: EnvelopeIcon,
      availability: "24/7",
      responseTime: "2-4 hours",
      features: ["Detailed responses", "File attachments", "Priority support", "Email history"],
      action: "Send Email",
      color: "bg-blue-600 hover:bg-blue-500"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our support team",
      icon: PhoneIcon,
      availability: "Mon-Fri 9AM-6PM EST",
      responseTime: "Immediate",
      features: ["Direct conversation", "Screen sharing", "Complex issues", "Personal touch"],
      action: "Call Now",
      color: "bg-purple-600 hover:bg-purple-500"
    },
    {
      title: "Video Call",
      description: "Schedule a video session with our experts",
      icon: VideoCameraIcon,
      availability: "By appointment",
      responseTime: "Scheduled",
      features: ["Screen sharing", "Face-to-face", "Training sessions", "Complex setups"],
      action: "Schedule Call",
      color: "bg-indigo-600 hover:bg-indigo-500"
    }
  ];

  const helpResources = [
    {
      title: "Getting Started Guide",
      description: "Step-by-step guide to set up your account",
      icon: DocumentTextIcon,
      type: "Guide",
      duration: "15 min",
      link: "/guides"
    },
    {
      title: "Video Tutorials",
      description: "Watch our comprehensive video library",
      icon: VideoCameraIcon,
      type: "Video",
      duration: "5-30 min",
      link: "/guides"
    },
    {
      title: "FAQ",
      description: "Find quick answers to common questions",
      icon: DocumentTextIcon,
      type: "FAQ",
      duration: "2-5 min",
      link: "/faq"
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      icon: DocumentTextIcon,
      type: "Technical",
      duration: "30+ min",
      link: "/guides"
    }
  ];

  const commonIssues = [
    {
      title: "Can't connect my bank account",
      solution: "Check your bank credentials and ensure your bank supports our connection. Contact support if issues persist.",
      category: "Account Setup"
    },
    {
      title: "Receipt not processing correctly",
      solution: "Ensure the receipt image is clear and contains readable text. Try capturing again with better lighting.",
      category: "Receipt Processing"
    },
    {
      title: "Missing transactions",
      solution: "Bank connections may take 24-48 hours to sync. Check your connection status in settings.",
      category: "Data Sync"
    },
    {
      title: "Can't access reports",
      solution: "Ensure you have sufficient data for the selected time period. Contact support for custom report needs.",
      category: "Reporting"
    },
    {
      title: "Mobile app not working",
      solution: "Update to the latest version and check your internet connection. Clear app cache if needed.",
      category: "Mobile App"
    },
    {
      title: "Integration not syncing",
      solution: "Check your integration settings and API credentials. Re-authorize if necessary.",
      category: "Integrations"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Support
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Center</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Get help when you need it. Our support team is here to ensure your success with VeriGrade.
            </p>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Support</h2>
            <p className="text-lg text-gray-600">Choose the support option that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                  <option.icon className="h-6 w-6 text-gray-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 mb-4">{option.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Availability:</span>
                    <span className="font-medium">{option.availability}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Response Time:</span>
                    <span className="font-medium">{option.responseTime}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`w-full ${option.color} text-white px-4 py-2 rounded-lg font-semibold transition-colors`}>
                  {option.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Resources */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Self-Help Resources</h2>
            <p className="text-lg text-gray-600">Find answers and learn at your own pace</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {helpResources.map((resource, index) => (
              <a
                key={index}
                href={resource.link}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4 group-hover:bg-indigo-200 transition-colors">
                  <resource.icon className="h-6 w-6 text-indigo-600" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {resource.type}
                    </span>
                    <span className="text-xs text-gray-500">{resource.duration}</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Issues</h2>
            <p className="text-lg text-gray-600">Quick solutions to frequent problems</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {commonIssues.map((issue, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {issue.category}
                  </span>
                </div>
                <p className="text-gray-600">{issue.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-lg text-gray-600">Multiple ways to reach our support team</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-2">Available 24/7</p>
                <button className="text-green-600 hover:text-green-500 font-medium text-sm">
                  Start Chat Now
                </button>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-2">support@verigrade.com</p>
                <button className="text-blue-600 hover:text-blue-500 font-medium text-sm">
                  Send Email
                </button>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                  <PhoneIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 mb-2">1-800-VERIGRADE</p>
                <button className="text-purple-600 hover:text-purple-500 font-medium text-sm">
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
