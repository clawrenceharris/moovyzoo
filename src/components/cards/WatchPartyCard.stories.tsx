import type { Meta, StoryObj } from "@storybook/react";
import { WatchPartyCard } from "./WatchPartyCard";
import type { WatchPartyWithParticipants } from "@/features/habitats/domain/habitats.types";

const meta: Meta<typeof WatchPartyCard> = {
  title: "Components/Cards/WatchPartyCard",
  component: WatchPartyCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "WatchPartyCard displays watch party information with status, scheduling, and optional media content including poster images and metadata.",
      },
    },
  },
  argTypes: {
    onClick: { action: "clicked" },
    showDescription: {
      control: "boolean",
      description: "Whether to show the watch party description",
    },
    showMediaInfo: {
      control: "boolean",
      description: "Whether to show media information (poster, title, etc.)",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WatchPartyCard>;

// Base watch party data
const baseWatchParty: WatchPartyWithParticipants = {
  id: "1",
  habitat_id: "habitat-1",
  title: "Friday Night Movie Marathon",
  description:
    "Join us for an epic movie night with popcorn and great company!",
  scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
  participant_count: 8,
  max_participants: 15,
  created_by: "user-1",
  created_at: new Date().toISOString(),
  is_active: true,
  participants: [],
  is_participant: false,
};

// Watch party with movie media
const movieWatchParty: WatchPartyWithParticipants = {
  ...baseWatchParty,
  title: "Inception Watch Party",
  description:
    "Mind-bending sci-fi thriller that will leave you questioning reality.",
  tmdb_id: 27205,
  media_type: "movie",
  media_title: "Inception",
  poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  release_date: "2010-07-16",
  runtime: 148,
};

// Watch party with TV show media
const tvWatchParty: WatchPartyWithParticipants = {
  ...baseWatchParty,
  title: "Breaking Bad Season Finale",
  description:
    "The epic conclusion to one of the greatest TV series ever made.",
  tmdb_id: 1396,
  media_type: "tv",
  media_title: "Breaking Bad",
  poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  release_date: "2008-01-20",
  runtime: 47,
};

// Live watch party
const liveWatchParty: WatchPartyWithParticipants = {
  ...movieWatchParty,
  title: "LIVE: The Dark Knight",
  scheduled_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago (live)
  participant_count: 12,
  is_participant: true,
};

// Ended watch party
const endedWatchParty: WatchPartyWithParticipants = {
  ...tvWatchParty,
  title: "Stranger Things Rewatch",
  scheduled_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  participant_count: 6,
  is_participant: false,
};

// Watch party without media
const noMediaWatchParty: WatchPartyWithParticipants = {
  ...baseWatchParty,
  title: "Community Movie Night",
  description:
    "Bring your favorite movie suggestions and we'll vote on what to watch!",
};

// Watch party with missing poster
const missingPosterWatchParty: WatchPartyWithParticipants = {
  ...baseWatchParty,
  title: "Indie Film Festival",
  description: "Discover hidden gems in independent cinema.",
  tmdb_id: 12345,
  media_type: "movie",
  media_title: "Unknown Indie Film",
  poster_path: undefined,
  release_date: "2023-01-01",
  runtime: 95,
};

export const Default: Story = {
  args: {
    watchParty: baseWatchParty,
    showDescription: true,
    showMediaInfo: true,
  },
};

export const WithMovieMedia: Story = {
  args: {
    watchParty: movieWatchParty,
    showDescription: true,
    showMediaInfo: true,
  },
};

export const WithTVShowMedia: Story = {
  args: {
    watchParty: tvWatchParty,
    showDescription: true,
    showMediaInfo: true,
  },
};

export const LiveStatus: Story = {
  args: {
    watchParty: liveWatchParty,
    showDescription: true,
    showMediaInfo: true,
  },
};

export const EndedStatus: Story = {
  args: {
    watchParty: endedWatchParty,
    showDescription: true,
    showMediaInfo: true,
  },
};

export const NoMedia: Story = {
  args: {
    watchParty: noMediaWatchParty,
    showDescription: true,
    showMediaInfo: true,
  },
};

export const MissingPoster: Story = {
  args: {
    watchParty: missingPosterWatchParty,
    showDescription: true,
    showMediaInfo: true,
  },
};

export const WithoutDescription: Story = {
  args: {
    watchParty: movieWatchParty,
    showDescription: false,
    showMediaInfo: true,
  },
};

export const WithoutMediaInfo: Story = {
  args: {
    watchParty: movieWatchParty,
    showDescription: true,
    showMediaInfo: false,
  },
};

export const Minimal: Story = {
  args: {
    watchParty: movieWatchParty,
    showDescription: false,
    showMediaInfo: false,
  },
};

// Mobile responsive demonstration
export const MobileView: Story = {
  args: {
    watchParty: movieWatchParty,
    showDescription: true,
    showMediaInfo: true,
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4">
        <Story />
      </div>
    ),
  ],
};

// Grid layout demonstration
export const GridLayout: Story = {
  args: {
    watchParty: movieWatchParty,
    showDescription: true,
    showMediaInfo: true,
  },
  decorators: [
    (Story) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-6xl">
        <Story />
        <WatchPartyCard
          watchParty={tvWatchParty}
          onClick={() => {}}
          showDescription={true}
          showMediaInfo={true}
        />
        <WatchPartyCard
          watchParty={liveWatchParty}
          onClick={() => {}}
          showDescription={true}
          showMediaInfo={true}
        />
        <WatchPartyCard
          watchParty={endedWatchParty}
          onClick={() => {}}
          showDescription={true}
          showMediaInfo={true}
        />
        <WatchPartyCard
          watchParty={noMediaWatchParty}
          onClick={() => {}}
          showDescription={true}
          showMediaInfo={true}
        />
        <WatchPartyCard
          watchParty={missingPosterWatchParty}
          onClick={() => {}}
          showDescription={true}
          showMediaInfo={true}
        />
      </div>
    ),
  ],
};
