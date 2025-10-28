'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';

interface VideoDemoProps {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export default function VideoDemo({ 
  title = "See VeriGrade in Action",
  description = "Watch how our AI-powered bookkeeping platform transforms your financial management workflow.",
  videoUrl,
  thumbnailUrl
}: VideoDemoProps) {
  const [showVideo, setShowVideo] = useState(false);

  const defaultThumbnail = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  const handlePlayClick = () => {
    setShowVideo(true);
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
  };

  return (
    <>
      {/* Video Thumbnail */}
      <motion.div
        className="relative cursor-pointer group"
        onClick={handlePlayClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={thumbnailUrl || defaultThumbnail}
            alt="VeriGrade Demo Video"
            className="w-full h-64 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-opacity duration-300"></div>
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-opacity-100 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayIcon className="h-8 w-8 text-blue-600 ml-1" />
            </motion.div>
          </div>
          
          {/* Video Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
            <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-200 text-sm">{description}</p>
          </div>
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={handleCloseVideo}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseVideo}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
              
              {/* Video Container */}
              <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                {videoUrl ? (
                  <iframe
                    src={videoUrl}
                    title="VeriGrade Demo Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PlayIcon className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">Demo Video Coming Soon!</h3>
                      <p className="text-gray-300 text-lg mb-6">
                        We're working on an amazing demo video to show you VeriGrade in action.
                      </p>
                      <div className="space-y-4">
                        <div className="bg-gray-800 rounded-lg p-4 text-left">
                          <h4 className="text-white font-semibold mb-2">What you'll see:</h4>
                          <ul className="text-gray-300 space-y-1">
                            <li>• AI-powered receipt processing</li>
                            <li>• Automatic transaction categorization</li>
                            <li>• Real-time financial insights</li>
                            <li>• Professional invoice generation</li>
                            <li>• Advanced reporting and analytics</li>
                          </ul>
                        </div>
                        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
                          <p className="text-blue-200">
                            <strong>In the meantime:</strong> Start your free trial to experience VeriGrade yourself!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Interactive Demo Component
export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "Upload Receipt",
      description: "Simply take a photo or upload a receipt",
      icon: "📷",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "AI Processing",
      description: "Our AI extracts and categorizes the data",
      icon: "🤖",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Smart Categorization",
      description: "Transactions are automatically categorized",
      icon: "🏷️",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Real-time Insights",
      description: "Get instant financial insights and reports",
      icon: "📊",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Demo</h3>
        <p className="text-gray-600">Click through to see how VeriGrade works</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Demo Steps */}
        <div className="space-y-4">
          {demoSteps.map((step, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                currentStep === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center mr-4 text-2xl`}>
                  {step.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Demo Visual */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`w-24 h-24 bg-gradient-to-r ${demoSteps[currentStep].color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl`}
          >
            {demoSteps[currentStep].icon}
          </motion.div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">{demoSteps[currentStep].title}</h4>
          <p className="text-gray-600">{demoSteps[currentStep].description}</p>
        </div>
      </div>
    </div>
  );
}

