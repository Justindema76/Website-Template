export default {
  key: 'template',
  name: 'Business Name',
  adminLabel: 'Client Website',
  domain: import.meta.env.VITE_SITE_DOMAIN || 'example.com',
  showSocialSidebar: true,
  navGroups: [
    {
      id: 'requests',
      label: 'Requests',
      items: [
        { to: '/admin/service-requests', label: 'Service Requests', icon: 'inbox' },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      items: [
        { to: '/admin/blog', label: 'Blog Posts', icon: 'book' },
        { to: '/admin/videos', label: 'Videos', icon: 'video' },
        { to: '/admin/media', label: 'Media', icon: 'image' },
      ],
    },
    {
      id: 'website',
      label: 'Website',
      items: [
        { to: '/admin/website/pages', label: 'Pages', icon: 'panels' },
        { to: '/admin/website/blocks', label: 'Block Library', icon: 'library' },
        { to: '/admin/website/styles', label: 'Global Styles', icon: 'palette' },
        { to: '/admin/website/global/header', label: 'Header', icon: 'panelTop' },
        { to: '/admin/website/global/project-request', label: 'Quote / Request Drawer', icon: 'inbox' },
        { to: '/admin/website/global/footer', label: 'Footer', icon: 'panelBottom' },
      ],
    },
    {
      id: 'social',
      label: 'Social',
      items: [
        { to: '/admin/social', label: 'Social Links', icon: 'link' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      items: [
        { to: '/admin/settings', label: 'Website Settings', icon: 'settings' },
      ],
    },
  ],
  dashboard: {
    intro: 'Manage the client website from one place.',
    quick: [
      { to: '/admin/website/pages', icon: 'panels', title: 'Pages', copy: 'Edit and publish website pages' },
      { to: '/admin/service-requests', icon: 'inbox', title: 'Service Requests', copy: 'Review website enquiries' },
      { to: '/admin/media', icon: 'image', title: 'Media', copy: 'Manage reusable website assets' },
      { to: '/admin/website/styles', icon: 'palette', title: 'Global Styles', copy: 'Control site-wide visual settings' },
    ],
    sections: [
      {
        id: 'website',
        title: 'Website',
        copy: 'Pages, reusable blocks and global website controls.',
        items: [
          { to: '/admin/website/pages', icon: 'panels', title: 'Pages', copy: 'Open, edit and publish public pages.' },
          { to: '/admin/website/blocks', icon: 'library', title: 'Block Library', copy: 'Browse reusable page blocks.' },
          { to: '/admin/website/styles', icon: 'palette', title: 'Global Styles', copy: 'Control colours, typography, spacing, cards and buttons.' },
          { to: '/admin/website/global/header', icon: 'panelTop', title: 'Header', copy: 'Edit the global website header.' },
          { to: '/admin/website/global/project-request', icon: 'inbox', title: 'Request Drawer', copy: 'Edit the website request form drawer.' },
          { to: '/admin/website/global/footer', icon: 'panelBottom', title: 'Footer', copy: 'Edit the global website footer.' },
        ],
      },
      {
        id: 'content',
        title: 'Content',
        copy: 'Manage reusable public content.',
        items: [
          { to: '/admin/blog', icon: 'book', title: 'Blog Posts', copy: 'Create and manage articles.' },
          { to: '/admin/videos', icon: 'video', title: 'Videos', copy: 'Manage videos used by the site.' },
          { to: '/admin/media', icon: 'image', title: 'Media', copy: 'Manage uploaded website assets.' },
        ],
      },
      {
        id: 'requests',
        title: 'Requests',
        copy: 'Review enquiries submitted from the public website.',
        items: [
          { to: '/admin/service-requests', icon: 'inbox', title: 'Service Requests', copy: 'Review and manage project or quote requests.' },
        ],
      },
      {
        id: 'tools',
        title: 'Social & Settings',
        copy: 'Manage links and website configuration.',
        items: [
          { to: '/admin/social', icon: 'link', title: 'Social Links', copy: 'Manage social links used by the website.' },
          { to: '/admin/settings', icon: 'settings', title: 'Website Settings', copy: 'Manage website services and settings.' },
        ],
      },
    ],
  },
};
