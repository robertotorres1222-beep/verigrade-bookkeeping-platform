'use client';

import { 
  UserGroupIcon,
  TrophyIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former CFO at two Fortune 500 companies with 15+ years in financial technology.",
      image: "/api/placeholder/300/300",
      linkedin: "#"
    },
    {
      name: "Michael Rodriguez",
      role: "CTO & Co-Founder",
      bio: "AI and machine learning expert who previously led engineering teams at Google and Microsoft.",
      image: "/api/placeholder/300/300",
      linkedin: "#"
    },
    {
      name: "Emily Johnson",
      role: "Head of Product",
      bio: "Product strategist with deep experience in fintech and user experience design.",
      image: "/api/placeholder/300/300",
      linkedin: "#"
    },
    {
      name: "David Kim",
      role: "Head of Engineering",
      bio: "Full-stack engineer specializing in scalable financial systems and data architecture.",
      image: "/api/placeholder/300/300",
      linkedin: "#"
    }
  ];

  const values = [
    {
      title: "Innovation",
      description: "We constantly push the boundaries of what's possible in financial technology.",
      icon: LightBulbIcon,
      color: "text-yellow-600"
    },
    {
      title: "Trust",
      description: "Security and reliability are at the core of everything we build.",
      icon: ShieldCheckIcon,
      color: "text-blue-600"
    },
    {
      title: "Simplicity",
      description: "Complex financial processes made simple and intuitive for everyone.",
      icon: HeartIcon,
      color: "text-red-600"
    },
    {
      title: "Growth",
      description: "We're committed to helping our customers and team grow together.",
      icon: RocketLaunchIcon,
      color: "text-green-600"
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "VeriGrade was founded with a vision to revolutionize business bookkeeping through AI."
    },
    {
      year: "2021",
      title: "First Product Launch",
      description: "Launched our AI-powered receipt processing and basic bookkeeping features."
    },
    {
      year: "2022",
      title: "Series A Funding",
      description: "Raised $15M to accelerate product development and market expansion."
    },
    {
      year: "2023",
      title: "10,000+ Customers",
      description: "Reached a major milestone of serving over 10,000 businesses worldwide."
    },
    {
      year: "2024",
      title: "Enterprise Launch",
      description: "Launched enterprise features and partnerships with major accounting firms."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Businesses Served" },
    { number: "$2B+", label: "Transactions Processed" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "95%", label: "Customer Satisfaction" }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              About
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600"> VeriGrade</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              We're on a mission to democratize professional bookkeeping by making it accessible, 
              accurate, and affordable for businesses of all sizes through the power of AI.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To eliminate the complexity and cost barriers that prevent small and medium businesses 
                from accessing professional-grade bookkeeping services. We believe every business 
                deserves accurate, real-time financial insights to make informed decisions.
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-lg text-gray-600">
                A world where AI-powered financial management is so intuitive and accurate that 
                business owners can focus on what they do best - growing their business - while 
                having complete confidence in their financial data.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className={`flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4`}>
                  <value.icon className={`h-6 w-6 ${value.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">The experts behind VeriGrade's success</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserGroupIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                <a
                  href={member.linkedin}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  LinkedIn →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600">Key milestones in VeriGrade's growth</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-indigo-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="text-sm font-bold text-indigo-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full z-10">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Awards & Recognition</h2>
            <p className="text-lg text-gray-600">Industry recognition for our innovation and impact</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <TrophyIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Best Fintech Startup 2023</h3>
              <p className="text-gray-600">TechCrunch Disrupt</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <StarIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Innovation Award</h3>
              <p className="text-gray-600">Forbes Technology Council</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <HeartIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Choice Award</h3>
              <p className="text-gray-600">Small Business Association</p>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Offices</h2>
            <p className="text-lg text-gray-600">Where we're building the future of bookkeeping</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <MapPinIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">San Francisco, CA</h3>
              </div>
              <p className="text-gray-600 mb-4">123 Innovation Drive<br />San Francisco, CA 94105</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4" />
                <span>Mon-Fri 9AM-6PM PST</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <MapPinIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">New York, NY</h3>
              </div>
              <p className="text-gray-600 mb-4">456 Business Avenue<br />New York, NY 10001</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4" />
                <span>Mon-Fri 9AM-6PM EST</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Mission?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Whether you're a customer or a potential team member, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
