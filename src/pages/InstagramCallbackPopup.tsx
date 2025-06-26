
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const InstagramCallbackPopup = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    console.log('=== INSTAGRAM POPUP DEBUG START ===');
    console.log('InstagramCallbackPopup loaded at:', new Date().toISOString());
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
    console.log('Current search:', window.location.search);
    console.log('Current hash:', window.location.hash);
    console.log('Search params string:', searchParams.toString());
    console.log('Document readyState:', document.readyState);
    console.log('Window opener exists:', !!window.opener);
    console.log('Window origin:', window.location.origin);

    // Check for both URL params and hash params
    const urlCode = searchParams.get('code');
    const urlError = searchParams.get('error');
    const urlErrorDescription = searchParams.get('error_description');

    // Also check hash params in case Instagram uses hash-based redirect
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashCode = hashParams.get('code');
    const hashError = hashParams.get('error');
    const hashErrorDescription = hashParams.get('error_description');

    const code = urlCode || hashCode;
    const error = urlError || hashError;
    const errorDescription = urlErrorDescription || hashErrorDescription;

    console.log('Instagram OAuth callback data:', { 
      urlCode: urlCode ? urlCode.substring(0, 10) + '...' : 'null',
      hashCode: hashCode ? hashCode.substring(0, 10) + '...' : 'null',
      finalCode: code ? code.substring(0, 10) + '...' : 'null',
      error, 
      errorDescription 
    });

    if (error) {
      const errorMsg = `Instagram authentication failed: ${errorDescription || error}`;
      console.error('Instagram OAuth error:', errorMsg);
      setStatus('error');
      setErrorMessage(errorMsg);
      
      // Send error to parent window
      if (window.opener) {
        console.log('Sending Instagram error message to parent window');
        try {
          window.opener.postMessage({
            type: 'OAUTH_ERROR',
            error: errorMsg
          }, window.location.origin);
          console.log('Instagram error message sent successfully');
        } catch (e) {
          console.error('Failed to send Instagram error message:', e);
        }
      } else {
        console.error('No opener window found');
      }
    } else if (code) {
      console.log('Instagram OAuth code received, sending to parent window');
      setStatus('success');
      
      // Send success with code to parent window
      if (window.opener) {
        console.log('Sending Instagram success message to parent window');
        try {
          window.opener.postMessage({
            type: 'OAUTH_SUCCESS',
            code: code
          }, window.location.origin);
          console.log('Instagram success message sent successfully');
        } catch (e) {
          console.error('Failed to send Instagram success message:', e);
        }
      } else {
        console.error('No opener window found');
      }
    } else {
      const errorMsg = 'No authorization code received from Instagram';
      console.error('Instagram OAuth error:', errorMsg);
      setStatus('error');
      setErrorMessage(errorMsg);
      
      // Send generic error
      if (window.opener) {
        console.log('Sending Instagram generic error to parent window');
        try {
          window.opener.postMessage({
            type: 'OAUTH_ERROR',
            error: errorMsg
          }, window.location.origin);
          console.log('Instagram generic error message sent successfully');
        } catch (e) {
          console.error('Failed to send Instagram generic error message:', e);
        }
      } else {
        console.error('No opener window found');
      }
    }

    console.log('=== INSTAGRAM POPUP DEBUG END ===');

    // Close popup after a delay
    const timer = setTimeout(() => {
      console.log('Closing Instagram popup window after delay');
      try {
        window.close();
      } catch (e) {
        console.error('Failed to close Instagram window:', e);
      }
    }, 3000); // Increased delay for debugging

    return () => {
      clearTimeout(timer);
      console.log('InstagramCallbackPopup cleanup completed');
    };
  }, [searchParams]);

  // Add error boundary-like error handling
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('JavaScript error in Instagram popup:', event.error);
      setStatus('error');
      setErrorMessage(`JavaScript error: ${event.error?.message || 'Unknown error'}`);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-iced-coffee-50 to-iced-matcha-50">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-iced-coffee-600">Processing Instagram authentication...</p>
            <p className="text-sm text-iced-coffee-500 mt-2">This window will close automatically.</p>
            <p className="text-xs text-iced-coffee-400 mt-2">
              If this takes too long, check the browser console for errors.
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">Instagram authentication successful!</p>
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
            <p className="text-red-600 font-medium">Instagram authentication failed</p>
            <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
            <p className="text-xs text-iced-coffee-500 mt-2">This window will close automatically.</p>
            <button 
              onClick={() => window.close()} 
              className="mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InstagramCallbackPopup;
