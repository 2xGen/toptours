import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomeCTA = ({ onOpenModal }) => {
  return (
    <section className="py-20 cta-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join thousands of travelers who trust TopTours.ai to plan their perfect trips. 
            Start your journey today!
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={onOpenModal}
              className="px-8 py-4 bg-white text-orange-600 font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-200"
            >
              Start Planning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeCTA;