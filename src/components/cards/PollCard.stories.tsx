import type { Meta, StoryObj } from "@storybook/react";
import { PollCard } from "./PollCard";
import type { PollWithVotes } from "@/features/habitats/domain/habitats.types";

// Mock poll data
const mockPoll: PollWithVotes = {
  id: "1",
  habitat_id: "habitat-1",
  title: "Which Marvel movie should we watch next?",
  description: "Vote for the next movie in our Marvel marathon!",
  options: [
    { id: "1", text: "Iron Man", votes: 15 },
    { id: "2", text: "Thor", votes: 12 },
    { id: "3", text: "Captain America", votes: 8 },
  ],
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-20T15:30:00Z",
  created_by: "user-1",
  expires_at: "2024-01-25T23:59:59Z",
  total_votes: 35,
  user_vote: null,
};

const mockPollVoted: PollWithVotes = {
  ...mockPoll,
  id: "2",
  title: "Rate the latest episode",
  total_votes: 127,
  user_vote: {
    id: "vote-1",
    poll_id: "2",
    user_id: "user-1",
    option_id: "1",
    created_at: "2024-01-20T12:00:00Z",
  },
};

const mockPollHighVotes: PollWithVotes = {
  ...mockPoll,
  id: "3",
  title: "Best sci-fi movie of all time?",
  total_votes: 2847,
  user_vote: null,
};

const mockPollLowVotes: PollWithVotes = {
  ...mockPoll,
  id: "4",
  title: "Should we start a book club?",
  total_votes: 3,
  user_vote: null,
};

const mockPollNoVotes: PollWithVotes = {
  ...mockPoll,
  id: "5",
  title: "New poll - be the first to vote!",
  total_votes: 0,
  user_vote: null,
};

const meta: Meta<typeof PollCard> = {
  title: "Components/Cards/PollCard",
  component: PollCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "PollCard displays poll information with voting status and results, encouraging user participation.",
      },
    },
  },
  argTypes: {
    poll: {
      description: "The poll data to display",
    },
    onClick: {
      description: "Callback when the card is clicked",
      action: "clicked",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PollCard>;

/**
 * Default poll card with vote count
 */
export const Default: Story = {
  args: {
    poll: mockPoll,
    onClick: () => console.log("Poll clicked"),
  },
};

/**
 * Poll card where user has already voted
 */
export const UserVoted: Story = {
  args: {
    poll: mockPollVoted,
    onClick: () => console.log("Poll clicked"),
  },
};

/**
 * Poll card with high vote count
 */
export const HighVotes: Story = {
  args: {
    poll: mockPollHighVotes,
    onClick: () => console.log("Poll clicked"),
  },
};

/**
 * Poll card with low vote count
 */
export const LowVotes: Story = {
  args: {
    poll: mockPollLowVotes,
    onClick: () => console.log("Poll clicked"),
  },
};

/**
 * Poll card with no votes yet
 */
export const NoVotes: Story = {
  args: {
    poll: mockPollNoVotes,
    onClick: () => console.log("Poll clicked"),
  },
};

/**
 * Poll card with single vote
 */
export const SingleVote: Story = {
  args: {
    poll: {
      ...mockPoll,
      title: "Quick yes/no question",
      total_votes: 1,
    },
    onClick: () => console.log("Poll clicked"),
  },
};

/**
 * Poll card with long title
 */
export const LongTitle: Story = {
  args: {
    poll: {
      ...mockPoll,
      title:
        "What do you think about the complex character development and narrative structure in the latest season?",
      total_votes: 89,
    },
    onClick: () => console.log("Poll clicked"),
  },
};

/**
 * Poll card with custom styling
 */
export const CustomStyling: Story = {
  args: {
    poll: mockPoll,
    className: "border-primary bg-primary/5",
    onClick: () => console.log("Poll clicked"),
  },
};
