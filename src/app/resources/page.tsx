'use client';

import { 
  BookOpenIcon,
  AcademicCapIcon,
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  PlayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function ResourcesPage() {
  const blogPosts = [
    {
      title: '10 Bookkeeping Mistakes That Cost Small Businesses Money',
      excerpt: 'Learn about the most common bookkeeping errors and how to avoid them to save your business thousands.',
      author: 'Sarah Chen',
      date: 'Dec 15, 2024',
      readTime: '5 min read',
      category: 'Bookkeeping Tips',
      image: '📊',
      featured: true
    },
    {
      title: 'AI vs Traditional Bookkeeping: Which is Right for Your Business?',
      excerpt: 'Compare AI-powered bookkeeping with traditional methods to find the best solution for your business.',
      author: 'Michael Rodriguez',
      date: 'Dec 12, 2024',
      readTime: '7 min read',
      category: 'AI & Technology',
      image: '🤖',
      featured: false
    },
    {
      title: 'Tax Deductions Every Small Business Owner Should Know',
      excerpt: 'Discover tax deductions that can significantly reduce your business tax burden.',
      author: 'Emily Johnson',
      date: 'Dec 10, 2024',
      readTime: '6 min read',
      category: 'Tax Tips',
      image: '💰',
      featured: false
    },
    {
      title: 'How to Choose the Right Accounting Software for Your Business',
      excerpt: 'A comprehensive guide to selecting accounting software that fits your business needs.',
      author: 'David Kim',
      date: 'Dec 8, 2024',
      readTime: '8 min read',
      category: 'Software Guide',
      image: '💻',
      featured: false
    }
  ];

  const guides = [
    {
      title: 'Complete Guide to Small Business Bookkeeping',
      description: 'Everything you need to know about setting up and maintaining your business books.',
      type: 'Guide',
      pages: 45,
      downloads: '12.5K',
      rating: 4.9,
      icon: BookOpenIcon
    },
    {
      title: 'Receipt Management Best Practices',
      description: 'Learn how to organize and manage receipts for maximum tax benefits.',
      type: 'Checklist',
      pages: 12,
      downloads: '8.2K',
      rating: 4.8,
      icon: DocumentTextIcon
    },
    {
      title: 'Financial Reporting for Beginners',
      description: 'Understand key financial reports and what they mean for your business.',
      type: 'Tutorial',
      pages: 28,
      downloads: '15.3K',
      rating: 4.9,
      icon: ChartBarIcon
    },
    {
      title: 'Tax Preparation Checklist 2024',
      description: 'Complete checklist to ensure you\'re ready for tax season.',
      type: 'Checklist',
      pages: 8,
      downloads: '22.1K',
      rating: 4.7,
      icon: AcademicCapIcon
    }
  ];

  const caseStudies = [
    {
      company: 'TechStart Inc.',
      industry: 'Technology',
      challenge: 'Manual bookkeeping taking 20+ hours per week',
      solution: 'Implemented VeriGrade AI-powered bookkeeping',
      results: [
        'Saved 18 hours per week',
        '99.5% accuracy rate',
        'Reduced errors by 95%',
        'ROI of 400% in first year'
      ],
      image: '🚀'
    },
    {
      company: 'CreativeStudio',
      industry: 'Creative Services',
      challenge: 'Complex multi-currency transactions',
      solution: 'VeriGrade with multi-currency support',
      results: [
        'Automated currency conversion',
        'Real-time exchange rates',
        'Simplified reporting',
        'Saved $5K in fees annually'
      ],
      image: '🎨'
    },
    {
      company: 'GrowthCorp',
      industry: 'Consulting',
      challenge: 'Scaling from 10 to 100+ clients',
      solution: 'VeriGrade Enterprise with team collaboration',
      results: [
        'Scaled to 150 clients',
        'Reduced admin time by 70%',
        'Improved client satisfaction',
        'Increased revenue by 300%'
      ],
      image: '📈'
    }
  ];

  const webinars = [
    {
      title: 'AI-Powered Bookkeeping: The Future is Here',
      date: 'Jan 15, 2025',
      time: '2:00 PM EST',
      speaker: 'Sarah Chen, CEO',
      attendees: '1,247 registered',
      description: 'Learn how AI is transforming bookkeeping and what it means for your business.'
    },
    {
      title: 'Tax Season Prep: Get Ready for 2024',
      date: 'Jan 22, 2025',
      time: '1:00 PM EST',
      speaker: 'Emily Johnson, CPA',
      attendees: '892 registered',
      description: 'Essential tips and strategies to prepare for the upcoming tax season.'
    },
    {
      title: 'Financial Planning for Small Businesses',
      date: 'Jan 29, 2025',
      time: '3:00 PM EST',
      speaker: 'Michael Rodriguez, CFO',
      attendees: '654 registered',
      description: 'How to create and maintain a solid financial plan for business growth.'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 mb-6">
              <BookOpenIcon className="h-4 w-4 mr-2" />
              Learning Center
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Resources & Learning
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Hub</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Everything you need to master your business finances. From guides and tutorials to case studies and webinars.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#blog"
                className="rounded-md bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-green-500 hover:to-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transform hover:scale-105 transition-all duration-200"
              >
                Start Learning
              </a>
              <a
                href="#guides"
                className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-2 hover:text-green-600 transition-colors"
              >
                <ArrowRightIcon className="h-4 w-4" />
                Browse Guides
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Latest from Our Blog
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Expert insights, tips, and best practices to help you succeed
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {blogPosts.map((post, index) => (
              <article key={index} className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${post.featured && index === 0 ? 'lg:col-span-2 lg:row-span-1' : ''}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      {post.category}
                    </span>
                    <span className="text-2xl">{post.image}</span>
                  </div>
                  <h3 className={`font-semibold text-gray-900 mb-2 ${post.featured ? 'text-xl' : 'text-lg'}`}>
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {post.date}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <button className="text-green-600 hover:text-green-500 font-medium text-sm flex items-center">
                      Read More
                      <ArrowRightIcon className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="/blog"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View All Posts
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section id="guides" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Free Guides & Resources
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Download our comprehensive guides to master business finances
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guides.map((guide, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <guide.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    {guide.type}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    {guide.pages} pages
                  </div>
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {guide.downloads}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-900">{guide.rating}</span>
                  </div>
                  <button className="text-green-600 hover:text-green-500 font-medium text-sm">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Success Stories
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              See how businesses like yours are transforming their finances with VeriGrade
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">{study.image}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{study.company}</h3>
                  <p className="text-sm text-gray-600">{study.industry}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Challenge:</h4>
                    <p className="text-sm text-gray-600">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Solution:</h4>
                    <p className="text-sm text-gray-600">{study.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Results:</h4>
                    <ul className="space-y-1">
                      {study.results.map((result, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-600">
                          <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></div>
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="w-full text-green-600 hover:text-green-500 font-medium text-sm">
                    Read Full Case Study
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Webinars Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Upcoming Webinars
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Join our live sessions and learn from industry experts
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {webinars.map((webinar, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{webinar.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{webinar.description}</p>
                  </div>
                  <PlayIcon className="h-6 w-6 text-green-600 flex-shrink-0 ml-4" />
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {webinar.date}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {webinar.time}
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    {webinar.speaker}
                  </div>
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    {webinar.attendees}
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors">
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Need Help?
                </h2>
                <p className="text-green-100 text-lg mb-8">
                  Our support team is here to help you succeed. Get answers to your questions 
                  and learn how to make the most of VeriGrade.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-200 mr-3" />
                    <span className="text-white">Live chat support</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpenIcon className="h-5 w-5 text-green-200 mr-3" />
                    <span className="text-white">Comprehensive help center</span>
                  </div>
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-green-200 mr-3" />
                    <span className="text-white">Video tutorials</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-6">Get Support</h3>
                <div className="space-y-4">
                  <button className="w-full bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Start Live Chat
                  </button>
                  <button className="w-full border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
                    Browse Help Center
                  </button>
                  <button className="w-full border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
                    Watch Tutorials
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



