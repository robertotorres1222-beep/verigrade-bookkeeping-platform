'use client';

import { useState } from 'react';
import { 
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  HeartIcon,
  AcademicCapIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function CareersPage() {
  const [openPositions] = useState([
    {
      title: 'Senior Full-Stack Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120,000 - $160,000',
      experience: '5+ years',
      description: 'Join our engineering team to build the next generation of AI-powered bookkeeping solutions.',
      requirements: ['React/Next.js expertise', 'Node.js/Express experience', 'AI/ML integration', 'Database design'],
      posted: '2 days ago'
    },
    {
      title: 'AI/ML Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$140,000 - $180,000',
      experience: '4+ years',
      description: 'Develop cutting-edge AI models for receipt processing and financial analysis.',
      requirements: ['Python/TensorFlow', 'Computer Vision', 'NLP experience', 'Cloud platforms'],
      posted: '1 week ago'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time',
      salary: '$110,000 - $140,000',
      experience: '3+ years',
      description: 'Lead product strategy and roadmap for our bookkeeping platform.',
      requirements: ['SaaS experience', 'User research', 'Analytics tools', 'Cross-functional leadership'],
      posted: '3 days ago'
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time',
      salary: '$70,000 - $90,000',
      experience: '2+ years',
      description: 'Help customers succeed with VeriGrade and drive product adoption.',
      requirements: ['Customer-facing experience', 'CRM systems', 'Analytics', 'Communication skills'],
      posted: '5 days ago'
    },
    {
      title: 'Sales Development Representative',
      department: 'Sales',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$50,000 - $70,000 + Commission',
      experience: '1+ years',
      description: 'Generate qualified leads and drive pipeline growth for our sales team.',
      requirements: ['Sales experience', 'CRM proficiency', 'Cold outreach', 'Goal-oriented'],
      posted: '1 week ago'
    },
    {
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      salary: '$80,000 - $110,000',
      experience: '3+ years',
      description: 'Design intuitive user experiences for our bookkeeping platform.',
      requirements: ['Figma/Sketch', 'User research', 'Prototyping', 'Design systems'],
      posted: '4 days ago'
    }
  ]);

  const [benefits] = useState([
    {
      title: 'Competitive Compensation',
      description: 'Above-market salaries and equity participation',
      icon: CurrencyDollarIcon,
      color: 'text-green-600'
    },
    {
      title: 'Flexible Work',
      description: 'Remote-first culture with flexible hours',
      icon: GlobeAltIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Health & Wellness',
      description: 'Comprehensive health, dental, and vision coverage',
      icon: HeartIcon,
      color: 'text-red-600'
    },
    {
      title: 'Learning & Development',
      description: 'Annual learning budget and conference attendance',
      icon: AcademicCapIcon,
      color: 'text-purple-600'
    },
    {
      title: 'Unlimited PTO',
      description: 'Take time off when you need it',
      icon: ClockIcon,
      color: 'text-yellow-600'
    },
    {
      title: 'Team Events',
      description: 'Regular team building and company retreats',
      icon: UserGroupIcon,
      color: 'text-indigo-600'
    }
  ]);

  const [testimonials] = useState([
    {
      name: 'Sarah Chen',
      role: 'Senior Engineer',
      team: 'Engineering',
      content: 'VeriGrade has given me the opportunity to work on cutting-edge AI technology while maintaining a great work-life balance.',
      avatar: 'SC'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Product Manager',
      team: 'Product',
      content: 'The collaborative culture and focus on customer success makes VeriGrade an amazing place to grow your career.',
      avatar: 'MR'
    },
    {
      name: 'Emily Watson',
      role: 'Customer Success',
      team: 'Customer Success',
      content: 'I love helping customers transform their business operations with our platform. The impact is real and meaningful.',
      avatar: 'EW'
    }
  ]);

  const companyStats = [
    { label: 'Team Members', value: '50+', icon: UserGroupIcon, color: 'text-blue-600' },
    { label: 'Remote-First', value: '100%', icon: GlobeAltIcon, color: 'text-green-600' },
    { label: 'Employee Satisfaction', value: '4.9/5', icon: StarIcon, color: 'text-yellow-600' },
    { label: 'Growth Rate', value: '200%', icon: SparklesIcon, color: 'text-purple-600' }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Join the
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> VeriGrade Team</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Help us revolutionize business bookkeeping with AI-powered solutions. 
              Join a team of passionate innovators building the future of financial management.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#open-positions"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-500 transition-colors"
              >
                View Open Positions
              </a>
              <a
                href="/contact"
                className="bg-transparent text-purple-600 border border-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {companyStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Work at VeriGrade */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Work at VeriGrade?</h2>
            <p className="text-lg text-gray-600">Join a mission-driven team building the future of business finance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6">
                  <benefit.icon className={`h-8 w-8 ${benefit.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-lg text-gray-600">Join our growing team and help shape the future of business bookkeeping</p>
          </div>

          <div className="space-y-8">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{position.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-2" />
                        {position.department}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {position.location}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {position.type}
                      </div>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        {position.salary}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{position.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Posted {position.posted}</span>
                      <span className="mx-2">•</span>
                      <span>{position.experience} experience</span>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-8">
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-500 transition-colors flex items-center gap-2">
                      Apply Now
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Requirements:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {position.requirements.map((requirement, reqIndex) => (
                      <div key={reqIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        {requirement}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Team Says</h2>
            <p className="text-lg text-gray-600">Hear from current team members about their experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mr-4">
                    <span className="text-sm font-semibold text-purple-600">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.team}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Culture & Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-6">
                <SparklesIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">We push boundaries and embrace new technologies to solve real problems.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Collaboration</h3>
              <p className="text-gray-600">We work together, share knowledge, and support each other's growth.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-600">We strive for the highest quality in everything we build and deliver.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-6">
                <HeartIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Focus</h3>
              <p className="text-gray-600">Our customers' success is our success. We build with them in mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-purple-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Team?
          </h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Don't see a position that fits? We're always looking for talented individuals. 
            Send us your resume and tell us how you'd like to contribute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Send Resume
            </a>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
