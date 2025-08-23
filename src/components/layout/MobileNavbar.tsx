import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MobileNavbar() {
  const router = useRouter();
  
  const navItems = [
    { href: '/feed', icon: '🏠', label: 'Home' },
    { href: '/study-groups', icon: '📚', label: 'Groups' },
    { href: '/messages', icon: '💬', label: 'Messages' },
    { href: '/analytics', icon: '📊', label: 'Stats' },
    { href: '/profile', icon: '👤', label: 'Profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`flex flex-col items-center py-2 px-1 ${
              router.pathname === item.href ? 'text-blue-600' : 'text-gray-600'
            }`}>
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}