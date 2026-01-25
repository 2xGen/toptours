import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { travelTips } from '@/data/homeData';

const TravelTips = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-6">
            Travel Insights & Tips
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert advice and insider tips to make your travels unforgettable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {travelTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-white border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1595872018818-97555653a011"
                    alt={tip.image}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {tip.readTime}
                    </Badge>
                    <Camera className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-poppins font-semibold text-gray-800 mb-3">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {tip.excerpt}
                  </p>
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto text-blue-600 hover:text-blue-800"
                    onClick={() => toast({
                      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
                    })}
                  >
                    Read More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelTips;