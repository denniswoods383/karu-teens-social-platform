import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { useRouter } from 'next/router';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useInView } from 'react-intersection-observer';
import { marketplaceItemSchema, validateData } from '../../lib/validation';
import Image from 'next/image';
import { useMarketplace } from '../../hooks/useCachedData';
import { memoryCache, CACHE_KEYS } from '../../lib/cache';


interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'textbooks' | 'electronics' | 'furniture' | 'clothing' | 'other';
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  seller_id: string;
  seller?: {
    name: string;
    username: string;
    avatar_url?: string;
  };
  images: string[];
  location?: string;
  created_at: string;
  is_available: boolean;
  views_count: number;
  is_saved?: boolean;
}

function MarketplaceContent() {
  const { data: items = [], mutate, isLoading } = useMarketplace();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  const intervalRefs = useRef<{[key: string]: NodeJS.Timeout}>({});
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { ref, inView } = useInView({ threshold: 0 });
  
  const ITEMS_PER_PAGE = 12;
  const { addPoints } = useGamificationStore();
  const { isPremium, setUpgradeModal } = usePremiumStore();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      mutate();
    }
  }, [isLoading, items, mutate]);
  
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setLoading(true);
      const nextPage = page + 1;
      setPage(nextPage);
      loadMarketplaceItems(nextPage, true);
    }
  }, [inView, hasMore, loading, page]);

  const loadMarketplaceItems = async (pageNum = 0, append = false) => {
    try {
      const { data: itemsData, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);
      
      if (error) throw error;
      
      if (itemsData && itemsData.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      
      // Get seller profiles
      const sellerIds = Array.from(new Set(itemsData?.map(item => item.seller_id) || []));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', sellerIds);
      
      // Get saved items for current user
      const { data: savedItems } = user ? await supabase
        .from('saved_items')
        .select('item_id')
        .eq('user_id', user.id) : { data: [] };
      
      const savedItemIds = new Set(savedItems?.map(s => s.item_id) || []);
      
      const formattedItems = itemsData?.map(item => {
        const profile = profiles?.find(p => p.id === item.seller_id);
        return {
          ...item,
          seller: {
            name: profile?.full_name || profile?.username || 'Student',
            username: profile?.username || 'student',
            avatar_url: profile?.avatar_url
          },
          is_saved: savedItemIds.has(item.id)
        };
      }) || [];
      
      const newItems = append ? [...items, ...formattedItems] : formattedItems;
      mutate(newItems, false);
      memoryCache.set(CACHE_KEYS.MARKETPLACE, newItems, 600);
    } catch (error) {
      console.error('Failed to load marketplace items:', error);
    } finally {
      setLoading(false);
    }
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
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleCreateListing = () => {
    if (!isPremium) {
      setUpgradeModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  const handleContactSeller = async (item: MarketplaceItem) => {
    if (!user || user.id === item.seller_id) return;
    
    try {
      console.log('Contacting seller:', item.seller_id);
      
      // Check if conversation exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${item.seller_id}),and(user1_id.eq.${item.seller_id},user2_id.eq.${user.id})`)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching conversation:', fetchError);
      }
      
      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation.id);
        router.push(`/messages?conversation=${existingConversation.id}`);
      } else {
        console.log('Creating new conversation');
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: item.seller_id
          })
          .select('id')
          .single();
        
        if (error) {
          console.error('Error creating conversation:', error);
          alert('Failed to start conversation. Please try again.');
          return;
        }
        
        if (newConversation) {
          console.log('Created new conversation:', newConversation.id);
          router.push(`/messages?conversation=${newConversation.id}`);
          
          // Send email notification to seller
          fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: (item.seller as any)?.email,
              subject: `Someone is interested in your ${item.title}`,
              html: `<p>A buyer is interested in your marketplace item: <strong>${item.title}</strong></p>`
            })
          });
        }
      }
      
      addPoints(2);
    } catch (error) {
      console.error('Failed to contact seller:', error);
      alert('Failed to contact seller. Please try again.');
    }
  };
  
  const handleSaveItem = async (itemId: string) => {
    if (!user) return;
    
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;
      
      if (item.is_saved) {
        // Remove from saved
        await supabase
          .from('saved_items')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);
        
        const updatedItems = items.map(i => 
          i.id === itemId ? { ...i, is_saved: false } : i
        );
        mutate(updatedItems, false);
      } else {
        // Add to saved
        await supabase
          .from('saved_items')
          .insert({
            user_id: user.id,
            item_id: itemId
          });
        
        const updatedItems = items.map(i => 
          i.id === itemId ? { ...i, is_saved: true } : i
        );
        mutate(updatedItems, false);
        
        addPoints(1);
      }
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };
  
  const handleCreateItem = async () => {
    const title = (document.getElementById('item-title') as HTMLInputElement)?.value;
    const description = (document.getElementById('item-description') as HTMLTextAreaElement)?.value;
    const price = parseFloat((document.getElementById('item-price') as HTMLInputElement)?.value || '0');
    const category = (document.getElementById('item-category') as HTMLSelectElement)?.value;
    const condition = (document.getElementById('item-condition') as HTMLSelectElement)?.value;
    const location = (document.getElementById('item-location') as HTMLInputElement)?.value;
    const fileInput = document.getElementById('item-images') as HTMLInputElement;
    
    // Validate input
    const validation = validateData(marketplaceItemSchema, {
      title: title?.trim(),
      description: description?.trim(),
      price,
      category,
      condition,
      location: location?.trim()
    });

    if (!validation.success) {
      alert('errors' in validation ? validation.errors.join('\n') : 'Validation failed');
      return;
    }
    
    setUploading(true);
    
    try {
      let imageUrls: string[] = [];
      
      // Upload images (limit to 5)
      if (fileInput?.files) {
        const files = Array.from(fileInput.files).slice(0, 5);
        for (const file of files) {
          try {
            const result = await uploadToCloudinary(file);
            imageUrls.push(result.url);
          } catch (error) {
            console.error('Failed to upload image:', error);
          }
        }
      }
      
      const { error } = await supabase
        .from('marketplace_items')
        .insert({
          seller_id: user?.id,
          title: title.trim(),
          description: description.trim(),
          price,
          category,
          condition,
          location: location?.trim(),
          images: imageUrls
        });
      
      if (error) throw error;
      
      addPoints(10);
      alert('🛍️ Item listed successfully! +10 XP');
      setShowCreateModal(false);
      setPage(0);
      setHasMore(true);
      mutate();
      memoryCache.delete(CACHE_KEYS.MARKETPLACE);
    } catch (error) {
      console.error('Failed to create item:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setUploading(false);
    }
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
      case 'textbooks': return 'bg-blue-500';
      case 'electronics': return 'bg-purple-500';
      case 'furniture': return 'bg-green-500';
      case 'clothing': return 'bg-pink-500';
      case 'other': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };
  
  if (isLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
          <EnhancedNavbar />
          <div className="max-w-7xl mx-auto px-4 pt-20 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-4"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">


                {/* Image */}
                <div 
                  className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
                  onMouseEnter={() => {
                    console.log('Item images:', item.images);
                    if (item.images && Array.isArray(item.images) && item.images.length > 1) {
                      intervalRefs.current[item.id] = setInterval(() => {
                        setCurrentImageIndex(prev => ({
                          ...prev,
                          [item.id]: ((prev[item.id] || 0) + 1) % item.images.length
                        }));
                      }, 3000);
                    }
                  }}
                  onMouseLeave={() => {
                    if (intervalRefs.current[item.id]) {
                      clearInterval(intervalRefs.current[item.id]);
                      delete intervalRefs.current[item.id];
                    }
                  }}
                >
                  {item.images && Array.isArray(item.images) && item.images.length > 0 ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={item.images[currentImageIndex[item.id] || 0]}
                        onError={(e) => {
                          console.log('Image failed to load:', item.images[currentImageIndex[item.id] || 0]);
                          e.currentTarget.style.display = 'none';
                        }} 
                        alt={item.title}
                        width={400}
                        height={192}
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />
                      {item.images.length > 1 && (
                        <>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            {(currentImageIndex[item.id] || 0) + 1}/{item.images.length}
                          </div>
                          <div className="absolute bottom-2 left-2 flex space-x-1">
                            {item.images.map((_, index) => (
                              <div 
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  index === (currentImageIndex[item.id] || 0) 
                                    ? 'bg-white' 
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      {categories.find(c => c.id === item.category)?.icon || '📦'}
                    </div>
                  )}
                  
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



                  {/* Seller Info */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {item.seller?.avatar_url ? (
                          <Image src={item.seller.avatar_url} alt="Seller" width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          item.seller?.name.charAt(0) || 'S'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.seller?.name || 'Student'}
                          </span>
                          <span className="text-blue-500">✓</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          @{item.seller?.username || 'student'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.location && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">📍 {item.location}</div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Contact button clicked for item:', item.id);
                        handleContactSeller(item);
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
                      disabled={!user || user.id === item.seller_id}
                    >
                      {!user ? '🔒 Login to Contact' : user.id === item.seller_id ? '💬 Your Item' : '💬 Contact'}
                    </button>
                    
                    <button 
                      onClick={() => handleSaveItem(item.id)}
                      className={`px-4 py-2 border font-medium rounded-lg transition-colors duration-200 ${
                        item.is_saved 
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {item.is_saved ? '🔖 Saved' : '🔖 Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Infinite scroll trigger */}
            {hasMore && items.length > 0 && (
              <div ref={ref} className="col-span-full flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            )}
            
            {!hasMore && items.length > 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>🎉 You've seen all items!</p>
              </div>
            )}
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

          {/* Create Item Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      🛍️ List New Item
                    </h3>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <span className="text-xl">✕</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title *
                      </label>
                      <input
                        id="item-title"
                        type="text"
                        placeholder="e.g., Calculus Textbook 9th Edition"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        id="item-description"
                        placeholder="Describe your item's condition, features, and why someone should buy it..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Price ($) *
                        </label>
                        <input
                          id="item-price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category *
                        </label>
                        <select id="item-category" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <option value="textbooks">📚 Textbooks</option>
                          <option value="electronics">📱 Electronics</option>
                          <option value="furniture">🪑 Furniture</option>
                          <option value="clothing">👕 Clothing</option>
                          <option value="other">📦 Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Condition
                        </label>
                        <select id="item-condition" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <option value="new">New</option>
                          <option value="like_new">Like New</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          id="item-location"
                          type="text"
                          placeholder="e.g., Library, Dorm A"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Photos (Optional)
                      </label>
                      <input
                        id="item-images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload up to 5 photos to showcase your item (multiple images supported)</p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        disabled={uploading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateItem}
                        disabled={uploading}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                      >
                        {uploading ? '⏳ Creating...' : '🛍️ List Item (+10 XP)'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function MarketplacePage({ fallback }) {
  return (
    <SWRConfig value={{ fallback }}>
      <MarketplaceContent />
    </SWRConfig>
  );
}

export const getServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  const ITEMS_PER_PAGE = 12;

  const { data: itemsData, error } = await supabase
    .from('marketplace_items')
    .select('*, seller:profiles!seller_id(*)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .range(0, ITEMS_PER_PAGE - 1);

  if (error) {
    console.error('SSR Error fetching items:', error.message);
    return { props: { initialItems: [], initialHasMore: false } };
  }

  const initialHasMore = itemsData.length >= ITEMS_PER_PAGE;

  // Note: Saved status will be fetched on the client side for logged-in users.
  const formattedItems = itemsData.map(item => ({ ...item, is_saved: false }));

  return {
    props: {
      initialItems: formattedItems,
      initialHasMore,
    },
  };
};