"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  usePublicStreams,
  useUserStreams,
} from "@/features/streaming/hooks/use-stream-queries";
import { StreamCard } from "@/components/cards/StreamCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  StatusFilter,
  type StreamStatus,
} from "@/features/streaming/components/StatusFilter";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

const ITEMS_PER_PAGE = 12;

export default function StreamsPage() {
  const router = useRouter();
  const { user } = useUser();

  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StreamStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Calculate pagination offset
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Prepare query options
  const queryOptions = useMemo(
    () => ({
      limit: ITEMS_PER_PAGE,
      offset,
      search: debouncedSearch || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [offset, debouncedSearch, statusFilter]
  );

  // Fetch all public streams
  const {
    data: streamsData,
    isLoading,
    error,
    refetch,
  } = usePublicStreams(user.id, queryOptions);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const streams = streamsData?.streams || [];
  const totalStreams = streamsData?.total || 0;
  const totalPages = Math.ceil(totalStreams / ITEMS_PER_PAGE);

  const handleStreamNavigation = (streamId: string) => {
    router.push(`/streams/${streamId}`);
  };

  const handleCreateStream = () => {
    // Navigate to stream creation - this would typically be in a habitat context
    router.push("/habitats");
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const handleStatusFilterChange = (status: StreamStatus) => {
    setStatusFilter(status);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFiltered = useMemo(() => searchQuery || statusFilter !== "all", []);

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Streaming Sessions</h1>
        </div>

        <ErrorState
          title="Failed to load streaming sessions"
          message="We couldn't load the streaming sessions. Please check your connection and try again."
          onRetry={refetch}
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Streaming Sessions</h1>
          <p className="text-muted-foreground mt-1">
            {totalStreams} {totalStreams === 1 ? "session" : "sessions"}{" "}
            available
          </p>
        </div>
        <Button onClick={handleCreateStream} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Stream
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search streaming sessions..."
            onClear={handleSearchClear}
          />
        </div>
        <StatusFilter
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />
      </div>

      {/* Streams Grid */}
      {isLoading ? (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Streaming Sessions</h1>
          </div>

          {/* Filters skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="h-10 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-20 bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          <LoadingState variant="grid" count={12} />
        </div>
      ) : streams.length === 0 && !isLoading ? (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Streaming Sessions</h1>
            <Button onClick={handleCreateStream} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Stream
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search streaming sessions..."
                onClear={handleSearchClear}
              />
            </div>
            <StatusFilter
              value={statusFilter}
              onChange={handleStatusFilterChange}
            />
          </div>

          <EmptyState
            title={
              isFiltered
                ? "No streaming sessions found"
                : "No streaming sessions yet"
            }
            description={
              isFiltered
                ? "Try adjusting your search or filters to find streaming sessions."
                : "Be the first to create a streaming session and watch together with friends."
            }
            actionLabel={isFiltered ? "Clear filters" : "Create Stream"}
            onAction={
              isFiltered
                ? () => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }
                : handleCreateStream
            }
            variant="default"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {streams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              navigationContext="streams"
              onJoinClick={() => {
                // Handle join action - this would typically use mutation hooks
                console.log("Join stream:", stream.id);
              }}
              onLeaveClick={() => {
                // Handle leave action
                console.log("Leave stream:", stream.id);
              }}
              onWatchClick={() => handleStreamNavigation(stream.id)}
              showDescription={true}
              showMediaInfo={true}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-8"
        />
      )}
    </div>
  );
}
