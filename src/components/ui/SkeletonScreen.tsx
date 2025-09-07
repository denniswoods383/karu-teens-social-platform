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
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse";
  
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
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="30%" className="mb-2" />
          <Skeleton variant="text" width="20%" />
        </div>
      </div>
      
      <Skeleton variant="text" className="mb-2" />
      <Skeleton variant="text" width="80%" className="mb-4" />
      
      <Skeleton variant="rectangular" height={200} className="mb-4" />
      
      <div className="flex items-center space-x-4">
        <Skeleton variant="text" width="60px" />
        <Skeleton variant="text" width="80px" />
        <Skeleton variant="text" width="70px" />
      </div>
    </div>
  );
};

export const FeedSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
};