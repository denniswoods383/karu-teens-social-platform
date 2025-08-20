import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'textbook' | 'tutoring' | 'notes' | 'equipment' | 'tickets';
  condition?: 'new' | 'like-new' | 'good' | 'fair';
  seller: {
    name: string;
    rating: number;
    isVerified: boolean;
  };
  images: string[];
  location: string;
  postedDate: string;
  tags: string[];
  isFeatured?: boolean;
}

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const { addPoints } = useGamificationStore();
  const { isPremium, setUpgradeModal } = usePremiumStore();

  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  const loadMarketplaceItems = () => {
    // Sample marketplace items
    const sampleItems: MarketplaceItem[] = [
      {
        id: '1',
        title: 'Calculus: Early Transcendentals (9th Edition)',
        description: 'Excellent condition textbook for Calc I & II. Barely used, no highlighting or writing inside. Original price $350.',
        price: 180,
        category: 'textbook',
        condition: 'like-new',
        seller: { name: 'Sarah Kim', rating: 4.9, isVerified: true },
        images: ['/api/placeholder/400/300'],
        location: 'Engineering Building',
        postedDate: '2025-01-20',
        tags: ['mathematics', 'calculus', 'stewart'],
        isFeatured: true
      },
      {
        id: '2',
        title: 'Chemistry Tutoring - Organic & Inorganic',
        description: 'PhD Chemistry student offering personalized tutoring. 3+ years experience, 95% student success rate. Flexible scheduling.',
        price: 45,
        category: 'tutoring',
        seller: { name: 'Dr. Maria Rodriguez', rating: 5.0, isVerified: true },
        images: ['/api/placeholder/400/300'],
        location: 'Chemistry Lab Building',
        postedDate: '2025-01-19',
        tags: ['chemistry', 'tutoring', 'organic', 'phd']
      },
      {
        id: '3',
        title: 'Computer Science Study Notes Bundle',
        description: 'Complete notes for CS 101-301. Algorithms, Data Structures, OOP. Helped me get A+ in all courses. Digital PDF format.',
        price: 25,
        category: 'notes',
        seller: { name: 'Alex Chen', rating: 4.7, isVerified: false },
        images: ['/api/placeholder/400/300'],
        location: 'Online Delivery',
        postedDate: '2025-01-18',
        tags: ['computer-science', 'algorithms', 'notes', 'programming']
      },
      {
        id: '4',
        title: 'Scientific Calculator (TI-84 Plus CE)',
        description: 'Barely used graphing calculator. Perfect for math, engineering, and science courses. Includes all original accessories.',
        price: 85,
        category: 'equipment',
        condition: 'like-new',
        seller: { name: 'David Liu', rating: 4.8, isVerified: true },
        images: ['/api/placeholder/400/300'],
        location: 'Math Department',
        postedDate: '2025-01-17',
        tags: ['calculator', 'ti-84', 'mathematics', 'engineering']
      },
      {
        id: '5',
        title: 'Spring Formal Dance Tickets (2 available)',
        description: 'Unable to attend due to exam schedule. Selling at face value. Great seats, includes dinner and entertainment.',
        price: 75,
        category: 'tickets',
        seller: { name: 'Jessica Park', rating: 4.6, isVerified: true },
        images: ['/api/placeholder/400/300'],
        location: 'Student Union',
        postedDate: '2025-01-16',
        tags: ['formal', 'dance', 'spring', 'event']
      }
    ];
    
    setItems(sampleItems);
  };

  const categories = [
    { id: 'all', name: 'All Items', icon: '🛍️' },
    { id: 'textbook', name: 'Textbooks', icon: '📚' },
    { id: 'tutoring', name: 'Tutoring', icon: '👨‍🏫' },
    { id: 'notes', name: 'Study Notes', icon: '📝' },
    { id: 'equipment', name: 'Equipment', icon: '⚙️' },
    { id: 'tickets', name: 'Event Tickets', icon: '🎫' }
  ];

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.seller.rating - a.seller.rating;
      default: return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }
  });

  const handleCreateListing = () => {
    if (!isPremium) {
      setUpgradeModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  const handleContactSeller = (item: MarketplaceItem) => {
    addPoints(2, 'contacting seller');
    alert(`💬 Opening chat with ${item.seller.name}... +2 XP for networking!`);
  };

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'like-new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'good': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'fair': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'textbook': return 'bg-blue-500';
      case 'tutoring': return 'bg-purple-500';
      case 'notes': return 'bg-green-500';
      case 'equipment': return 'bg-orange-500';
      case 'tickets': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
        <EnhancedNavbar />
        
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-24">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  🛍️ Campus Marketplace
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Buy, sell, and trade with your fellow students
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>💰 Safe transactions</span>
                  <span>🎓 Student-verified sellers</span>
                  <span>📍 On-campus pickup</span>
                </div>
              </div>
              
              <button
                onClick={handleCreateListing}
                className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
              >
                <span>💼</span>
                <span>Sell Item</span>
                {!isPremium && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">PRO</span>}
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Items
                </label>
                <input
                  type="text"
                  placeholder="Search textbooks, tutoring, notes, equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Seller Rating</option>
                </select>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map((item) => (
              <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${item.isFeatured ? 'ring-2 ring-yellow-400' : ''}`}>
                {/* Featured Badge */}
                {item.isFeatured && (
                  <div className="absolute top-4 left-4 z-10 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ Featured
                  </div>
                )}

                {/* Image */}
                <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {categories.find(c => c.id === item.category)?.icon || '📦'}
                  </div>
                  
                  {/* Category Badge */}
                  <div className={`absolute top-4 right-4 w-8 h-8 ${getCategoryColor(item.category)} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                    {item.category.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="text-right ml-2">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${item.price}
                      </div>
                      {item.condition && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConditionColor(item.condition)}`}>
                          {item.condition}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {item.seller.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.seller.name}
                          </span>
                          {item.seller.isVerified && <span className="text-blue-500">✓</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {item.seller.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">📍 {item.location}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.postedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleContactSeller(item)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
                    >
                      💬 Contact
                    </button>
                    
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      🔖 Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No items found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search or create a new listing
              </p>
              <button
                onClick={handleCreateListing}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                Create Your First Listing
              </button>
            </div>
          )}

          {/* Revenue Banner */}
          <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">💰 Earn Money from Your Items</h3>
                <p className="text-green-100">Safe, secure transactions with fellow students. We take care of payment processing.</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-3xl font-bold">0% fees</div>
                <div className="text-sm text-green-200">for verified students</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}