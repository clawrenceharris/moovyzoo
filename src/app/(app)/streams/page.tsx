"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { usePublicStreams } from "@/features/streaming/hooks/use-stream-queries";
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
import useModal from "@/hooks/use-modal";
import { StreamCreationForm } from "@/features/habitats/components";

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
    refetch: refetchStreams,
  } = usePublicStreams(user.id, queryOptions);
  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const streams = streamsData?.streams || [];
  const totalStreams = streamsData?.total || 0;
  const totalPages = Math.ceil(totalStreams / ITEMS_PER_PAGE);

  const {
    closeModal: closeStreamCreationModal,
    openModal: openStreamCreationModal,
    modal: streamCreationModal,
  } = useModal({
    title: "Create Stream",
    children: (
      <StreamCreationForm
        isLoading={isLoading}
        onSuccess={() => {
          closeStreamCreationModal();
          refetchStreams();
        }}
        onCancel={() => closeStreamCreationModal}
        userId={user.id}
      />
    ),
  });
  const handleStreamNavigation = (streamId: string) => {
    router.push(`/streams/${streamId}`);
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
          <h1 className="text-3xl font-bold">Streams</h1>
        </div>

        <ErrorState
          title="Failed to load Streams"
          message="We couldn't load the Streams. Please check your connection and try again."
          onRetry={refetchStreams}
          variant="card"
        />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {streamCreationModal}
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Streams</h1>
          <p className="text-muted-foreground mt-1">
            {totalStreams} {totalStreams === 1 ? "session" : "sessions"}{" "}
            available
          </p>
        </div>
        <Button onClick={openStreamCreationModal} className="gap-2">
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
            placeholder="Search Streams..."
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
            <h1 className="text-3xl font-bold">Streams</h1>
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
          <EmptyState
            title={isFiltered ? "No Streams found" : "No Streams yet"}
            description={
              isFiltered
                ? "Try adjusting your search or filters to find Streams."
                : "Be the first to create a Stream and watch together with friends."
            }
            actionLabel={isFiltered ? "Clear filters" : "Create Stream"}
            onAction={
              isFiltered
                ? () => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }
                : openStreamCreationModal
            }
            variant="default"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {streams.map((stream) => (
            <StreamCard
              key={stream.id}
              onJoinClick={refetchStreams}
              onLeaveClick={refetchStreams}
              stream={stream}
              onWatchClick={() => handleStreamNavigation(stream.id)}
              userId={user.id}
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
