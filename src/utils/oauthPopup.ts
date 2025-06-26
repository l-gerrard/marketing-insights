
export interface OAuthResult {
  success: boolean;
  error?: string;
  code?: string;
}

export const openOAuthPopup = (authUrl: string, provider: string): Promise<OAuthResult> => {
  return new Promise((resolve) => {
    console.log(`=== OPENING ${provider.toUpperCase()} OAUTH POPUP ===`);
    console.log('Auth URL:', authUrl);
    console.log('Provider:', provider);
    console.log('Current origin:', window.location.origin);

    // Generate the expected redirect URI based on provider - using React routes
    const expectedRedirectUri = `${window.location.origin}/auth/${provider}/callback`;
    
    console.log('Expected callback URL:', expectedRedirectUri);

    // Validate the auth URL contains the correct redirect URI
    const urlObj = new URL(authUrl);
    const redirectUriParam = urlObj.searchParams.get('redirect_uri');
    
    console.log('Redirect URI in auth URL:', redirectUriParam);
    console.log('Expected redirect URI:', expectedRedirectUri);
    
    if (redirectUriParam !== expectedRedirectUri) {
      console.error('REDIRECT URI MISMATCH!');
      console.error('Auth URL has:', redirectUriParam);
      console.error('Expected:', expectedRedirectUri);
      resolve({ 
        success: false, 
        error: `Redirect URI mismatch. Expected: ${expectedRedirectUri}, but auth URL has: ${redirectUriParam}` 
      });
      return;
    }

    const popup = window.open(
      authUrl,
      `${provider}_oauth`,
      'width=500,height=600,scrollbars=yes,resizable=yes,location=yes'
    );

    if (!popup) {
      console.error('Popup was blocked by browser');
      resolve({ success: false, error: 'Popup blocked. Please allow popups for this site.' });
      return;
    }

    console.log('Popup opened successfully');

    // Check if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        console.log('Popup was closed manually by user');
        clearInterval(checkClosed);
        resolve({ success: false, error: 'Authentication cancelled by user.' });
      }
    }, 1000);

    // Listen for messages from popup
    const messageListener = (event: MessageEvent) => {
      console.log('Received message from popup:', event);
      console.log('Message origin:', event.origin);
      console.log('Expected origin:', window.location.origin);
      console.log('Message data:', event.data);

      if (event.origin !== window.location.origin) {
        console.warn('Message origin does not match expected origin, ignoring');
        return;
      }

      if (event.data.type === 'OAUTH_SUCCESS') {
        console.log('OAuth success message received');
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        
        setTimeout(() => {
          if (!popup.closed) {
            popup.close();
          }
        }, 100);
        
        resolve({ success: true, code: event.data.code });
      } else if (event.data.type === 'OAUTH_ERROR') {
        console.log('OAuth error message received');
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        
        setTimeout(() => {
          if (!popup.closed) {
            popup.close();
          }
        }, 100);
        
        resolve({ success: false, error: event.data.error });
      }
    };

    window.addEventListener('message', messageListener);

    // Timeout after 5 minutes
    const timeout = setTimeout(() => {
      console.log('OAuth popup timeout reached');
      clearInterval(checkClosed);
      window.removeEventListener('message', messageListener);
      if (!popup.closed) {
        popup.close();
      }
      resolve({ success: false, error: 'Authentication timeout. Please try again.' });
    }, 5 * 60 * 1000);

    // Clean up timeout when popup closes
    const originalResolve = resolve;
    resolve = (result) => {
      clearTimeout(timeout);
      originalResolve(result);
    };

    console.log(`=== ${provider.toUpperCase()} OAUTH POPUP SETUP COMPLETE ===`);
  });
};
