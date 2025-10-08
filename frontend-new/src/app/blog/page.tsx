'use client';

import { 
  CalendarIcon,
  UserIcon,
  TagIcon,
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "5 Essential Bookkeeping Tips for Small Business Owners",
      excerpt: "Learn the fundamental principles of bookkeeping that every small business owner should know to maintain healthy finances.",
      author: "Sarah Johnson",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "Bookkeeping",
      image: "/api/placeholder/400/250"
    },
    {
      id: 2,
      title: "How AI is Revolutionizing Financial Management",
      excerpt: "Discover how artificial intelligence is transforming the way businesses handle their financial operations and reporting.",
      author: "Mike Chen",
      date: "2024-01-12",
      readTime: "7 min read",
      category: "Technology",
      image: "/api/placeholder/400/250"
    },
    {
      id: 3,
      title: "Tax Season Preparation: A Complete Checklist",
      excerpt: "Get organized for tax season with our comprehensive checklist to ensure you don't miss any important deadlines or deductions.",
      author: "Emily Rodriguez",
      date: "2024-01-10",
      readTime: "6 min read",
      category: "Tax",
      image: "/api/placeholder/400/250"
    },
    {
      id: 4,
      title: "Understanding Cash Flow: The Lifeblood of Your Business",
      excerpt: "Master the art of cash flow management with practical strategies to keep your business financially healthy.",
      author: "David Thompson",
      date: "2024-01-08",
      readTime: "8 min read",
      category: "Finance",
      image: "/api/placeholder/400/250"
    },
    {
      id: 5,
      title: "Digital Receipt Management: Going Paperless",
      excerpt: "Learn how to streamline your receipt management process with digital solutions and best practices.",
      author: "Lisa Wang",
      date: "2024-01-05",
      readTime: "4 min read",
      category: "Technology",
      image: "/api/placeholder/400/250"
    },
    {
      id: 6,
      title: "Budgeting Strategies for Growing Businesses",
      excerpt: "Discover effective budgeting techniques to support your business growth and financial stability.",
      author: "Robert Martinez",
      date: "2024-01-03",
      readTime: "6 min read",
      category: "Finance",
      image: "/api/placeholder/400/250"
    }
  ];

  const categories = ["All", "Bookkeeping", "Technology", "Tax", "Finance", "Industry News"];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              VeriGrade
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600"> Blog</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest insights on bookkeeping, financial management, 
              and business growth strategies from our expert team.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === "All"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Featured Image</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {post.category}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <button className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium text-sm">
                    Read More
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-500 transition-colors">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and never miss the latest insights on bookkeeping and financial management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-500 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



