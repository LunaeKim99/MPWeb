import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TrackList from "@/presentation/components/library/TrackList.tsx";
import type { TrackListItemViewModel } from "@/presentation/view-models/TrackListItemViewModel.ts";

const makeItem = (
  partial: Partial<TrackListItemViewModel> = {},
): TrackListItemViewModel => ({
  id: "id",
  title: "Track",
  artistLabel: "Artist",
  albumLabel: "Album",
  durationLabel: "1:23",
  isFavorite: false,
  isActive: false,
  isUnavailable: false,
  accessibilityLabel: "Track by Artist",
  ...partial,
});

describe("TrackList", () => {
  it("renders track rows with accessible list label", () => {
    const { getAllByRole } = render(
      <TrackList
        items={[
          makeItem({ id: "a", title: "A" }),
          makeItem({ id: "b", title: "B" }),
        ]}
        onPlay={() => {}}
        onAddToQueue={() => {}}
      />,
    );
    expect(screen.getByLabelText("Track list")).toBeInTheDocument();
    expect(getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByText("A").length).toBeGreaterThan(0);
  });

  it("exposes favorite toggle aria-label", () => {
    const onToggleFavorite = vi.fn();
    render(
      <TrackList
        items={[makeItem({ id: "x", isFavorite: true })]}
        onPlay={() => {}}
        onAddToQueue={() => {}}
        onToggleFavorite={onToggleFavorite}
      />,
    );
    expect(screen.getByLabelText("Remove favorite")).toBeInTheDocument();
  });
});
