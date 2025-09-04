# Media Components

This directory contains components related to media search and selection functionality using The Movie Database (TMDB) API.

## Components

### MediaSearchField

A comprehensive search field component for finding movies and TV shows with the following features:

#### Features

- **Debounced Search**: 300ms delay with 3-character minimum to prevent excessive API calls
- **Loading States**: Visual feedback during search operations
- **Error Handling**: Graceful error display with retry functionality
- **Media Selection**: Click to select media items with clear functionality
- **Keyboard Navigation**: Full arrow key navigation and Enter/Escape support
- **Accessibility**: ARIA attributes and screen reader support
- **Mobile Responsive**: Touch-friendly interface for mobile devices
- **Visual Design**: Poster images, media type badges, and cinematic styling

#### Props

```typescript
interface MediaSearchFieldProps {
  onMediaSelect: (media: SelectedMedia | null) => void;
  selectedMedia?: SelectedMedia | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
```

#### Usage

```tsx
import { MediaSearchField } from "@/components/media";
import { SelectedMedia } from "@/utils/tmdb/service";

function MyComponent() {
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(
    null
  );

  return (
    <MediaSearchField
      onMediaSelect={setSelectedMedia}
      selectedMedia={selectedMedia}
      placeholder="Search for movies and TV shows..."
    />
  );
}
```

#### Integration with Forms

The component is designed to work seamlessly with form libraries:

```tsx
// With React Hook Form
const { setValue, watch } = useForm();
const selectedMedia = watch("media");

<MediaSearchField
  onMediaSelect={(media) => setValue("media", media)}
  selectedMedia={selectedMedia}
/>;
```

#### Keyboard Navigation

- **Arrow Down/Up**: Navigate through search results
- **Enter**: Select the focused result
- **Escape**: Close the dropdown and blur input
- **Tab**: Standard tab navigation

#### Accessibility Features

- ARIA attributes for screen readers
- Proper focus management
- Keyboard navigation support
- High contrast design
- Semantic HTML structure

#### Error States

The component handles various error scenarios:

- Network failures with retry functionality
- Rate limiting with user-friendly messages
- Empty search results with helpful messaging
- API errors with graceful degradation

#### Performance Optimizations

- Debounced search requests (300ms delay)
- Search result caching (5-minute TTL)
- Image lazy loading
- Result limiting (max 10 items)
- Efficient re-rendering with React.memo patterns

#### Styling

The component uses the design system tokens and follows the cinematic theme:

- Dark-first design with proper contrast
- Smooth animations and transitions
- Glassmorphism effects for dropdowns
- Consistent spacing and typography
- Mobile-responsive layout

#### Testing

Comprehensive test coverage includes:

- User interaction testing
- Keyboard navigation
- Error state handling
- Accessibility compliance
- Mobile responsiveness
- Performance characteristics

## Dependencies

- `@/hooks/useMediaSearch` - Media search logic and state management
- `@/utils/tmdb/service` - TMDB API integration
- `@/components/ui` - Base UI components (Input, Button)
- `lucide-react` - Icons for UI elements

## Related Files

- `src/hooks/useMediaSearch.ts` - Search hook implementation
- `src/components/media/MediaSearchField.stories.tsx` - Storybook documentation
- `src/components/media/__tests__/MediaSearchField.test.tsx` - Test suite

## Future Enhancements

- Trending content suggestions
- Genre filtering
- Advanced search options
- Watchlist integration
- Streaming availability display
