"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PricingPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to subscription page
    router.replace('/subscription');
  }, [router]);

  return (
    <div className="container mx-auto py-8">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 