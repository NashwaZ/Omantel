'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CrossSiteTrackingWarning() {
  const [iframeUrl, setIframeUrl] = useState<string>();
  const childWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    try {
      const signin_url = localStorage.getItem("signin_url");
      const storedIframeUrl = localStorage.getItem("iframe_url");
      debugger;

      if (storedIframeUrl) {
        setIframeUrl(storedIframeUrl);

        childWindowRef.current = window.open(
          storedIframeUrl,
          'Visa form Window',
          `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`
        );

        if (!childWindowRef.current) {
          console.error('Failed to open the visa form window. Please check popup blocker settings.');
        } else {
          console.log('Visa form window opened successfully.');
        }
      }
    } catch (err) {
      console.error('Error opening visa form window:', err);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('EVENT ORIGIN:', event.origin);
      console.log('EVENT DATA:', event.data);

      const TRUSTED_ORIGIN = 'https://omantel.sandbox-simplevisa.net';

      if (event.origin !== TRUSTED_ORIGIN) {
        console.warn('Blocked message from untrusted origin:', event.origin);
        return;
      }

      const { status, redirectUrl } = event.data || {};

      if (status === 'success') {
        console.log('Visa submission successful. Redirecting...');
        window.location.href = redirectUrl || '/visa-complete';
      } else if (status === 'failed') {
        console.log('Visa submission failed. Redirecting...');
        window.location.href = redirectUrl || '/visa-failed';
      } else {
        console.warn('Unexpected message data received:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    console.log('Message event listener added.');

    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('Message event listener removed.');
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="omantel-loading mb-4">
        <div className="omantel-loading-spinner"></div>
      </div>
      <p className="text-gray-600">Preparing visa application form...</p>
    </div>
  );
}