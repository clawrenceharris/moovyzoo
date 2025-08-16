# Component Library – Surfboard

## Component Architecture

### Design Principles

- **Composable**: Components should be easily combined and extended
- **Consistent**: Follow the design system tokens and patterns
- **Accessible**: WCAG AA compliant by default
- **Responsive**: Mobile-first approach with thoughtful breakpoints
- **Performant**: Optimized for speed and bundle size

### Component Structure

```
src/components/
├── ui/                 # Base UI components
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   └── ...
├── layout/            # Layout components
│   ├── Container/
│   ├── Grid/
│   └── ...
└── feedback/          # Feedback components
    ├── Toast/
    ├── Modal/
    └── ...
```

## Base UI Components

### Button Component

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

// Usage Examples
<Button variant="primary">Primary Action</Button>
<Button variant="outline" size="sm">Secondary Action</Button>
<Button variant="ghost" leftIcon={<PlusIcon />}>Add Item</Button>
<Button loading>Loading...</Button>
```

### Card Component

```tsx
interface CardProps {
  variant?: 'default' | 'interactive' | 'flat' | 'elevated'
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

// Usage Examples
<Card>Basic card content</Card>
<Card variant="interactive" onClick={handleClick}>Clickable card</Card>
<Card variant="elevated" padding="lg">Elevated card with large padding</Card>
```

### Input Component

```tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'url'
  label?: string
  placeholder?: string
  error?: string
  help?: string
  required?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  value?: string
  onChange?: (value: string) => void
  className?: string
}

// Usage Examples
<Input label="Email" type="email" placeholder="Enter your email" />
<Input label="Password" type="password" error="Password is required" />
<Input leftIcon={<SearchIcon />} placeholder="Search..." />
```

### Typography Components

```tsx
// Heading Components
<Heading level={1}>Main Page Title</Heading>
<Heading level={2} className="text-center">Section Title</Heading>

// Text Components
<Text variant="body-lg">Large body text</Text>
<Text variant="body-sm" color="secondary">Small secondary text</Text>
<Text variant="label-md" weight="medium">Form label</Text>

// Display Components
<Display size="lg">Hero Title</Display>
<Display size="md" color="accent">Featured Content</Display>
```

## Layout Components

### Container Component

```tsx
interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: boolean
  children: React.ReactNode
  className?: string
}

// Usage Examples
<Container size="lg">Main content area</Container>
<Container size="sm" padding={false}>Narrow content without padding</Container>
```

### Grid Component

```tsx
interface GridProps {
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg'
  responsive?: {
    sm?: number
    md?: number
    lg?: number
  }
  children: React.ReactNode
  className?: string
}

// Usage Examples
<Grid cols={3} gap="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>

<Grid responsive={{ sm: 1, md: 2, lg: 3 }}>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</Grid>
```

### Stack Component

```tsx
interface StackProps {
  direction?: 'horizontal' | 'vertical'
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  children: React.ReactNode
  className?: string
}

// Usage Examples
<Stack direction="vertical" spacing="md">
  <Heading level={2}>Title</Heading>
  <Text>Description text</Text>
  <Button>Action</Button>
</Stack>

<Stack direction="horizontal" justify="between" align="center">
  <Heading level={3}>Section Title</Heading>
  <Button variant="outline">View All</Button>
</Stack>
```

## Feedback Components

### Toast Component

```tsx
interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  onClose?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

// Usage Examples
<Toast type="success" message="Profile updated successfully!" />
<Toast
  type="error"
  title="Upload Failed"
  message="Please try again or contact support."
  action={{ label: "Retry", onClick: handleRetry }}
/>
```

### Modal Component

```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  footer?: React.ReactNode
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

// Usage Examples
<Modal isOpen={isOpen} onClose={handleClose} title="Confirm Action">
  <Text>Are you sure you want to delete this item?</Text>
</Modal>

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  size="lg"
  footer={
    <Stack direction="horizontal" spacing="sm" justify="end">
      <Button variant="outline" onClick={handleClose}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </Stack>
  }
>
  <Text>Modal content goes here</Text>
</Modal>
```

### Loading Components

```tsx
// Spinner Component
<Spinner size="sm" />
<Spinner size="lg" color="primary" />

// Skeleton Components
<Skeleton height="h-4" width="w-full" />
<Skeleton height="h-6" width="w-3/4" />
<SkeletonAvatar size="lg" />
<SkeletonCard />

// Loading States
<LoadingButton loading={isLoading} onClick={handleSubmit}>
  Submit Form
</LoadingButton>
```

## Form Components

### Form Component

```tsx
interface FormProps {
  onSubmit: (data: any) => void
  children: React.ReactNode
  className?: string
}

// Usage with form validation
;<Form onSubmit={handleSubmit}>
  <Stack spacing="md">
    <Input label="Email" type="email" required error={errors.email} />
    <Input label="Password" type="password" required error={errors.password} />
    <Button type="submit" loading={isSubmitting}>
      Sign In
    </Button>
  </Stack>
