const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * PROMO MODULE  (mounted at /v1/promo)
 * News, blogs, partners, promo buildings, publish CMS.
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  // ── News ──────────────────────────────────────────────────
  ep('get', '/v1/promo/news/:id', {
    tag: 'Promo',
    summary: 'Get a news article by id',
    auth: 'none',
    params: [{ name: 'id', in: 'path', required: true, t: 'string', d: 'News _id' }],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { _id: '66a...', heading: 'New planet pack!' } } },
    errors: ['404', '500'],
  }),

  ep('post', '/v1/promo/createnews', {
    tag: 'Promo',
    summary: 'Create a news article (admin)',
    auth: 'admin',
    body: {
      required: ['imageUrl', 'heading', 'description'],
      props: {
        imageUrl: P('string', 'Cover image URL'),
        heading: P('string', 'Headline'),
        description: P('string', 'Article body'),
      },
      example: { imageUrl: 'https://cdn.galfi.com/news/1.png', heading: 'New planet pack!', description: '...' },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66a...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('put', '/v1/promo/updatenews', {
    tag: 'Promo',
    summary: 'Update a news article (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'News _id'),
        imageUrl: P('string', 'Cover image URL'),
        heading: P('string', 'Headline'),
        description: P('string', 'Article body'),
      },
      example: { _id: '66a...', heading: 'Updated headline' },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated', data: { _id: '66a...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/promo/newslist', {
    tag: 'Promo',
    summary: 'List published news',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66a...', heading: 'New planet pack!' }] } },
    errors: ['500'],
  }),

  ep('get', '/v1/promo/adminnewslist', {
    tag: 'Promo',
    summary: 'List all news (incl. drafts, admin)',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66a...', heading: 'Draft', status: 'draft' }] } },
    errors: ['500'],
  }),

  ep('delete', '/v1/promo/news', {
    tag: 'Promo',
    summary: 'Delete a news article (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: { _id: P('string', 'News _id') },
      example: { _id: '66a...' },
    },
    success: { code: 200, message: 'deleted', example: { statusCode: 200, status: true, message: 'deleted' } },
    errors: ['401', '404', '500'],
  }),

  ep('put', '/v1/promo/newsstatus', {
    tag: 'Promo',
    summary: 'Change news publish status',
    auth: 'none',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'News _id'),
        status: P('boolean', 'Published flag'),
      },
      example: { _id: '66a...', status: true },
    },
    success: { code: 200, message: 'status changed', example: { statusCode: 200, status: true, message: 'status changed' } },
    errors: ['400', '500'],
  }),

  // ── Blog ──────────────────────────────────────────────────
  ep('get', '/v1/promo/blog/:id', {
    tag: 'Promo',
    summary: 'Get a blog post by id',
    auth: 'none',
    params: [{ name: 'id', in: 'path', required: true, t: 'string', d: 'Blog _id' }],
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: { _id: '66b...', heading: 'How to stake' } } },
    errors: ['404', '500'],
  }),

  ep('post', '/v1/promo/createblog', {
    tag: 'Promo',
    summary: 'Create a blog post (admin)',
    auth: 'admin',
    body: {
      required: ['imageUrl', 'heading', 'description'],
      props: {
        imageUrl: P('string', 'Cover image URL'),
        videoUrl: P('string', 'Embed video URL'),
        heading: P('string', 'Headline'),
        description: P('string', 'Post body'),
        navLink: P('string', 'Navigation link'),
      },
      example: { imageUrl: 'https://cdn.galfi.com/blog/1.png', heading: 'How to stake', description: '...' },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66b...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('put', '/v1/promo/updateblog', {
    tag: 'Promo',
    summary: 'Update a blog post (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'Blog _id'),
        imageUrl: P('string', 'Cover image URL'),
        videoUrl: P('string', 'Embed video URL'),
        heading: P('string', 'Headline'),
        description: P('string', 'Post body'),
        navLink: P('string', 'Navigation link'),
      },
      example: { _id: '66b...', heading: 'Updated post' },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated', data: { _id: '66b...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/promo/bloglist', {
    tag: 'Promo',
    summary: 'List published blog posts',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66b...', heading: 'How to stake' }] } },
    errors: ['500'],
  }),

  ep('get', '/v1/promo/bloglists', {
    tag: 'Promo',
    summary: 'List blog posts for the site (published only)',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66b...', heading: 'How to stake' }] } },
    errors: ['500'],
  }),

  ep('get', '/v1/promo/adminbloglist', {
    tag: 'Promo',
    summary: 'List all blog posts (incl. drafts)',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66b...', heading: 'Draft', status: 'draft' }] } },
    errors: ['500'],
  }),

  ep('delete', '/v1/promo/blog', {
    tag: 'Promo',
    summary: 'Delete a blog post (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: { _id: P('string', 'Blog _id') },
      example: { _id: '66b...' },
    },
    success: { code: 200, message: 'deleted', example: { statusCode: 200, status: true, message: 'deleted' } },
    errors: ['401', '404', '500'],
  }),

  ep('put', '/v1/promo/blogstatus', {
    tag: 'Promo',
    summary: 'Change blog publish status',
    auth: 'none',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'Blog _id'),
        status: P('boolean', 'Published flag'),
      },
      example: { _id: '66b...', status: true },
    },
    success: { code: 200, message: 'status changed', example: { statusCode: 200, status: true, message: 'status changed' } },
    errors: ['400', '500'],
  }),

  // ── Partners ──────────────────────────────────────────────
  ep('get', '/v1/promo/partnerlist', {
    tag: 'Promo',
    summary: 'List partners',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66c...', name: 'Partner Co' }] } },
    errors: ['500'],
  }),

  ep('post', '/v1/promo/partner', {
    tag: 'Promo',
    summary: 'Create a partner (admin)',
    auth: 'admin',
    body: {
      required: ['name'],
      props: {
        name: P('string', 'Partner name'),
        imageUrl: P('string', 'Logo URL'),
        link: P('string', 'External link'),
      },
      example: { name: 'Partner Co', imageUrl: 'https://cdn.galfi.com/partners/1.png', link: 'https://partner.com' },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66c...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('delete', '/v1/promo/partner', {
    tag: 'Promo',
    summary: 'Delete a partner (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: { _id: P('string', 'Partner _id') },
      example: { _id: '66c...' },
    },
    success: { code: 200, message: 'deleted', example: { statusCode: 200, status: true, message: 'deleted' } },
    errors: ['401', '404', '500'],
  }),

  // ── Promo CMS ─────────────────────────────────────────────
  ep('get', '/v1/promo/promocms', {
    tag: 'Promo',
    summary: 'Get promo CMS content',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: {} } },
    errors: ['500'],
  }),

  // ── Promo buildings ───────────────────────────────────────
  ep('get', '/v1/promo/promobuild', {
    tag: 'Promo',
    summary: 'List promo buildings',
    auth: 'none',
    success: { code: 200, message: 'fetched', example: { statusCode: 200, status: true, message: 'fetched', data: [{ _id: '66d...', buildingName: 'Event Tower' }] } },
    errors: ['500'],
  }),

  ep('post', '/v1/promo/promobuild', {
    tag: 'Promo',
    summary: 'Create a promo building (admin)',
    desc: 'Yup validation: `buildingName`, `description`, `image` are required. Validation error returns 409.',
    auth: 'admin',
    body: {
      required: ['buildingName', 'description', 'image'],
      props: {
        buildingName: P('string', 'Building name'),
        description: P('string', 'Description'),
        image: P('string', 'Image URL/key'),
      },
      example: { buildingName: 'Event Tower', description: 'Limited edition', image: 'https://cdn.galfi.com/promo/tower.png' },
    },
    success: { code: 200, message: 'created', example: { statusCode: 200, status: true, message: 'created', data: { _id: '66d...' } } },
    errors: ['400', '401', '409', '500'],
  }),

  ep('put', '/v1/promo/promobuild', {
    tag: 'Promo',
    summary: 'Update a promo building (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'Promo building _id'),
        buildingName: P('string', 'Building name'),
        description: P('string', 'Description'),
        image: P('string', 'Image URL/key'),
      },
      example: { _id: '66d...', description: 'Updated' },
    },
    success: { code: 200, message: 'updated', example: { statusCode: 200, status: true, message: 'updated', data: { _id: '66d...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('delete', '/v1/promo/promobuild', {
    tag: 'Promo',
    summary: 'Delete a promo building (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: { _id: P('string', 'Promo building _id') },
      example: { _id: '66d...' },
    },
    success: { code: 200, message: 'deleted', example: { statusCode: 200, status: true, message: 'deleted' } },
    errors: ['401', '404', '500'],
  }),

  // ── Publish CMS ───────────────────────────────────────────
  ep('get', '/v1/promo/publish', {
    tag: 'Promo',
    summary: 'List publish entries',
    auth: 'none',
    success: { code: 200, message: 'publish list fetched successfully', example: { statusCode: 200, status: true, message: 'publish list fetched successfully', data: [{ _id: '66e...', navLink: '/blog' }] } },
    errors: ['500'],
  }),

  ep('post', '/v1/promo/publish', {
    tag: 'Promo',
    summary: 'Create a publish entry (admin)',
    desc: '`navLink` is trimmed server-side.',
    auth: 'admin',
    body: {
      required: ['navLink'],
      props: {
        navLink: P('string', 'Navigation link', { ex: '/blog' }),
        title: P('string', 'Title'),
        description: P('string', 'Description'),
        imageUrl: P('string', 'Image URL'),
      },
      example: { navLink: '/blog', title: 'Blog' },
    },
    success: { code: 200, message: 'created successfully', example: { statusCode: 200, status: true, message: 'created successfully', data: { _id: '66e...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('put', '/v1/promo/publish', {
    tag: 'Promo',
    summary: 'Update a publish entry (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: {
        _id: P('string', 'Publish _id'),
        navLink: P('string', 'Navigation link'),
        title: P('string', 'Title'),
        description: P('string', 'Description'),
        imageUrl: P('string', 'Image URL'),
      },
      example: { _id: '66e...', navLink: '/news' },
    },
    success: { code: 200, message: 'updated successfully', example: { statusCode: 200, status: true, message: 'updated successfully', data: { _id: '66e...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('delete', '/v1/promo/publish', {
    tag: 'Promo',
    summary: 'Delete a publish entry (admin)',
    auth: 'admin',
    body: {
      required: ['_id'],
      props: { _id: P('string', 'Publish _id') },
      example: { _id: '66e...' },
    },
    success: { code: 200, message: 'deleted successfully', example: { statusCode: 200, status: true, message: 'deleted successfully', data: { _id: '66e...' } } },
    errors: ['401', '404', '500'],
  }),
];
