import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  CONNECTING = "CONNECTING",
}

interface AgentProps {
  userName: string;
}

const Agent = ({ userName }: AgentProps) => {
  // Use state to make callStatus dynamic instead of hardcoded
  const [callStatus, _setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const isSpeaking = true;
  const messages = [
      "What is your name?",
      "My name is John Doe, nice to meet you!",
  ];
  const lastMessage = messages[messages.length - 1];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Video Call Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Interviewer Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-[320px] flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Image
                    src="/ai-avatar.png"
                    alt="AI Interviewer"
                    width={50}
                    height={42}
                    className="object-cover"
                  />
                </div>
              </div>
              {isSpeaking && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-pulse" />
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">AI Interviewer</h3>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-[320px] flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 p-1">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <Image
                    src="/user-avatar.png"
                    alt="Your avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">{userName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      {messages.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-300">Live Transcript</span>
            </div>
            <p className={cn(
              "text-lg text-white leading-relaxed transition-all duration-500",
              "animate-fadeIn"
            )}>
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-102 transition-all duration-300 flex items-center gap-3 min-w-[140px] justify-center">
            {callStatus === CallStatus.CONNECTING && (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Start Call"
                : "Connecting..."}
            </span>
          </button>
        ) : (
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-102 transition-all duration-300 flex items-center gap-3 min-w-[140px] justify-center">
            <span>End Call</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent;
