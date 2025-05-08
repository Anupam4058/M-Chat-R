/**
 * Layout Component
 * Provides the main layout structure for the application including:
 * - Responsive sidebar for question navigation
 * - Header with title
 * - Main content area
 * - Mobile-friendly design with hamburger menu
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from './functions';
import ProgressBar from './ui/ProgessBar';

interface LayoutProps {
  children: React.ReactNode;
  currentQuestionIndex: number;
  totalQuestions: number;
  onQuestionClick: (index: number) => void;
  answeredQuestions: number[];
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentQuestionIndex,
  totalQuestions,
  onQuestionClick,
  answeredQuestions,
}) => {
  // State for controlling sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Effect to handle clicking outside sidebar on mobile (Close sidebar when clicking outside on mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const hamburger = document.getElementById('hamburger');
      if (
        isSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        hamburger &&
        !hamburger.contains(event.target as Node) &&
        window.innerWidth < 768
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  // Effect to handle sidebar visibility on desktop (On desktop, always close sidebar (show as static))
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to close sidebar on mobile devices
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200">
      <div className="md:flex md:flex-row md:items-stretch md:justify-start max-w-7xl mx-auto gap-2">
        {/* Sidebar Navigation */}
        <div
          id="sidebar"
          className={cn(
            'fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'w-4/5 max-w-xs md:w-64 md:relative md:translate-x-0 md:shadow-none md:min-h-screen',
            'overflow-y-auto',
            'pl-1',
            'pr-1'
          )}
        >
          <div className="p-2 md:p-6 h-screen flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-display font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text text-transparent mb-2 md:mb-4">Progress Overview</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-xl"
                aria-label="Close sidebar"
              >
                ×
              </button>
            </div>
            {/* Question Navigation Buttons */}
            <div className="space-y-2 flex-1 overflow-y h-screen">
              {Array.from({ length: totalQuestions }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (answeredQuestions.includes(index) || currentQuestionIndex === index) {
                      onQuestionClick(index);
                      closeSidebarOnMobile();
                    }
                  }}
                  disabled={!answeredQuestions.includes(index) && currentQuestionIndex !== index}
                  className={cn(
                    'w-full px-4 py-3 rounded-full transition-all duration-200 transform flex items-center mb-2 shadow-sm',
                    currentQuestionIndex === index
                      ? 'bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 text-indigo-800 shadow-lg scale-105 border-2 border-transparent'
                      : answeredQuestions.includes(index)
                      ? 'bg-green-100 text-green-700 border-2 border-green-200 hover:scale-105'
                      : 'bg-red-50 text-red-500 border-2 border-red-200',
                    'overflow-hidden whitespace-nowrap',
                    !answeredQuestions.includes(index) && currentQuestionIndex !== index ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  )}
                  style={{maxWidth:'100%'}}
                >
                  <span className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full font-bold text-base shadow-md mr-3",
                    currentQuestionIndex === index
                      ? 'bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 text-indigo-800'
                      : answeredQuestions.includes(index)
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-100 text-red-500'
                  )}>
                    {index + 1}
                  </span>
                  <span className="truncate block text-base font-semibold">{`Question ${index+1}`}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen bg-transparent">
          {/* Header with Hamburger Menu (only for Mobile) */}
          <header className="bg-white shadow-md sticky top-0 z-30 md:static md:shadow-none">
            <div className="px-4 py-3 sm:px-4 sm:py-4 flex items-center justify-between md:justify-center max-w-4xl mx-auto">
              <button
                id="hamburger"
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 md:hidden"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl sm:text-xl font-display font-bold text-indigo-800 text-center w-full">
                M-CHAT-R Questionnaire
              </h1>
            </div>
          </header>

          {/* Main Content Container */}
          <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-4 pb-8 pt-4 sm:pt-8">
            <div className="w-full max-w-lg sm:max-w-3xl flex-1 flex items-center justify-center min-h-[400px]">
              {children}
            </div>
          </main>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 