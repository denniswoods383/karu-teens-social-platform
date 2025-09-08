import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  variant = "rectangular",
  width,
  height 
}) => {
  const baseClasses = "bg-gray-200 animate-pulse";
  
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg"
  };

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '200px')
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-gray-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </div>
      
      <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-4/5 mb-4 animate-pulse" />
      
      <div className="h-48 bg-gray-200 rounded-lg mb-4 animate-pulse" />
      
      <div className="flex items-center space-x-4">
        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-14 animate-pulse" />
      </div>
    </div>
  );
};

export const FeedSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="h-32 bg-gray-200 rounded-lg mb-4 animate-pulse" />
      <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
    </div>
  );
};