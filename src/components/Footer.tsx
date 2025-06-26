
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 sm:col-span-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3 sm:mb-4">
              <img src="/lovable-uploads/82061c48-568f-4d49-a2de-45b67235181e.png" alt="AI Marketing Bestie Logo - AI Marketing Analytics Platform" className="h-6 sm:h-8 w-auto" />
            </div>
            <p className="text-gray-600 text-sm max-w-md mx-auto sm:mx-0">
              Your AI Marketing Bestie that transforms complex analytics data into clear, actionable insights 
              to help you make smarter marketing decisions.
            </p>
          </div>

          {/* Product Links */}
          <nav className="text-center sm:text-left">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4">
              Product
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="/trends" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Daily Trends
                </a>
              </li>
              <li>
                <a href="/chat" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  AI Chat
                </a>
              </li>
              <li>
                <a href="/analytics" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Analytics
                </a>
              </li>
            </ul>
          </nav>

          {/* Company Links */}
          <nav className="text-center sm:text-left">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4">
              Company
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="/about" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors font-medium">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-and-conditions" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} AI Marketing Bestie. All rights reserved.
            </p>
            <div className="mt-3 sm:mt-0">
              <p className="text-gray-500 text-sm">Made with ❤️ for busy entrepreneurs everywhere</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
