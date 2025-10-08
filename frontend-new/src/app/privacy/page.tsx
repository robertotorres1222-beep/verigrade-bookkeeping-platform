'use client';

import { 
  ShieldCheckIcon,
  DocumentTextIcon,
  EyeIcon,
  LockClosedIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: DocumentTextIcon,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, phone number, business information, and payment details."
        },
        {
          subtitle: "Financial Information",
          text: "We collect financial data necessary to provide our bookkeeping services, including bank account information, transaction data, receipts, invoices, and other financial documents you upload or connect to our platform."
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect information about how you use our services, including your interactions with our platform, the features you use, and the time and duration of your activities."
        },
        {
          subtitle: "Device Information",
          text: "We collect information about the devices you use to access our services, including device type, operating system, browser type, IP address, and unique device identifiers."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: EyeIcon,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our bookkeeping services, including processing transactions, generating reports, and providing customer support."
        },
        {
          subtitle: "Communication",
          text: "We use your contact information to communicate with you about your account, our services, important updates, and to respond to your inquiries and support requests."
        },
        {
          subtitle: "Security and Fraud Prevention",
          text: "We use your information to protect against fraud, unauthorized access, and other security threats, and to ensure the integrity of our platform."
        },
        {
          subtitle: "Legal Compliance",
          text: "We use your information to comply with applicable laws, regulations, and legal processes, and to protect our rights and interests."
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: UserGroupIcon,
      content: [
        {
          subtitle: "Service Providers",
          text: "We share your information with trusted third-party service providers who help us operate our platform, such as cloud hosting providers, payment processors, and analytics services."
        },
        {
          subtitle: "Business Partners",
          text: "We may share your information with business partners who provide complementary services, but only with your explicit consent."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law, court order, or government request, or if we believe such disclosure is necessary to protect our rights or the safety of our users."
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction, but we will ensure appropriate protections are in place."
        }
      ]
    },
    {
      title: "Data Security",
      icon: LockClosedIcon,
      content: [
        {
          subtitle: "Encryption",
          text: "We use industry-standard encryption (AES-256) to protect your data both in transit and at rest. All data transmission is secured using SSL/TLS protocols."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and authentication measures to ensure that only authorized personnel can access your information, and only for legitimate business purposes."
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security audits and assessments to identify and address potential vulnerabilities in our systems and processes."
        },
        {
          subtitle: "Incident Response",
          text: "We have established procedures for responding to security incidents and will notify affected users promptly if any unauthorized access to their information occurs."
        }
      ]
    },
    {
      title: "Your Rights",
      icon: ShieldCheckIcon,
      content: [
        {
          subtitle: "Access and Portability",
          text: "You have the right to access your personal information and to receive a copy of your data in a portable format. You can request this information through your account settings or by contacting us."
        },
        {
          subtitle: "Correction and Updates",
          text: "You have the right to correct or update your personal information at any time. You can do this through your account settings or by contacting our support team."
        },
        {
          subtitle: "Deletion",
          text: "You have the right to request deletion of your personal information, subject to certain legal and operational requirements. We will honor such requests when legally permissible."
        },
        {
          subtitle: "Opt-out",
          text: "You can opt out of certain communications and data processing activities, such as marketing emails, while still maintaining access to essential service communications."
        }
      ]
    },
    {
      title: "International Transfers",
      icon: GlobeAltIcon,
      content: [
        {
          subtitle: "Global Operations",
          text: "We operate globally and may transfer your information to countries other than your own. We ensure that such transfers comply with applicable data protection laws."
        },
        {
          subtitle: "Adequacy Decisions",
          text: "When transferring data to countries without adequate data protection laws, we implement appropriate safeguards such as standard contractual clauses or binding corporate rules."
        },
        {
          subtitle: "Data Residency",
          text: "We offer data residency options for customers who require their data to remain in specific geographic regions for compliance or operational reasons."
        }
      ]
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Privacy
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600"> Policy</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>Last updated: January 15, 2024</span>
              <span>•</span>
              <span>Effective date: January 15, 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              At VeriGrade, we are committed to protecting your privacy and ensuring the security of your personal and financial information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered bookkeeping platform.
            </p>
            <p className="text-lg text-gray-600">
              By using our services, you agree to the collection and use of information in accordance with this policy. If you have any questions about this Privacy Policy, please contact us at privacy@verigrade.com.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
                    <section.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.subtitle}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Children's Privacy</h3>
                <p className="text-gray-600">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Changes to This Policy</h3>
                <p className="text-gray-600">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <p className="text-gray-600">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-600">Email: privacy@verigrade.com</p>
                  <p className="text-gray-600">Phone: 1-800-VERIGRADE</p>
                  <p className="text-gray-600">Address: 123 Innovation Drive, San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Questions About Your Privacy?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Our privacy team is here to help answer any questions you may have about how we protect your information.
          </p>
          <a
            href="/contact"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Contact Our Privacy Team
          </a>
        </div>
      </section>
    </div>
  );
}
