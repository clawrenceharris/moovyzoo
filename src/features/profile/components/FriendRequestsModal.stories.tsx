import type { Meta, StoryObj } from '@storybook/react';
import { FriendRequestsModal } from './FriendRequestsModal';
import { FriendRequest } from '../domain/profiles.types';

const mockRequests: FriendRequest[] = [
    {
        id: '1',
        requester: {
            id: 'user1',
            displayName: 'John Doe',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
        id: '2',
        requester: {
            id: 'user2',
            displayName: 'Jane Smith',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
        id: '3',
        requester: {
            id: 'user3',
            displayName: 'Alex Johnson',
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
];

const meta: Meta<typeof FriendRequestsModal> = {
    title: 'Features/Profile/FriendRequestsModal',
    component: FriendRequestsModal,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A modal component for displaying and managing friend requests. Shows pending requests with user information and accept/decline actions.',
            },
        },
    },
    argTypes: {
        isOpen: {
            control: 'boolean',
            description: 'Controls whether the modal is open or closed',
        },
        loading: {
            control: 'boolean',
            description: 'Shows loading state when fetching requests',
        },
        error: {
            control: 'text',
            description: 'Error message to display if request fails',
        },
        requests: {
            control: 'object',
            description: 'Array of friend requests to display',
        },
    },
    args: {
        onClose: () => {},
        onAccept: (requestId: string) => {},
        onDecline: (requestId: string) => {},
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        isOpen: true,
        requests: mockRequests,
        loading: false,
        error: null,
    },
};

export const Loading: Story = {
    args: {
        isOpen: true,
        requests: [],
        loading: true,
        error: null,
    },
};

export const Error: Story = {
    args: {
        isOpen: true,
        requests: [],
        loading: false,
        error: 'Failed to load friend requests. Please try again.',
    },
};

export const Empty: Story = {
    args: {
        isOpen: true,
        requests: [],
        loading: false,
        error: null,
    },
};

export const SingleRequest: Story = {
    args: {
        isOpen: true,
        requests: [mockRequests[0]],
        loading: false,
        error: null,
    },
};

export const ManyRequests: Story = {
    args: {
        isOpen: true,
        requests: [
            ...mockRequests,
            {
                id: '4',
                requester: {
                    id: 'user4',
                    displayName: 'Sarah Wilson',
                    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                },
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
            {
                id: '5',
                requester: {
                    id: 'user5',
                    displayName: 'Mike Brown',
                },
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
        ],
        loading: false,
        error: null,
    },
};

export const Closed: Story = {
    args: {
        isOpen: false,
        requests: mockRequests,
        loading: false,
        error: null,
    },
};