'use client';

import { 
  DocumentTextIcon,
  CalculatorIcon,
  UserGroupIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function ServicesPage() {
  const services = [
    {
      name: 'Professional Bookkeeping',
      description: 'Complete bookkeeping services handled by certified accountants with years of experience.',
      icon: DocumentTextIcon,
      price: 'Starting at $299/month',
      features: [
        'Monthly financial statements',
        'Accounts payable & receivable',
        'Bank reconciliation',
        'Expense categorization',
        'Tax-ready reports',
        'Dedicated bookkeeper'
      ],
      benefits: ['Save 20+ hours/month', 'Expert accuracy', 'Tax preparation ready', 'Monthly consultations'],
      popular: true
    },
    {
      name: 'Tax Preparation & Filing',
      description: 'Complete tax preparation and filing services for businesses of all sizes.',
      icon: CalculatorIcon,
      price: 'Starting at $499/year',
      features: [
        'Business tax returns',
        'Quarterly tax estimates',
        'Tax planning strategies',
        'Audit support',
        'Multi-state filing',
        'Extension preparation'
      ],
      benefits: ['Maximize deductions', 'Avoid penalties', 'Expert guidance', 'Audit protection'],
      popular: false
    },
    {
      name: 'Financial Consulting',
      description: 'Strategic financial consulting to help grow your business and optimize operations.',
      icon: UserGroupIcon,
      price: 'Starting at $150/hour',
      features: [
        'Financial analysis',
        'Business planning',
        'Cash flow optimization',
        'Investment advice',
        'Growth strategies',
        'Risk assessment'
      ],
      benefits: ['Strategic insights', 'Growth planning', 'Risk mitigation', 'Expert advice'],
      popular: false
    },
    {
      name: 'Payroll Management',
      description: 'Automated payroll processing and employee management for growing teams.',
      icon: CreditCardIcon,
      price: 'Starting at $99/month',
      features: [
        'Automated payroll processing',
        'Tax calculations',
        'Direct deposit setup',
        'Employee self-service',
        'Compliance reporting',
        'Benefits administration'
      ],
      benefits: ['Error-free payroll', 'Tax compliance', 'Employee satisfaction', 'Time savings'],
      popular: false
    }
  ];

  const process = [
    {
      step: 1,
      title: 'Initial Consultation',
      description: 'We discuss your business needs and current financial situation.',
      icon: ChatBubbleLeftRightIcon,
      duration: '30 minutes'
    },
    {
      step: 2,
      title: 'Custom Proposal',
      description: 'We create a tailored service plan that fits your business perfectly.',
      icon: DocumentTextIcon,
      duration: '24 hours'
    },
    {
      step: 3,
      title: 'Service Setup',
      description: 'We integrate with your systems and begin providing services.',
      icon: CheckCircleIcon,
      duration: '1-3 days'
    },
    {
      step: 4,
      title: 'Ongoing Support',
      description: 'Continuous monitoring and monthly check-ins to ensure everything runs smoothly.',
      icon: ClockIcon,
      duration: 'Ongoing'
    }
  ];

  const testimonials = [
    {
      content: 'VeriGrade\'s bookkeeping service saved us so much time. Our books are always accurate and up-to-date.',
      author: 'Jennifer Martinez',
      role: 'Owner, Martinez Consulting',
      service: 'Professional Bookkeeping',
      rating: 5
    },
    {
      content: 'The tax preparation service was excellent. They found deductions we never knew existed.',
      author: 'David Kim',
      role: 'CEO, TechFlow Solutions',
      service: 'Tax Preparation',
      rating: 5
    },
    {
      content: 'The financial consulting helped us scale from $100K to $500K revenue in one year.',
      author: 'Lisa Thompson',
      role: 'Founder, Thompson Enterprises',
      service: 'Financial Consulting',
      rating: 5
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Professional Services
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Beyond Software
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Complete Solutions</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Get expert financial services from certified professionals. From bookkeeping to tax preparation, 
              we provide complete financial solutions for your business.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/contact"
                className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </a>
              <a
                href="#services"
                className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                View Services
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Professional Services
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive range of financial services designed to meet your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {services.map((service) => (
              <div key={service.name} className={`bg-white rounded-2xl border-2 p-8 relative ${service.popular ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'} transition-all duration-200`}>
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <p className="text-2xl font-bold text-blue-600 mb-6">{service.price}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">What's Included:</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature) => (
                            <li key={feature} className="flex items-center text-sm text-gray-600">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                        <ul className="space-y-1">
                          {service.benefits.map((benefit) => (
                            <li key={benefit} className="flex items-center text-sm text-gray-600">
                              <ArrowRightIcon className="h-3 w-3 text-blue-500 flex-shrink-0 mr-2" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <a
                        href="/contact"
                        className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-center block transition-all duration-200 ${
                          service.popular
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg hover:shadow-xl'
                            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md'
                        }`}
                      >
                        Get Started
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How We Work With You
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our streamlined process ensures you get the best service from day one
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {process.map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="relative">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-300 transform translate-x-8"></div>
                  )}
                </div>
                <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-4">
                  Step {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 mb-3">{step.description}</p>
                <p className="text-sm text-blue-600 font-medium">{step.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See how our services have helped businesses thrive
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-900 mb-6">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{testimonial.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Contact our team to discuss your business needs and get a custom quote. 
                We're here to help you succeed.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-blue-200 mr-3" />
                  <span className="text-white">1-800-VERIGRADE</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-blue-200 mr-3" />
                  <span className="text-white">services@verigrade.com</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-200 mr-3" />
                  <span className="text-white">Mon-Fri 9AM-6PM EST</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Get Your Free Consultation</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <select className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/50">
                    <option value="">Select Service</option>
                    <option value="bookkeeping">Professional Bookkeeping</option>
                    <option value="tax">Tax Preparation</option>
                    <option value="consulting">Financial Consulting</option>
                    <option value="payroll">Payroll Management</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Schedule Consultation
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



