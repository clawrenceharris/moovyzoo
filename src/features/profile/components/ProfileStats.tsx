"use client";

import { Trophy, Target, Users } from "lucide-react";

interface ProfileStatsProps {
  badgesEarned: number;
  bingeRacesWon: number;
  habitatsJoined: number;
}

export function ProfileStats({ badgesEarned, bingeRacesWon, habitatsJoined }: ProfileStatsProps) {
  const stats = [
    {
      icon: Trophy,
      label: "Badges Earned",
      value: badgesEarned,
      color: "bg-primary",
    },
    {
      icon: Target,
      label: "Binge Races Won", 
      value: bingeRacesWon,
      color: "bg-accent",
    },
    {
      icon: Users,
      label: "Habitats Joined",
      value: habitatsJoined,
      color: "bg-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card border border-border/50 rounded-xl p-6 text-center hover:scale-[1.02] transition-transform duration-200"
          >
            <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}