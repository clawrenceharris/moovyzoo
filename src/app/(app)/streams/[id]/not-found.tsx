import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Film, ArrowLeft } from "lucide-react";

export default function StreamingSessionNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md text-center">
        <div className="space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-muted/20 flex items-center justify-center">
            <Film className="w-10 h-10 text-muted-foreground" />
          </div>

          {/* Title and Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Streaming Session Not Found
            </h1>
            <p className="text-muted-foreground">
              This streaming session doesn't exist or may have been removed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/streams">Browse Streaming Sessions</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
