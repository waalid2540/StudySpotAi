interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'homework' | 'quiz' | 'user' | 'message' | 'course';
  url: string;
  icon: string;
  category: string;
}

interface SearchIndex {
  student: SearchResult[];
  parent: SearchResult[];
  teacher: SearchResult[];
  admin: SearchResult[];
  common: SearchResult[];
}

const searchIndex: SearchIndex = {
  // Common pages accessible by all roles
  common: [
    {
      id: 'profile',
      title: 'Profile',
      description: 'View and edit your profile information',
      type: 'page',
      url: '/profile',
      icon: 'User',
      category: 'Account',
    },
  ],

  // Student-specific pages and content
  student: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Your learning overview and quick actions',
      type: 'page',
      url: '/dashboard',
      icon: 'Home',
      category: 'Navigation',
    },
    {
      id: 'homework',
      title: 'Homework',
      description: 'View and submit your homework assignments',
      type: 'page',
      url: '/homework',
      icon: 'BookOpen',
      category: 'Learning',
    },
    {
      id: 'ai-chat',
      title: 'AI Tutor',
      description: 'Get help from your AI study assistant',
      type: 'page',
      url: '/ai-chat',
      icon: 'MessageSquare',
      category: 'Learning',
    },
    {
      id: 'quiz',
      title: 'Quizzes',
      description: 'Take quizzes and test your knowledge',
      type: 'page',
      url: '/quiz',
      icon: 'FileQuestion',
      category: 'Learning',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Track your learning progress and performance',
      type: 'page',
      url: '/analytics',
      icon: 'BarChart3',
      category: 'Progress',
    },
    {
      id: 'gamification',
      title: 'Achievements',
      description: 'View your badges, points, and rewards',
      type: 'page',
      url: '/gamification',
      icon: 'Trophy',
      category: 'Progress',
    },
  ],

  // Parent-specific pages
  parent: [
    {
      id: 'parent-dashboard',
      title: 'Parent Dashboard',
      description: 'Monitor your children\'s learning progress',
      type: 'page',
      url: '/parent-dashboard',
      icon: 'Home',
      category: 'Navigation',
    },
    {
      id: 'parent-children',
      title: 'My Children',
      description: 'Manage your children\'s accounts',
      type: 'page',
      url: '/parent/children',
      icon: 'Users',
      category: 'Family',
    },
    {
      id: 'parent-messages',
      title: 'Messages',
      description: 'Communicate with teachers',
      type: 'page',
      url: '/parent/messages',
      icon: 'MessageSquare',
      category: 'Communication',
    },
    {
      id: 'parent-reports',
      title: 'Progress Reports',
      description: 'View detailed analytics and reports',
      type: 'page',
      url: '/parent/reports',
      icon: 'FileText',
      category: 'Progress',
    },
    {
      id: 'parent-billing',
      title: 'Billing',
      description: 'Manage subscription and payments',
      type: 'page',
      url: '/parent/billing',
      icon: 'CreditCard',
      category: 'Account',
    },
    {
      id: 'parent-settings',
      title: 'Parent Settings',
      description: 'Configure parental controls and preferences',
      type: 'page',
      url: '/parent/settings',
      icon: 'Settings',
      category: 'Account',
    },
  ],

  // Teacher-specific pages
  teacher: [
    {
      id: 'teacher-dashboard',
      title: 'Teacher Dashboard',
      description: 'Manage your classes and students',
      type: 'page',
      url: '/dashboard',
      icon: 'Home',
      category: 'Navigation',
    },
  ],

  // Admin-specific pages
  admin: [
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard',
      description: 'System overview and real-time monitoring',
      type: 'page',
      url: '/admin-dashboard',
      icon: 'Shield',
      category: 'Navigation',
    },
    {
      id: 'admin-users',
      title: 'User Management',
      description: 'Manage all users and permissions',
      type: 'page',
      url: '/admin/users',
      icon: 'Users',
      category: 'Administration',
    },
    {
      id: 'admin-homework',
      title: 'All Homework',
      description: 'View and grade all homework submissions',
      type: 'page',
      url: '/admin/homework',
      icon: 'BookOpen',
      category: 'Administration',
    },
    {
      id: 'admin-analytics',
      title: 'System Analytics',
      description: 'Platform-wide analytics and insights',
      type: 'page',
      url: '/admin/analytics',
      icon: 'BarChart3',
      category: 'Analytics',
    },
    {
      id: 'admin-settings',
      title: 'System Settings',
      description: 'Configure platform settings',
      type: 'page',
      url: '/admin/settings',
      icon: 'Settings',
      category: 'Administration',
    },
  ],
};

// Quick actions/shortcuts
const quickActions = [
  {
    id: 'new-homework',
    title: 'Submit Homework',
    description: 'Upload a new homework assignment',
    type: 'page' as const,
    url: '/homework',
    icon: 'Plus',
    category: 'Quick Action',
  },
  {
    id: 'start-quiz',
    title: 'Start Quiz',
    description: 'Begin a new quiz session',
    type: 'page' as const,
    url: '/quiz',
    icon: 'Play',
    category: 'Quick Action',
  },
  {
    id: 'ask-ai',
    title: 'Ask AI Tutor',
    description: 'Get instant help from AI',
    type: 'page' as const,
    url: '/ai-chat',
    icon: 'Sparkles',
    category: 'Quick Action',
  },
];

class SearchService {
  private getSearchableContent(userRole?: string): SearchResult[] {
    const role = userRole?.toLowerCase() || 'student';
    const roleContent = searchIndex[role as keyof SearchIndex] || [];

    return [
      ...searchIndex.common,
      ...roleContent,
      ...quickActions,
    ];
  }

  search(query: string, userRole?: string): SearchResult[] {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchableContent = this.getSearchableContent(userRole);
    const normalizedQuery = query.toLowerCase().trim();

    // Simple fuzzy search implementation
    const results = searchableContent.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(normalizedQuery);
      const descriptionMatch = item.description.toLowerCase().includes(normalizedQuery);
      const categoryMatch = item.category.toLowerCase().includes(normalizedQuery);
      const typeMatch = item.type.toLowerCase().includes(normalizedQuery);

      return titleMatch || descriptionMatch || categoryMatch || typeMatch;
    });

    // Sort results by relevance
    return results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      // Exact match in title gets highest priority
      if (aTitle === normalizedQuery) return -1;
      if (bTitle === normalizedQuery) return 1;

      // Title starts with query gets next priority
      if (aTitle.startsWith(normalizedQuery)) return -1;
      if (bTitle.startsWith(normalizedQuery)) return 1;

      // Otherwise maintain current order
      return 0;
    });
  }

  getRecentSearches(): string[] {
    const stored = localStorage.getItem('recentSearches');
    return stored ? JSON.parse(stored) : [];
  }

  addToRecentSearches(query: string): void {
    if (!query || query.trim().length < 2) return;

    const recent = this.getRecentSearches();
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }

  clearRecentSearches(): void {
    localStorage.removeItem('recentSearches');
  }

  getPopularSearches(): string[] {
    return [
      'homework',
      'quiz',
      'analytics',
      'ai tutor',
      'profile',
      'messages',
    ];
  }
}

export const searchService = new SearchService();
export type { SearchResult };
