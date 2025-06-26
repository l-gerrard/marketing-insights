
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Bot, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const handleSignOut = async () => {
    console.log('Header: Starting sign out');
    setIsSigningOut(true);
    try {
      await signOut();
      console.log('Header: Sign out completed');
      // Don't navigate manually - let the auth state change handle it
    } catch (error) {
      console.error('Sign out error in header:', error);
    } finally {
      setIsSigningOut(false);
      setIsMobileMenuOpen(false);
    }
  };
  
  const handleSignIn = () => {
    navigate('/auth');
    setIsMobileMenuOpen(false);
  };
  
  const handleChatClick = () => {
    navigate('/chat');
    setIsMobileMenuOpen(false);
  };
  
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };
  
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-soft border-b border-sage-blue-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img alt="AI Marketing Bestie" className="h-16 w-auto object-contain" src="/lovable-uploads/7e555def-4fe6-41a2-955f-e5c471112d4d.png" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button onClick={handleChatClick} variant="ghost" size="sm" className={`${location.pathname === '/chat' ? 'text-lime-green-700 bg-lime-green-50' : 'text-gray-700 hover:text-lime-green-700 hover:bg-lime-green-50'} px-4 py-2 rounded-lg font-medium transition-colors`}>
              <Bot className="h-4 w-4 mr-2" />
              AI Chat
            </Button>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Hamburger Menu for Authenticated Users */}
                <div className="relative">
                  <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" size="sm" className="p-2 hover:bg-sage-blue-50">
                    <Menu className="h-5 w-5" />
                  </Button>
                  
                  {isMobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-lg shadow-sage-glow border border-sage-blue-200 py-2 z-50">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-sage-blue-200">
                        {user.email}
                      </div>
                      <button onClick={() => handleNavigation('/data-integration')} className="w-full text-left px-4 py-2 text-sm text-sage-blue-700 hover:bg-sage-blue-50 transition-colors">
                        Integrations
                      </button>
                      <button onClick={() => handleNavigation('/analytics')} className="w-full text-left px-4 py-2 text-sm text-sage-blue-700 hover:bg-sage-blue-50 transition-colors">
                        Analytics
                      </button>
                      <div className="border-t border-sage-blue-200 mt-2 pt-2">
                        <button 
                          onClick={handleSignOut} 
                          disabled={isSigningOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center disabled:opacity-50"
                        >
                          <LogOut className={`h-4 w-4 mr-2 ${isSigningOut ? 'animate-spin' : ''}`} />
                          {isSigningOut ? 'Signing out...' : 'Sign Out'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Button onClick={handleSignIn} className="bg-lime-green-500 hover:bg-lime-green-600 text-gray-800 px-6 py-2 rounded-lg font-semibold shadow-lime-glow" size="sm">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" size="sm" className="p-2 hover:bg-sage-blue-50">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-sage-blue-200 py-4 bg-white/95 backdrop-blur-sm">
            <div className="space-y-2">
              <Button onClick={handleChatClick} variant="ghost" className={`${location.pathname === '/chat' ? 'text-lime-green-700 bg-lime-green-50' : 'text-gray-700'} w-full justify-start px-4 py-3`}>
                <Bot className="h-4 w-4 mr-2" />
                AI Chat
              </Button>
              
              {user ? (
                <>
                  <Button onClick={() => handleNavigation('/data-integration')} variant="ghost" className={`${location.pathname === '/data-integration' ? 'text-sage-blue-700 bg-sage-blue-50' : 'text-gray-700'} w-full justify-start px-4 py-3`}>
                    Integrations
                  </Button>
                  
                  <Button onClick={() => handleNavigation('/analytics')} variant="ghost" className={`${location.pathname === '/analytics' ? 'text-sage-blue-700 bg-sage-blue-50' : 'text-gray-700'} w-full justify-start px-4 py-3`}>
                    Analytics
                  </Button>
                  
                  <div className="border-t border-sage-blue-200 pt-2 mt-2">
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {user.email}
                    </div>
                    <Button 
                      onClick={handleSignOut} 
                      disabled={isSigningOut}
                      variant="ghost" 
                      className="w-full justify-start px-4 py-3 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <LogOut className={`h-4 w-4 mr-2 ${isSigningOut ? 'animate-spin' : ''}`} />
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="px-4 pt-2">
                  <Button onClick={handleSignIn} className="bg-lime-green-500 hover:bg-lime-green-600 text-gray-800 w-full py-3 rounded-lg font-semibold shadow-lime-glow">
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
