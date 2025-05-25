"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Icons } from "@/components/shared/icons";

export const SwitchModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-8 bg-gray-200 rounded-full relative">
        <div className="w-6 h-6 bg-white rounded-full absolute top-1 left-1 transition-transform duration-300" />
      </div>
    );
  }

  const isDark = theme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative w-16 h-8 rounded-full transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${isDark 
          ? "bg-gray-700 border-2 border-gray-600" 
          : "bg-gray-200 border-2 border-gray-300"
        }
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      tabIndex={0}
    >
      {/* Background track */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {/* Light mode background (left side) */}
        <div 
          className={`
            absolute left-0 top-0 w-1/2 h-full flex items-center justify-center
            transition-opacity duration-300
            ${isDark ? "opacity-30" : "opacity-100"}
          `}
        >
          <Icons.sun className="w-4 h-4 text-yellow-500" />
        </div>
        
        {/* Dark mode background (right side) */}
        <div 
          className={`
            absolute right-0 top-0 w-1/2 h-full flex items-center justify-center
            transition-opacity duration-300
            ${isDark ? "opacity-100" : "opacity-30"}
          `}
        >
          <Icons.moon className="w-4 h-4 text-blue-300" />
        </div>
      </div>

      {/* Sliding circle */}
      <div
        className={`
          absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ease-in-out
          shadow-md flex items-center justify-center
          ${isDark 
            ? "translate-x-8 bg-gray-800 border border-gray-600" 
            : "translate-x-1 bg-white border border-gray-200"
          }
        `}
      >
        {/* Icon inside the sliding circle */}
        {isDark ? (
          <Icons.moon className="w-3 h-3 text-blue-300" />
        ) : (
          <Icons.sun className="w-3 h-3 text-yellow-500" />
        )}
      </div>
    </button>
  );
}; 