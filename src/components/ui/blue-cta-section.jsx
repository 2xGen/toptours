import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlueCTASection = ({ onOpenModal, title, description, buttonText, gradientClass = "adventure-gradient", destination = "" }) => {
  return (
    <section className={`py-20 ${gradientClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
            {title || (destination ? `Ready to Explore ${destination}?` : "Ready to Experience Smart Travel?")}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            {description || (destination ? 
              `Discover the best tours and activities in ${destination} with AI-powered recommendations tailored just for you.` : 
              "Join thousands of travelers who have discovered their perfect adventures with TopTours.ai."
            )}
          </p>
          <Button 
            onClick={() => onOpenModal()}
            className="px-8 py-4 bg-white text-blue-600 font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-200"
          >
            {buttonText || (destination ? `Start Planning Your ${destination} Trip` : "Start Planning Your Trip")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default BlueCTASection; 