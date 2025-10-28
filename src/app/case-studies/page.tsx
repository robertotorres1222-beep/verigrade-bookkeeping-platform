'use client';

import { 
  BuildingOfficeIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      id: 1,
      title: "TechStart Inc.: 300% Revenue Growth with Automated Bookkeeping",
      company: "TechStart Inc.",
      industry: "Technology",
      size: "50-100 employees",
      challenge: "Manual bookkeeping processes were slowing down growth and causing errors in financial reporting.",
      solution: "Implemented VeriGrade's AI-powered bookkeeping platform with automated receipt processing and real-time reporting.",
      results: [
        "300% increase in revenue over 18 months",
        "80% reduction in bookkeeping time",
        "95% accuracy in financial reporting",
        "Saved $50,000 annually in accounting costs"
      ],
      featured: true,
      testimonial: {
        text: "VeriGrade transformed our financial operations. What used to take days now takes minutes, and the accuracy is incredible.",
        author: "Sarah Chen",
        role: "CFO, TechStart Inc.",
        rating: 5
      }
    },
    {
      id: 2,
      title: "RetailMax: Streamlined Multi-Location Operations",
      company: "RetailMax",
      industry: "Retail",
      size: "200+ employees",
      challenge: "Managing finances across 15 retail locations with inconsistent processes and delayed reporting.",
      solution: "Deployed VeriGrade across all locations with centralized reporting and automated reconciliation.",
      results: [
        "50% faster month-end closing",
        "Real-time visibility across all locations",
        "99.8% accuracy in inventory tracking",
        "Reduced financial discrepancies by 90%"
      ],
      featured: true,
      testimonial: {
        text: "The centralized dashboard gives us instant insights into each location's performance. Game-changer for our business.",
        author: "Michael Rodriguez",
        role: "Operations Director, RetailMax",
        rating: 5
      }
    },
    {
      id: 3,
      title: "HealthCare Plus: HIPAA-Compliant Financial Management",
      company: "HealthCare Plus",
      industry: "Healthcare",
      size: "100-200 employees",
      challenge: "Need for secure, HIPAA-compliant bookkeeping solution with detailed audit trails.",
      solution: "Implemented VeriGrade with enhanced security features and compliance monitoring.",
      results: [
        "100% HIPAA compliance maintained",
        "60% reduction in audit preparation time",
        "Zero security incidents",
        "Improved patient billing accuracy by 25%"
      ],
      featured: false,
      testimonial: {
        text: "VeriGrade's security features give us peace of mind while maintaining the highest standards of compliance.",
        author: "Dr. Jennifer Walsh",
        role: "Administrative Director, HealthCare Plus",
        rating: 5
      }
    },
    {
      id: 4,
      title: "Restaurant Group: Multi-Brand Financial Consolidation",
      company: "Urban Eats Group",
      industry: "Food & Beverage",
      size: "150+ employees",
      challenge: "Consolidating finances across 8 different restaurant brands with varying accounting needs.",
      solution: "Custom VeriGrade setup with brand-specific reporting and consolidated analytics.",
      results: [
        "Unified financial reporting across all brands",
        "40% faster financial analysis",
        "Identified $75,000 in cost savings",
        "Streamlined tax preparation process"
      ],
      featured: false,
      testimonial: {
        text: "Finally, we can see the big picture across all our brands while maintaining detailed insights for each location.",
        author: "Alex Thompson",
        role: "Finance Manager, Urban Eats Group",
        rating: 5
      }
    },
    {
      id: 5,
      title: "Creative Agency: Project-Based Financial Tracking",
      company: "PixelPerfect Studios",
      industry: "Creative Services",
      size: "25-50 employees",
      challenge: "Tracking project profitability and managing client billing across multiple creative projects.",
      solution: "VeriGrade with project-based accounting and automated client invoicing.",
      results: [
        "25% increase in project profitability",
        "Automated invoicing saves 10 hours/week",
        "Real-time project cost tracking",
        "Improved cash flow management"
      ],
      featured: false,
      testimonial: {
        text: "Now we know exactly which projects are profitable and can make data-driven decisions about our business.",
        author: "Emma Davis",
        role: "Creative Director, PixelPerfect Studios",
        rating: 5
      }
    },
    {
      id: 6,
      title: "Manufacturing Co.: Supply Chain Financial Integration",
      company: "Precision Manufacturing",
      industry: "Manufacturing",
      size: "300+ employees",
      challenge: "Complex supply chain financial tracking with multiple vendors and inventory management.",
      solution: "Advanced VeriGrade implementation with supply chain integration and inventory costing.",
      results: [
        "30% reduction in inventory carrying costs",
        "Automated vendor payment processing",
        "Real-time cost tracking per product line",
        "Improved supplier relationship management"
      ],
      featured: false,
      testimonial: {
        text: "The supply chain integration has revolutionized how we manage our manufacturing finances.",
        author: "Robert Kim",
        role: "Supply Chain Director, Precision Manufacturing",
        rating: 5
      }
    }
  ];

  const industries = ["All", "Technology", "Retail", "Healthcare", "Food & Beverage", "Creative Services", "Manufacturing"];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Success
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Stories</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Discover how businesses across industries have transformed their financial operations 
              and achieved remarkable growth with VeriGrade.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600">500+</div>
              <div className="text-sm text-gray-600">Companies Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">$2M+</div>
              <div className="text-sm text-gray-600">Average Cost Savings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">95%</div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">50%</div>
              <div className="text-sm text-gray-600">Average Time Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Success Stories</h2>
            <p className="text-lg text-gray-600">Real results from real businesses</p>
          </div>

          <div className="space-y-16">
            {caseStudies.filter(study => study.featured).map((study) => (
              <div key={study.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-8 lg:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">{study.industry}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{study.size}</span>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{study.title}</h3>

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                          <p className="text-gray-600">{study.challenge}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                          <p className="text-gray-600">{study.solution}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Results</h4>
                          <ul className="space-y-2">
                            {study.results.map((result, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-600">{result}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(study.testimonial.rating)].map((_, i) => (
                          <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <blockquote className="text-gray-700 mb-4 italic">
                        "{study.testimonial.text}"
                      </blockquote>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="font-semibold text-gray-900">{study.testimonial.author}</div>
                        <div className="text-sm text-gray-600">{study.testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Case Studies */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="font-bold text-gray-900 mb-4">Filter by Industry</h3>
                <div className="space-y-2">
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        industry === "All"
                          ? "bg-green-100 text-green-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Get Started</h4>
                  <div className="space-y-2 text-sm">
                    <a href="/contact" className="block text-green-600 hover:text-green-500">
                      Schedule Demo
                    </a>
                    <a href="/pricing" className="block text-green-600 hover:text-green-500">
                      View Pricing
                    </a>
                    <a href="/register" className="block text-green-600 hover:text-green-500">
                      Start Free Trial
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Studies Grid */}
            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 gap-8">
                {caseStudies.map((study) => (
                  <div
                    key={study.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">{study.industry}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{study.size}</span>
                      </div>
                      {study.featured && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">{study.title}</h3>
                    <p className="text-gray-600 mb-4">{study.challenge}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                        <p className="text-sm text-gray-600">{study.solution}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Key Results</h4>
                        <ul className="space-y-1">
                          {study.results.slice(0, 2).map((result, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(study.testimonial.rating)].map((_, i) => (
                          <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">{study.testimonial.author}</span>
                      </div>
                      <button className="inline-flex items-center text-green-600 hover:text-green-500 font-medium text-sm">
                        Read Full Case Study
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses that have transformed their financial operations with VeriGrade.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/contact"
              className="bg-white text-green-600 border border-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}



