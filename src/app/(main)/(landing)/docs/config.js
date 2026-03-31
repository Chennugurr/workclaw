export const docsNav = [
  {
    group: 'Overview',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Getting Started', href: '/docs/getting-started' },
    ],
  },
  {
    group: 'Contributing',
    items: [
      { title: 'Screenings', href: '/docs/screenings' },
      { title: 'Tasks', href: '/docs/tasks' },
      { title: 'Earnings & Payments', href: '/docs/earnings' },
      { title: 'Reputation', href: '/docs/reputation' },
    ],
  },
  {
    group: 'Help',
    items: [
      { title: 'FAQ', href: '/docs/faq' },
    ],
  },
];

export const allPages = docsNav.flatMap((g) => g.items);
