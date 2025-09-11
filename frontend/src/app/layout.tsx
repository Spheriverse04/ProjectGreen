// The previous code contained imports that are not compatible with the single-file
// compilation environment. This version has been refactored to be self-contained.

import React from 'react';

export const metadata = {
  title: 'Project Clean India - Integrated Waste Management Platform',
  description: 'Transforming waste management through technology and community engagement',
};

// The previous Link components have been replaced with standard anchor tags.
// The CSS import has been replaced with a <style> block and a Tailwind CDN link.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        {/* The custom eco-leaf-pattern style has been removed. */}
      </head>
      {/* The eco-leaf-pattern class has been replaced with Tailwind gradient classes. */}
      <body className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                  <a href="/" className="hover:text-green-600 transition-colors">
                    Project Clean India
                  </a>
                </h1>
              </div>
              <nav>
                <ul className="flex space-x-4 sm:space-x-6">
                  <li><a href="/about" className="text-gray-600 hover:text-green-600 transition-colors font-medium">About</a></li>
                  <li><a href="/services" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Services</a></li>
                  <li><a href="/contact" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Contact</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="bg-gray-100/95 backdrop-blur-md text-gray-600 py-6 mt-12 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
            &copy; {new Date().getFullYear()} Project Clean India. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

