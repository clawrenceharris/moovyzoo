import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingState } from "../LoadingState";

describe("LoadingState", () => {
  it("renders with default props", () => {
    render(<LoadingState />);

    const loadingState = screen.getByTestId("loading-state");
    expect(loadingState).toBeInTheDocument();
    expect(loadingState).toHaveClass("loading-state", "loading-state-grid");

    // Should render 6 items by default
    const loadingCards = screen.getAllByTestId("loading-card");
    expect(loadingCards).toHaveLength(6);
  });

  it("renders grid variant correctly", () => {
    render(<LoadingState variant="grid" count={4} />);

    const loadingState = screen.getByTestId("loading-state");
    expect(loadingState).toHaveClass("loading-state-grid");

    const loadingCards = screen.getAllByTestId("loading-card");
    expect(loadingCards).toHaveLength(4);

    // Grid items should have habitat-card class
    loadingCards.forEach((card) => {
      expect(card).toHaveClass("habitat-card", "animate-pulse");
    });
  });

  it("renders list variant correctly", () => {
    render(<LoadingState variant="list" count={3} />);

    const loadingState = screen.getByTestId("loading-state");
    expect(loadingState).toHaveClass("loading-state-list");

    const loadingItems = screen.getAllByTestId("loading-item");
    expect(loadingItems).toHaveLength(3);

    // List items should have proper styling
    loadingItems.forEach((item) => {
      expect(item).toHaveClass("animate-pulse");
    });
  });

  it("renders inline variant correctly", () => {
    render(<LoadingState variant="inline" count={5} />);

    const loadingState = screen.getByTestId("loading-state");
    expect(loadingState).toHaveClass("loading-state-inline");

    const loadingItems = screen.getAllByTestId("loading-item");
    expect(loadingItems).toHaveLength(5);
  });

  it("renders card variant correctly", () => {
    render(<LoadingState variant="card" count={2} />);

    const loadingState = screen.getByTestId("loading-state");
    expect(loadingState).toHaveClass("loading-state-card");

    const loadingItems = screen.getAllByTestId("loading-item");
    expect(loadingItems).toHaveLength(2);
  });

  it("applies custom className", () => {
    render(<LoadingState className="custom-class" />);

    const loadingState = screen.getByTestId("loading-state");
    expect(loadingState).toHaveClass("custom-class");
  });

  it("handles different count values", () => {
    render(<LoadingState count={10} />);

    const loadingCards = screen.getAllByTestId("loading-card");
    expect(loadingCards).toHaveLength(10);
  });

  it("handles zero count", () => {
    render(<LoadingState count={0} />);

    const loadingState = screen.getByTestId("loading-state");
    expect(loadingState).toBeInTheDocument();

    // Should not render any items
    const loadingCards = screen.queryAllByTestId("loading-card");
    expect(loadingCards).toHaveLength(0);
  });

  it("renders correct structure for grid items", () => {
    render(<LoadingState variant="grid" count={1} />);

    const loadingCard = screen.getByTestId("loading-card");
    expect(loadingCard).toHaveClass("habitat-card");

    // Should have banner and content sections
    const banner = loadingCard.querySelector(".habitat-card-banner");
    const content = loadingCard.querySelector(".card-content");

    expect(banner).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it("renders correct structure for list items", () => {
    render(<LoadingState variant="list" count={1} />);

    const loadingItem = screen.getByTestId("loading-item");
    expect(loadingItem).toHaveClass("animate-pulse");
    expect(loadingItem).toHaveClass("p-4", "border", "rounded-lg");
  });

  it("renders correct structure for inline items", () => {
    render(<LoadingState variant="inline" count={1} />);

    const loadingItem = screen.getByTestId("loading-item");
    expect(loadingItem).toHaveClass("animate-pulse");
    expect(loadingItem).toHaveClass("w-32", "h-20", "rounded");
  });

  it("renders correct structure for card items", () => {
    render(<LoadingState variant="card" count={1} />);

    const loadingItem = screen.getByTestId("loading-item");
    expect(loadingItem).toHaveClass("animate-pulse");
    expect(loadingItem).toHaveClass("p-4", "border", "rounded-lg");
  });
});