</Form>
```

### Select Component

```tsx
interface SelectProps {
  label?: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
  value?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  searchable?: boolean
  multiple?: boolean
}

// Usage Examples
<Select
  label="Genre"
  placeholder="Select a genre"
  options={genreOptions}
  value={selectedGenre}
  onChange={setSelectedGenre}
/>

<Select
  label="Favorite Movies"
  multiple
  searchable
  options={movieOptions}
  value={selectedMovies}
  onChange={setSelectedMovies}
/>
```

### Checkbox & Radio Components

```tsx
// Checkbox
<Checkbox
  label="I agree to the terms and conditions"
  checked={agreed}
  onChange={setAgreed}
  required
/>

// Radio Group
<RadioGroup
  label="Account Type"
  value={accountType}
  onChange={setAccountType}
  options={[
    { value: 'viewer', label: 'Viewer' },
    { value: 'host', label: 'Host' },
    { value: 'analyst', label: 'Analyst' }
  ]}
/>
```

## Navigation Components

### Breadcrumb Component

```tsx
interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  separator?: React.ReactNode
}

// Usage Example
;<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Movies', href: '/movies' },
    { label: 'Action', current: true },
  ]}
/>
```

### Tabs Component

```tsx
interface TabsProps {
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  children: React.ReactNode
}

// Usage Example
;<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
    <TabsTrigger value="cast">Cast</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <Text>Movie overview content</Text>
  </TabsContent>
  <TabsContent value="reviews">
    <Text>Movie reviews content</Text>
  </TabsContent>
</Tabs>
```

## Data Display Components

### Avatar Component

```tsx
interface AvatarProps {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  status?: 'online' | 'offline' | 'away'
  className?: string
}

// Usage Examples
<Avatar src="/user-avatar.jpg" alt="John Doe" size="lg" />
<Avatar fallback="JD" status="online" />
<Avatar size="xs" fallback="A" />
```

### Badge Component

```tsx
interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

// Usage Examples
<Badge variant="primary">New</Badge>
<Badge variant="success" size="sm">Verified</Badge>
<Badge variant="warning">Pending</Badge>
```

### Table Component

```tsx
interface TableProps {
  columns: Array<{
    key: string
    label: string
    sortable?: boolean
    width?: string
  }>
  data: Array<Record<string, any>>
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  loading?: boolean
  emptyMessage?: string
}

// Usage Example
;<Table
  columns={[
    { key: 'title', label: 'Movie Title', sortable: true },
    { key: 'year', label: 'Year', sortable: true, width: '100px' },
    { key: 'rating', label: 'Rating', sortable: true, width: '80px' },
  ]}
  data={movies}
  onSort={handleSort}
  loading={isLoading}
  emptyMessage="No movies found"
/>
```

## Media Components

### Image Component

```tsx
interface ImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2'
  objectFit?: 'cover' | 'contain' | 'fill'
  placeholder?: string
  loading?: 'lazy' | 'eager'
  className?: string
}

// Usage Examples
<Image
  src="/movie-poster.jpg"
  alt="Movie Poster"
  aspectRatio="3:2"
  objectFit="cover"
/>
<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={1200}
  height={600}
  loading="eager"
/>
```

### Video Component

```tsx
interface VideoProps {
  src: string
  poster?: string
  controls?: boolean
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  aspectRatio?: '16:9' | '4:3' | '1:1'
  className?: string
}

// Usage Example
;<Video
  src="/movie-trailer.mp4"
  poster="/movie-poster.jpg"
  controls
  aspectRatio="16:9"
/>
```

## Implementation Guidelines

### Component File Structure

```
Button/
├── Button.tsx          # Main component
├── Button.test.tsx     # Unit tests
├── Button.stories.tsx  # Storybook stories
├── Button.module.css   # Component-specific styles (if needed)
└── index.ts           # Export file
```

### Component Template

```tsx
import React from 'react'
import { cn } from '@/styles/styles'

interface ComponentProps {
  children: React.ReactNode
  className?: string
  // ... other props
}

export const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'base-component-styles',
          // Conditional styles
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Component.displayName = 'Component'

export default Component
```

### Testing Requirements

- **Unit tests**: Test component behavior and props
- **Accessibility tests**: Ensure WCAG compliance
- **Visual regression tests**: Catch unintended style changes
- **Integration tests**: Test component interactions

### Storybook Stories

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex space-x-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
}
```

## Quality Checklist

Before shipping any component:

- [ ] Follows design system tokens and patterns
- [ ] Accepts `className` prop for customization
- [ ] Has proper TypeScript interfaces
- [ ] Includes comprehensive unit tests
- [ ] Has Storybook stories with all variants
- [ ] Meets WCAG AA accessibility standards
- [ ] Works in both light and dark modes
- [ ] Responsive across all breakpoints
- [ ] Handles loading and error states appropriately
- [ ] Uses semantic HTML elements
- [ ] Includes proper ARIA attributes
- [ ] Supports keyboard navigation
- [ ] Has focus management for interactive elements
