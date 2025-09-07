import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ParticipantActivity } from "../ParticipantActivity";

describe("ParticipantActivity", () => {
  it("should show recent joins", () => {
    render(
      <ParticipantActivity recentJoins={["user1", "user2"]} recentLeaves={[]} />
    );

    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
    expect(screen.getAllByText("joined")).toHaveLength(2);
  });

  it("should show recent leaves", () => {
    render(
      <ParticipantActivity recentJoins={[]} recentLeaves={["user3", "user4"]} />
    );

    expect(screen.getByText("user3")).toBeInTheDocument();
    expect(screen.getByText("user4")).toBeInTheDocument();
    expect(screen.getAllByText("left")).toHaveLength(2);
  });

  it("should show both joins and leaves", () => {
    render(
      <ParticipantActivity recentJoins={["user1"]} recentLeaves={["user2"]} />
    );

    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
    expect(screen.getByText("joined")).toBeInTheDocument();
    expect(screen.getByText("left")).toBeInTheDocument();
  });

  it("should not render when no activity", () => {
    const { container } = render(
      <ParticipantActivity recentJoins={[]} recentLeaves={[]} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should limit the number of activities shown", () => {
    const manyJoins = Array.from({ length: 10 }, (_, i) => `user${i}`);

    render(
      <ParticipantActivity
        recentJoins={manyJoins}
        recentLeaves={[]}
        maxItems={3}
      />
    );

    // Should only show the first 3 items
    expect(screen.getByText("user0")).toBeInTheDocument();
    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
    expect(screen.queryByText("user3")).not.toBeInTheDocument();
  });

  it("should show participant count when provided", () => {
    render(
      <ParticipantActivity
        recentJoins={["user1"]}
        recentLeaves={[]}
        participantCount={5}
      />
    );

    expect(screen.getByText("5 watching")).toBeInTheDocument();
  });
});
