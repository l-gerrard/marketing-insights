
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const GoogleCallbackPopup = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    console.log('=== REACT GOOGLE POPUP CALLBACK (FALLBACK) ===');
    console.log('This React component should not normally be reached.');
    console.log('The HTML handler should handle the callback instead.');
    console.log('Current URL:', window.location.href);
    console.log('Current origin:', window.location.origin);
    
    // Parse URL parameters from both search and hash
    const urlCode = searchParams.get('code');
    const urlError = searchParams.get('error');
    const urlErrorDescription = searchParams.get('error_description');

    const code = urlCode;
    const error = urlError;
    const errorDescription = urlErrorDescription;

    console.log('OAuth parameters:', {
      code: code ? code.substring(0, 20) + '...' : null,
      error,
      errorDescription
    });

    if (error) {
      const errorMsg = `Google OAuth error: ${errorDescription || error}`;
      console.error('OAuth error received:', errorMsg);
      setStatus('error');
      setErrorMessage(errorMsg);
      
      if (window.opener) {
        console.log('Sending error to parent window');
        try {
          window.opener.postMessage({
            type: 'OAUTH_ERROR',
            error: errorMsg
          }, window.location.origin);
        } catch (e) {
          console.error('Failed to send error message:', e);
        }
      }
    } else if (code) {
      console.log('OAuth code received successfully');
      setStatus('success');
      
      if (window.opener) {
        console.log('Sending success message to parent window');
        try {
          window.opener.postMessage({
            type: 'OAUTH_SUCCESS',
            code: code
          }, window.location.origin);
        } catch (e) {
          console.error('Failed to send success message:', e);
        }
      }
    } else {
      const errorMsg = 'No authorization code or error received from Google';
      console.error(errorMsg);
      setStatus('error');
      setErrorMessage(errorMsg);
      
      if (window.opener) {
        try {
          window.opener.postMessage({
            type: 'OAUTH_ERROR',
            error: errorMsg
          }, window.location.origin);
        } catch (e) {
          console.error('Failed to send error message:', e);
        }
      }
    }

    // Close popup after delay
    const timer = setTimeout(() => {
      console.log('Closing popup window');
      try {
        window.close();
      } catch (e) {
        console.error('Failed to close window:', e);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-iced-coffee-50 to-iced-matcha-50">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iced-coffee-600 mx-auto mb-4"></div>
            <p className="text-iced-coffee-600">Processing Google authentication...</p>
            <p className="text-sm text-iced-coffee-500 mt-2">This window will close automatically.</p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
              <p className="text-xs font-medium text-blue-700 mb-1">Note:</p>
              <p className="text-xs text-blue-600">This is the React fallback handler. The HTML handler should normally process this callback.</p>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">Google authentication successful!</p>
            <p className="text-sm text-iced-coffee-500 mt-2">Closing window...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Google authentication failed</p>
            <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
            <button 
              onClick={() => window.close()} 
              className="mt-4 px-4 py-2 bg-iced-coffee-600 text-white rounded hover:bg-iced-coffee-700"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallbackPopup;
