import React from 'react'

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-t-transparent border-[#1976d2] dark:border-[#1976d2] rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-t-transparent border-[#1976d2]/80 dark:border-[#1976d2]/80 rounded-full animate-spin-slow" />
            <div className="absolute inset-4 border-4 border-t-transparent border-[#1976d2]/60 dark:border-[#1976d2]/60 rounded-full animate-spin-slower" />
          </div>
        </div>
        <style jsx>{`
          @keyframes spin-slow {
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes spin-slower {
            to {
              transform: rotate(-360deg);
            }
          }
          @keyframes morph {
            0% {
              border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
            }
            50% {
              border-radius: 30% 60% 70% 40%/50% 60% 30% 60%;
            }
            100% {
              border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
            }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          .animate-spin-slower {
            animation: spin-slower 4s linear infinite;
          }
          .animate-morph {
            animation: morph 8s ease-in-out infinite;
          }
          .delay-100 {
            animation-delay: 100ms;
          }
          .delay-200 {
            animation-delay: 200ms;
          }
        `}</style>
      </div>
  )
}

export default Loading