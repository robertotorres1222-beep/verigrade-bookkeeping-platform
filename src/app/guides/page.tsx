'use client';

import { 
  BookOpenIcon,
  DocumentTextIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function GuidesPage() {
  const guides = [
    {
      id: 1,
      title: "Getting Started with VeriGrade",
      description: "Complete beginner's guide to setting up and using VeriGrade for your business.",
      type: "Guide",
      duration: "15 min",
      difficulty: "Beginner",
      downloads: "2.3k",
      featured: true,
      topics: ["Setup", "Onboarding", "First Steps"]
    },
    {
      id: 2,
      title: "Receipt Processing Best Practices",
      description: "Learn how to efficiently capture, organize, and process receipts for maximum accuracy.",
      type: "Guide",
      duration: "12 min",
      difficulty: "Intermediate",
      downloads: "1.8k",
      featured: true,
      topics: ["Receipts", "Organization", "Processing"]
    },
    {
      id: 3,
      title: "Understanding Financial Reports",
      description: "Master the art of reading and interpreting your financial reports for better decision making.",
      type: "Guide",
      duration: "20 min",
      difficulty: "Intermediate",
      downloads: "1.5k",
      featured: false,
      topics: ["Reports", "Analytics", "Insights"]
    },
    {
      id: 4,
      title: "Tax Preparation Checklist",
      description: "Everything you need to prepare for tax season with VeriGrade.",
      type: "Checklist",
      duration: "8 min",
      difficulty: "Beginner",
      downloads: "3.1k",
      featured: true,
      topics: ["Tax", "Preparation", "Checklist"]
    },
    {
      id: 5,
      title: "Advanced Analytics & Forecasting",
      description: "Unlock the power of predictive analytics to forecast your business performance.",
      type: "Guide",
      duration: "25 min",
      difficulty: "Advanced",
      downloads: "892",
      featured: false,
      topics: ["Analytics", "Forecasting", "Predictions"]
    },
    {
      id: 6,
      title: "Integrating Third-Party Tools",
      description: "Connect VeriGrade with your existing business tools for seamless workflow.",
      type: "Guide",
      duration: "18 min",
      difficulty: "Intermediate",
      downloads: "1.2k",
      featured: false,
      topics: ["Integrations", "API", "Workflow"]
    },
    {
      id: 7,
      title: "Mobile App Quick Start",
      description: "Get the most out of VeriGrade's mobile app for on-the-go bookkeeping.",
      type: "Tutorial",
      duration: "10 min",
      difficulty: "Beginner",
      downloads: "2.7k",
      featured: true,
      topics: ["Mobile", "App", "Quick Start"]
    },
    {
      id: 8,
      title: "Troubleshooting Common Issues",
      description: "Solutions to the most frequently encountered problems and questions.",
      type: "Guide",
      duration: "14 min",
      difficulty: "Beginner",
      downloads: "1.9k",
      featured: false,
      topics: ["Support", "Troubleshooting", "FAQ"]
    }
  ];

  const categories = ["All", "Getting Started", "Advanced", "Mobile", "Integrations", "Troubleshooting"];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Learning
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Center</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Comprehensive guides, tutorials, and resources to help you master 
              VeriGrade and optimize your business finances.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600">50+</div>
              <div className="text-sm text-gray-600">Guides & Tutorials</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">15k+</div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">4.9/5</div>
              <div className="text-sm text-gray-600">User Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Resources</h2>
            <p className="text-lg text-gray-600">Most popular guides and tutorials</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {guides.filter(guide => guide.featured).map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {guide.type === "Tutorial" ? (
                      <PlayIcon className="h-6 w-6 text-blue-600" />
                    ) : guide.type === "Checklist" ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    ) : (
                      <BookOpenIcon className="h-6 w-6 text-indigo-600" />
                    )}
                    <span className="text-sm font-medium text-gray-600">{guide.type}</span>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {guide.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{guide.title}</h3>
                <p className="text-gray-600 mb-4">{guide.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {guide.topics.map((topic) => (
                    <span
                      key={topic}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{guide.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span>{guide.downloads}</span>
                    </div>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors">
                    View Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Guides */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        category === "All"
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
                  <div className="space-y-2 text-sm">
                    <a href="/contact" className="block text-blue-600 hover:text-blue-500">
                      Contact Support
                    </a>
                    <a href="/resources" className="block text-blue-600 hover:text-blue-500">
                      All Resources
                    </a>
                    <a href="/pricing" className="block text-blue-600 hover:text-blue-500">
                      Pricing Plans
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Guides Grid */}
            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guides.map((guide) => (
                  <div
                    key={guide.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {guide.type === "Tutorial" ? (
                          <PlayIcon className="h-5 w-5 text-blue-600" />
                        ) : guide.type === "Checklist" ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                        )}
                        <span className="text-xs font-medium text-gray-600">{guide.type}</span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {guide.difficulty}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{guide.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{guide.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {guide.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <ArrowDownTrayIcon className="h-3 w-3" />
                          {guide.downloads}
                        </span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-500 font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Need More Help?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-500 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/resources"
              className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Browse All Resources
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}



