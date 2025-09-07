import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  gradient?: string;
  onClick?: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
};

export const BentoCard: React.FC<BentoCardProps> = ({ 
  title, 
  description, 
  icon, 
  className = "", 
  gradient = "from-purple-600 to-pink-600",
  onClick 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6 cursor-pointer
        bg-gradient-to-br ${gradient} 
        backdrop-blur-lg border border-white/20
        hover:border-white/40 transition-all duration-300
        ${className}
      `}
    >
      <div className="relative z-10">
        <div className="text-4xl mb-4 text-white/90">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          {title}
        </h3>
        <p className="text-white/80 text-sm leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
      </div>
    </motion.div>
  );
};