"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { HabitatWithMembership } from "../domain/habitats.types";

interface HabitatHeroProps {
  habitat: HabitatWithMembership;
  onStartStreamingParty?: () => void;
  onCreatePoll?: () => void;
  className?: string;
}

export function HabitatHero({
  habitat,
  onStartStreamingParty,
  onCreatePoll,
  className = "",
}: HabitatHeroProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Cinematic Background with Three Panels */}
      <div className="relative h-[500px] bg-gradient-to-b from-black/20 via-black/60 to-black/90">
        {/* Background Image Panels */}
        <div className="absolute inset-0 flex">
          {/* Left Panel */}
          <div className="flex-1 relative overflow-hidden">
            {habitat.banner_url && (
              <Image
                src={habitat.banner_url}
                alt={`${habitat.name} banner`}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 items-center inset-0 z-30 flex flex-col  text-center">
          {/* Habitat Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {habitat.name}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl leading-relaxed">
            {habitat.description ||
              "Welcome to the ultimate hub for sci-fi fans! Join discussions on Dune, Star Trek, and futuristic theories. Remember: spoilers must be flagged!"}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" onClick={onStartStreamingParty}>
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Streaming Party
            </Button>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20" />
      </div>
    </div>
  );
}
