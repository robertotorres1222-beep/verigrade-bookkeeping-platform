'use client';

import { 
  LightBulbIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  HeartIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  TrophyIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function CompanyPage() {
  const values = [
    {
      name: 'Innovation',
      description: 'We constantly push the boundaries of what\'s possible with AI and financial technology.',
      icon: LightBulbIcon,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'Trust',
      description: 'We build lasting relationships based on transparency, security, and reliability.',
      icon: ShieldCheckIcon,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Excellence',
      description: 'We strive for perfection in everything we do, from our software to our customer service.',
      icon: TrophyIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Empathy',
      description: 'We understand the challenges businesses face and design solutions that truly help.',
      icon: HeartIcon,
      color: 'from-red-500 to-pink-500'
    }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former VP of Engineering at Stripe, 15+ years in fintech.',
      image: 'SC',
      expertise: ['Fintech', 'AI', 'Leadership']
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Ex-Google AI researcher, PhD in Machine Learning.',
      image: 'MR',
      expertise: ['AI/ML', 'Computer Vision', 'Architecture']
    },
    {
      name: 'Emily Johnson',
      role: 'Head of Product',
      bio: 'Former Product Manager at QuickBooks, UX design expert.',
      image: 'EJ',
      expertise: ['Product', 'UX', 'Strategy']
    },
    {
      name: 'David Kim',
      role: 'Head of Engineering',
      bio: 'Former Senior Engineer at PayPal, full-stack expert.',
      image: 'DK',
      expertise: ['Backend', 'Frontend', 'DevOps']
    },
    {
      name: 'Lisa Wang',
      role: 'Head of Customer Success',
      bio: 'Former Customer Success Director at Zendesk.',
      image: 'LW',
      expertise: ['Support', 'Training', 'Relationships']
    },
    {
      name: 'James Thompson',
      role: 'Head of Sales',
      bio: 'Former Enterprise Sales Director at Salesforce.',
      image: 'JT',
      expertise: ['Sales', 'Enterprise', 'Growth']
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to democratize access to professional bookkeeping tools.'
    },
    {
      year: '2021',
      title: 'First AI Model',
      description: 'Launched our first AI-powered receipt processing system with 95% accuracy.'
    },
    {
      year: '2022',
      title: 'Series A Funding',
      description: 'Raised $10M to accelerate product development and team growth.'
    },
    {
      year: '2023',
      title: '10,000 Customers',
      description: 'Reached our first major milestone of serving 10,000 businesses worldwide.'
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Launched in 15 countries with multi-currency support and local compliance.'
    }
  ];

  const awards = [
    {
      name: 'Best Fintech Startup 2024',
      organization: 'TechCrunch Disrupt',
      year: '2024'
    },
    {
      name: 'AI Innovation Award',
      organization: 'AI & Machine Learning Summit',
      year: '2023'
    },
    {
      name: 'Customer Choice Award',
      organization: 'G2 Crowd',
      year: '2023'
    },
    {
      name: 'Top 50 Startups',
      organization: 'Forbes',
      year: '2023'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800 mb-6">
              <HeartIcon className="h-4 w-4 mr-2" />
              Our Story
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Building the Future of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Financial Management</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              We're on a mission to transform how businesses manage their finances through innovative AI technology 
              and exceptional human expertise.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/careers"
                className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-500 hover:to-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                Join Our Team
              </a>
              <a
                href="#mission"
                className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-2 hover:text-purple-600 transition-colors"
              >
                Learn More
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Mission
              </h2>
              <p className="mt-6 text-lg text-gray-600">
                To democratize access to professional-grade bookkeeping tools for businesses of all sizes. 
                We believe that every business, regardless of size or budget, deserves access to accurate, 
                real-time financial insights that help them make better decisions and grow.
              </p>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To become the world's most trusted AI-powered financial management platform, 
                  empowering millions of businesses to achieve their financial goals with confidence.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">50K+</div>
                  <div className="text-sm text-gray-600">Businesses Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">99.2%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">15</div>
                  <div className="text-sm text-gray-600">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Core Values
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              These values guide everything we do, from product development to customer service
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`mx-auto h-12 w-12 bg-gradient-to-br ${value.color} rounded-lg flex items-center justify-center mb-4`}>
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.name}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              The brilliant minds behind VeriGrade, bringing together expertise from leading tech companies
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-lg">{member.image}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {member.expertise.map((skill) => (
                    <span key={skill} className="bg-white px-3 py-1 rounded-full text-xs text-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Journey
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From a startup idea to a global platform transforming business finances
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-300"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="h-4 w-4 bg-purple-600 rounded-full border-4 border-white shadow-sm"></div>
                  </div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Recognition & Awards
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Industry recognition for our innovation and impact
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {awards.map((award) => (
              <div key={award.name} className="bg-gray-50 rounded-xl p-6 text-center">
                <TrophyIcon className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{award.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{award.organization}</p>
                <p className="text-xs text-gray-500">{award.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Get in Touch
              </h2>
              <p className="mt-4 text-lg text-purple-100">
                Have questions about VeriGrade or want to learn more about our story? 
                We'd love to hear from you.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-purple-200 mr-3" />
                  <span className="text-white">San Francisco, CA</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-purple-200 mr-3" />
                  <span className="text-white">1-800-VERIGRADE</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-purple-200 mr-3" />
                  <span className="text-white">hello@verigrade.com</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Send us a message</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



