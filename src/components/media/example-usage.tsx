import React, { useState } from "react";
import { MediaSearchField } from "./MediaSearchField";
import { SelectedMedia } from "@/utils/tmdb/service";

/**
 * Example usage of MediaSearchField component
 * This demonstrates how to integrate the component into a form
 */
export function MediaSearchExample() {
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(
    null
  );

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Media Search Example</h2>

      <div>
        <label className="block text-sm font-medium mb-2">
          Search for Movies and TV Shows
        </label>
        <MediaSearchField
          onMediaSelect={setSelectedMedia}
          selectedMedia={selectedMedia}
          placeholder="Type to search..."
        />
      </div>

      {selectedMedia && (
        <div className="p-4 bg-card border rounded-lg">
          <h3 className="font-medium mb-2">Selected Media:</h3>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Title:</strong> {selectedMedia.title}
            </p>
            <p>
              <strong>Type:</strong> {selectedMedia.media_type}
            </p>
            <p>
              <strong>TMDB ID:</strong> {selectedMedia.tmdb_id}
            </p>
            {selectedMedia.release_date && (
              <p>
                <strong>Release Date:</strong> {selectedMedia.release_date}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example usage in a watch party creation form
 */
export function WatchPartyFormExample() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    selectedMedia: null as SelectedMedia | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Create Watch Party</h2>

      <div>
        <label className="block text-sm font-medium mb-2">Party Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter party title..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Select Movie or TV Show
        </label>
        <MediaSearchField
          onMediaSelect={(media) =>
            setFormData((prev) => ({ ...prev, selectedMedia: media }))
          }
          selectedMedia={formData.selectedMedia}
          placeholder="Search for content..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded-md h-20 resize-none"
          placeholder="Tell people what this party is about..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
        disabled={!formData.title || !formData.selectedMedia}
      >
        Create Watch Party
      </button>
    </form>
  );
}
