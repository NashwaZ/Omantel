
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CrossSiteTrackingWarning() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const childWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    const storedIframeUrl = localStorage.getItem('iframe_url');
    if (storedIframeUrl) {

      setIframeUrl(storedIframeUrl);
    }
  }, []);

  useEffect(() => {
    // Automatically open the window 4 seconds after iframeUrl is available
    if (iframeUrl) {
      const timer = setTimeout(() => {
        handleOpenWindow();
      }, 4000);

      return () => clearTimeout(timer); // cleanup if component unmounts early
    }
  }, [iframeUrl]);

  const handleOpenWindow = () => {
    if (!iframeUrl) return;

    childWindowRef.current = window.open(
      iframeUrl,
      'Visa form Window',
      `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`
    );
    

    if (!childWindowRef.current) {
      console.error('Failed to open the visa form window. Please check popup blocker settings.');
    } else {
      console.log('Visa form window opened successfully.');
    }
  };
  // childWindowRef.current?.window.addEventListener("message", (event) => {
  //   // if (event.data?.type === 'formSubmitted') {
  //     alert("Received from popup: " + event.data.data);
  //     // You can update React state here if needed
  //   // }
  // }, { once: true });


  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {

      // childWindowRef.current?.window.addEventListener("message", (event) => {
        if (event.data?.type === 'formSubmitted') {
          window.location.href = '/visa-complete';
          // alert("Received from popup: " + event.data.data);
          // You can update React state here if needed
        }
      // }, { once: true });
    
      // const TRUSTED_ORIGIN = 'https://omantel.sandbox-simplevisa.net';
      // if (event.origin !== TRUSTED_ORIGIN) {
      //   console.warn('Blocked message from untrusted origin:', event.origin);
      //   return;
      // }

      // const { status, redirectUrl } = event.data || {};
      // if (status === 'success') {
      //   window.location.href = redirectUrl || '/visa-complete';
      // } else if (status === 'failed') {
      //   window.location.href = redirectUrl || '/visa-failed';
      // } else {
      //   console.warn('⚠️ Unexpected message received:', event.data);
      // }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" dir="ltr">
    <div className="omantel-loading mb-4">
      <div className="omantel-loading-spinner"></div>
    </div>
    <p className="text-gray-600 mb-4" >Preparing visa application form...</p>
  
    {/* <Button onClick={handleOpenWindow} disabled={!iframeUrl}>
      Open Visa Form
    </Button> */}
  </div>
  
  );
}
