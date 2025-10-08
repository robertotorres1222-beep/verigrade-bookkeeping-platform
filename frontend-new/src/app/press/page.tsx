'use client';

import { useState } from 'react';
import { 
  NewspaperIcon,
  CalendarIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  TrophyIcon,
  StarIcon,
  ArrowRightIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';

export default function PressPage() {
  const [pressReleases] = useState([
    {
      title: 'VeriGrade Raises $10M Series A to Revolutionize AI-Powered Bookkeeping',
      date: '2024-01-15',
      summary: 'Company announces major funding round to accelerate AI development and market expansion.',
      link: '#',
      category: 'Funding'
    },
    {
      title: 'VeriGrade Launches Mobile App with Advanced Receipt Capture Technology',
      date: '2024-01-10',
      summary: 'New mobile application brings AI-powered bookkeeping to smartphones with 99% accuracy.',
      link: '#',
      category: 'Product Launch'
    },
    {
      title: 'VeriGrade Partners with Major Accounting Firms for Enterprise Integration',
      date: '2024-01-05',
      summary: 'Strategic partnerships enable seamless integration with existing accounting workflows.',
      link: '#',
      category: 'Partnership'
    }
  ]);

  const [mediaCoverage] = useState([
    {
      outlet: 'TechCrunch',
      title: 'AI Bookkeeping Startup VeriGrade Raises $10M',
      date: '2024-01-16',
      link: '#',
      logo: 'TC'
    },
    {
      outlet: 'Forbes',
      title: 'How AI is Transforming Small Business Bookkeeping',
      date: '2024-01-12',
      link: '#',
      logo: 'F'
    },
    {
      outlet: 'Entrepreneur',
      title: 'VeriGrade: The Future of Automated Accounting',
      date: '2024-01-08',
      link: '#',
      logo: 'E'
    }
  ]);

  const [awards] = useState([
    {
      name: 'Best Fintech Startup 2024',
      organization: 'Fintech Innovation Awards',
      date: '2024-01-20',
      icon: TrophyIcon
    },
    {
      name: 'Top AI Solution',
      organization: 'TechCrunch Startup Awards',
      date: '2024-01-18',
      icon: StarIcon
    },
    {
      name: 'Innovation in Accounting',
      organization: 'Accounting Today',
      date: '2024-01-15',
      icon: MegaphoneIcon
    }
  ]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Press & 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> News</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest news, press releases, and media coverage about VeriGrade. 
              Discover our journey in revolutionizing AI-powered bookkeeping.
            </p>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Press Releases</h2>
            <p className="text-lg text-gray-600">Official announcements and company updates</p>
          </div>

          <div className="space-y-8">
            {pressReleases.map((release, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                        {release.category}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {release.date}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{release.title}</h3>
                    <p className="text-gray-600 mb-4">{release.summary}</p>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-8">
                    <a
                      href={release.link}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center gap-2"
                    >
                      Read More
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Media Coverage</h2>
            <p className="text-lg text-gray-600">What the media is saying about VeriGrade</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mediaCoverage.map((article, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mr-4">
                    <span className="text-lg font-bold text-gray-700">{article.logo}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{article.outlet}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {article.date}
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{article.title}</h3>
                <a
                  href={article.link}
                  className="text-blue-600 hover:text-blue-500 font-medium flex items-center gap-1"
                >
                  Read Article
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
              </div>
            ))}
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
            {awards.map((award, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mx-auto mb-6">
                  <award.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{award.name}</h3>
                <p className="text-gray-600 mb-2">{award.organization}</p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {award.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Media Kit & Resources
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Download our media kit, logos, and press materials for journalists and media professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              Download Media Kit
            </button>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Press Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
