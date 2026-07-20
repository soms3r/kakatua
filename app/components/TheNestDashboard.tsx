// React Component: TheNestDashboard (app/components/TheNestDashboard.tsx)
'use client';

import React from 'react';

interface Mission {
  id: string;
  title: string;
  description: string;
  expReward: number;
  progress: number; // 0-100
  completed: boolean;
  icon: string;
}

interface TheNestDashboardProps {
  userName: string;
  streakDays: number;
  missions: Mission[];
  onFindKakatua: () => void;
  onMissionClick?: (missionId: string) => void;
}

export default function TheNestDashboard({
  userName,
  streakDays,
  missions,
  onFindKakatua,
  onMissionClick,
}: TheNestDashboardProps) {
  
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
      {/* 1. Welcoming Hero Nest */}
      <div className="bg-gradient-to-br from-[#154212] to-[#2d5a27] text-white p-6 rounded-[28px] shadow-[0_12px_40px_rgba(21,66,18,0.15)] relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold tracking-tight">Welcome back, {userName}</h2>
          <p className="text-xs text-[#9dd090] mt-1.5 max-w-[85%] leading-relaxed">
            The canopy missed you. Your nest is warm, and the winds of discovery are calling.
          </p>
        </div>
        
        {/* Abstract background graphics */}
        <div className="absolute right-[-10px] bottom-[-20px] w-32 h-32 bg-[#2d5a27] rounded-full opacity-35 blur-2xl" />
        <div className="absolute right-6 bottom-4 opacity-10">
          <span className="material-symbols-outlined !text-[80px]">nest_eco_leaf</span>
        </div>
      </div>

      {/* 2. Main Matchmaking Flight Button */}
      <div className="flex flex-col items-center justify-center py-8 bg-[#ffffff] border border-[#efeeea] rounded-[28px] shadow-[0_8px_32px_rgba(21,66,18,0.04)] relative overflow-hidden p-6">
        
        {/* Soft glow rings — earthy green gradient */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#a1d494]/20 to-[#2d5a27]/10 rounded-full animate-ping [animation-duration:3s] opacity-60" />
          <div className="absolute inset-3 bg-gradient-to-br from-[#bcf0ae]/25 to-[#a1d494]/15 rounded-full animate-pulse [animation-duration:2.5s]" />
          <div className="absolute inset-6 bg-gradient-to-br from-[#bcf0ae]/10 to-transparent rounded-full" />
          
          <button
            onClick={() => { console.log('[Kakatua] Take Flight — button clicked'); onFindKakatua(); }}
            className="group relative w-28 h-28 bg-gradient-to-br from-[#2d5a27] to-[#154212] hover:from-[#154212] hover:to-[#0d2e0b] text-white rounded-full flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(45,90,39,0.35)] hover:shadow-[0_8px_40px_rgba(45,90,39,0.5)] active:scale-95 transition-all duration-300 border-2 border-[#a1d494]/30 hover:border-[#a1d494]/50 hover:scale-105"
          >
            <span className="material-symbols-outlined text-3xl transition-transform duration-300 group-hover:translate-y-[-2px]">flight_takeoff</span>
            <span className="text-[11px] font-bold mt-1.5 tracking-wider">Take Flight</span>
          </button>
        </div>

        <p className="text-xs text-[#72796e] text-center mt-5 max-w-[80%] leading-relaxed">
          Enter the nest queue and soar with a compatible language partner nearby.
        </p>
      </div>

      {/* 3. Streak / Daily Chain Status */}
      <div className="flex items-center justify-between p-4 bg-[#ffdea5]/40 border border-[#fdbb24]/30 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#7b5800] bg-[#fdbb24]/20 p-2 rounded-xl">local_fire_department</span>
          <div>
            <h4 className="text-xs font-semibold text-[#6c4d00]">Daily Flight Chain</h4>
            <p className="text-[10px] text-[#7b5800] mt-0.5">Keep your streak airborne!</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-[#6c4d00]">{streakDays}</span>
          <span className="text-xs text-[#7b5800] font-medium">Days</span>
        </div>
      </div>

      {/* 4. Daily Flights (Missions Checklist) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#1b1c1a] tracking-tight">My Daily Flights</h3>
          <span className="text-[10px] bg-[#f5f3ef] text-[#42493e] px-2 py-0.5 rounded-full font-medium">
            {missions.filter(m => m.completed).length} of {missions.length} Complete
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {missions.map((mission) => {
            return (
              <div
                key={mission.id}
                onClick={() => onMissionClick && onMissionClick(mission.id)}
                className="bg-[#ffffff] border border-[#efeeea] rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                  <span className={`material-symbols-outlined text-lg p-2.5 rounded-xl ${
                    mission.completed 
                      ? 'text-[#2D5A27] bg-[#bcf0ae]/30' 
                      : 'text-[#42493e] bg-[#f5f3ef]'
                  }`}>
                    {mission.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#1b1c1a] truncate">{mission.title}</h4>
                    
                    {/* Progress Track */}
                    <div className="w-full bg-[#f5f3ef] h-2 rounded-full overflow-hidden mt-1.5 flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          mission.completed ? 'bg-[#2d5a27]' : 'bg-[#fdbb24]'
                        }`}
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  {mission.completed ? (
                    <span className="material-symbols-outlined text-[#2D5A27] text-xl">check_circle</span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#72796e] bg-[#f5f3ef] px-2 py-1 rounded-md">
                      +{mission.expReward} EXP
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
