import React from "react";
import { Button } from "../../../components/ui/button";
import { cn } from "@/lib/utils";

export type StreamStatus = "all" | "upcoming" | "live" | "ended";

export interface StatusFilterProps {
  value: StreamStatus;
  onChange: (status: StreamStatus) => void;
  className?: string;
}

const statusOptions = [
  { value: "all" as const, label: "All" },
  { value: "upcoming" as const, label: "Upcoming" },
  { value: "live" as const, label: "Live" },
  { value: "ended" as const, label: "Ended" },
];

export function StatusFilter({
  value,
  onChange,
  className,
}: StatusFilterProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
          className="text-sm"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
