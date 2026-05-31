import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../lib/AuthProvider';

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onMenuClick }) => {
  const { email, role, fullName } = useAuth();
  
  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  return (
    <header className="bg-white border-b border-navy-dark/10 h-16 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
      {/* Left side: Hamburger (Mobile) + Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-navy-dark hover:bg-navy-dark/5 transition-colors focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-display font-extrabold text-xl text-navy-dark tracking-tight uppercase">
          {title}
        </h1>
      </div>

      {/* Right side: Admin Email + Avatar Monogram + Role Badge */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex flex-col text-right">
          <div className="flex items-center justify-end space-x-1.5">
            <span className="text-[9px] font-bold text-navy-dark/40 uppercase tracking-wider">
              Executive
            </span>
            {role && (
              <span className="bg-orange-burnt/10 text-orange-burnt border border-orange-burnt/20 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded leading-none shrink-0">
                {role.replace('_', ' ')}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-navy-dark font-sans leading-none mt-1">
            {email || 'Loading...'}
          </span>
        </div>
        <div className="w-9 h-9 rounded-full bg-orange-burnt/10 border border-orange-burnt/20 flex items-center justify-center text-orange-burnt font-display font-bold text-xs shadow-inner shrink-0 cursor-default select-none">
          {getInitials()}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
