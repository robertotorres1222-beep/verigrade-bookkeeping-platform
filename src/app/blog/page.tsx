'use client';

import { motion } from 'framer-motion';
import VeriGradeLogo from '../../components/VeriGradeLogo';
import { 
  CalendarIcon,
  UserIcon,
  ArrowRightIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Bookkeeping: How AI is Transforming Financial Management",
      excerpt: "Discover how artificial intelligence is revolutionizing the way businesses handle their finances, from automated categorization to predictive analytics.",
      author: "Sarah Chen",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "AI & Technology",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      featured: true
    },
    {
      id: 2,
      title: "10 Bookkeeping Mistakes That Cost Small Businesses Thousands",
      excerpt: "Learn about the most common bookkeeping errors and how to avoid them to save your business money and ensure compliance.",
      author: "Michael Rodriguez",
      date: "2024-01-12",
      readTime: "7 min read",
      category: "Best Practices",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      featured: false
    },
    {
      id: 3,
      title: "Understanding Cash Flow: A Complete Guide for Business Owners",
      excerpt: "Master the fundamentals of cash flow management and learn strategies to maintain healthy financial operations.",
      author: "Emily Watson",
      date: "2024-01-10",
      readTime: "8 min read",
      category: "Financial Management",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      featured: false
    },
    {
      id: 4,
      title: "Automation vs. Manual Bookkeeping: Which is Right for Your Business?",
      excerpt: "Compare the pros and cons of automated and manual bookkeeping systems to make the best choice for your business needs.",
      author: "David Kim",
      date: "2024-01-08",
      readTime: "6 min read",
      category: "Automation",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      featured: false
    },
    {
      id: 5,
      title: "Tax Season Preparation: Essential Bookkeeping Tasks",
      excerpt: "Get ready for tax season with our comprehensive checklist of bookkeeping tasks that will make filing easier and more accurate.",
      author: "Lisa Thompson",
      date: "2024-01-05",
      readTime: "9 min read",
      category: "Taxes",
      image: "https://images.unsplash.com/photo-1554224154-26032fced8bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      featured: false
    },
    {
      id: 6,
      title: "The ROI of Investing in AI-Powered Bookkeeping Software",
      excerpt: "Calculate the return on investment of switching to AI-powered bookkeeping and see how much you could save.",
      author: "Alex Johnson",
      date: "2024-01-03",
      readTime: "4 min read",
      category: "ROI Analysis",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      featured: false
    }
  ];

  const categories = [
    "All Posts",
    "AI & Technology", 
    "Best Practices",
    "Financial Management",
    "Automation",
    "Taxes",
    "ROI Analysis"
  ];

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <VeriGradeLogo size="md" variant="full" />
              </a>
            </div>
            <div className="flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="/blog" className="text-blue-600 font-semibold">Blog</a>
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              VeriGrade{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Blog
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto"
            >
              Insights, tips, and best practices for modern bookkeeping and financial management.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-12 text-white">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex items-center mb-4">
                      <TagIcon className="h-5 w-5 mr-2" />
                      <span className="text-blue-200 font-semibold">{featuredPost.category}</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                    <p className="text-blue-100 mb-6 text-lg">{featuredPost.excerpt}</p>
                    <div className="flex items-center text-blue-200 mb-6">
                      <UserIcon className="h-5 w-5 mr-2" />
                      <span className="mr-4">{featuredPost.author}</span>
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <span className="mr-4">{new Date(featuredPost.date).toLocaleDateString()}</span>
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                    <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200">
                      Read Full Article
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </button>
                  </motion.div>
                </div>
                <div className="relative">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 ${
                  category === "All Posts"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span className="mr-4">{post.author}</span>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="mr-4">{new Date(post.date).toLocaleDateString()}</span>
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{post.readTime}</span>
                  </div>
                  
                  <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
                    Read More
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Stay Updated
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get the latest insights on bookkeeping, AI technology, and financial management delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <VeriGradeLogo size="md" variant="full" />
            <p className="text-sm text-gray-500">
              © 2024 VeriGrade, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}