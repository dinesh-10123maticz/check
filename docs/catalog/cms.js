const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * CMS MODULE  (mounted at /v1/cms)
 * Content management: FAQs, CMS pages, roadmap, planets,
 * currencies, collection types, social links.
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  ep('post', '/v1/cms/uploadvideo', {
    tag: 'CMS',
    summary: 'Upload a video to S3',
    desc: 'Multipart form-data with a `video` file and a `location` folder key in the body.',
    auth: 'none',
    body: {
      required: ['location'],
      props: {
        location: P('string', 'S3 folder key prefix', { ex: 'promo/videos' }),
        video: P('file', 'Video file (multipart)'),
      },
      example: { location: 'promo/videos' },
    },
    success: { code: 200, message: 'uploaded', example: { status: true, message: 'uploaded', data: { videoKey: 'promo/videos/1712345678901.mp4' } } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/cms/faqlists', {
    tag: 'CMS',
    summary: 'Get all FAQs',
    auth: 'none',
    success: { code: 200, message: 'success', example: { status: true, message: 'success', data: [{ _id: '66a...', question: 'What is GALFI?', answer: 'A game NFT marketplace' }] } },
    errors: ['500'],
  }),

  ep('put', '/v1/cms/updatefaq', {
    tag: 'CMS',
    summary: 'Update an FAQ',
    auth: 'admin',
    encrypt: 'decrypt',
    body: {
      required: ['id', 'question', 'answer'],
      props: {
        id: P('string', 'FAQ _id'),
        question: P('string', 'Question text'),
        answer: P('string', 'Answer text'),
      },
      example: { id: '66a...', question: 'What is GALFI?', answer: 'Updated answer' },
    },
    success: { code: 200, message: 'success', encrypted: true, example: { status: true, message: 'success', data: { _id: '66a...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('post', '/v1/cms/addfaq', {
    tag: 'CMS',
    summary: 'Add a new FAQ',
    auth: 'admin',
    encrypt: 'decrypt',
    body: {
      required: ['question', 'answer'],
      props: {
        question: P('string', 'Question text'),
        answer: P('string', 'Answer text'),
      },
      example: { question: 'How do I stake?', answer: 'Go to the exchange tab' },
    },
    success: { code: 200, message: 'success', encrypted: true, example: { status: true, message: 'success', data: { _id: '66a...', question: 'How do I stake?' } } },
    errors: ['400', '401', '422', '500'],
  }),

  ep('delete', '/v1/cms/deletefaq/:id', {
    tag: 'CMS',
    summary: 'Delete an FAQ',
    auth: 'admin',
    params: [
      { name: 'id', in: 'path', required: true, t: 'string', d: 'FAQ _id', ex: '66a...' },
    ],
    success: { code: 200, message: 'deleted', example: { status: true, message: 'deleted' } },
    errors: ['401', '404', '500'],
  }),

  ep('get', '/v1/cms/cmsdetail', {
    tag: 'CMS',
    summary: 'Get CMS page detail',
    auth: 'none',
    encrypt: 'decrypt',
    params: [
      { name: 'key', in: 'query', required: false, t: 'string', d: 'CMS page key', ex: 'terms' },
    ],
    success: { code: 200, message: 'success', encrypted: true, example: { status: true, message: 'success', data: { key: 'terms', heading: 'Terms & Conditions', description: '...' } } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/cms/editcms', {
    tag: 'CMS',
    summary: 'Update a CMS page',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['id'],
      props: {
        id: P('string', 'CMS page _id'),
        key: P('string', 'Page key'),
        heading: P('string', 'Heading'),
        description: P('string', 'Body content'),
        cmsimage: P('file', 'Optional image (multipart)'),
      },
      example: { id: '66b...', key: 'terms', heading: 'Terms', description: 'Updated terms...' },
    },
    success: { code: 200, message: 'success', encrypted: true, example: { status: true, message: 'success', data: { _id: '66b...' } } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/cms/roadmapList', {
    tag: 'CMS',
    summary: 'Get roadmap entries',
    auth: 'none',
    success: { code: 200, message: 'success', example: { status: true, message: 'success', data: [{ _id: '66c...', question: 'Q3 2026', answer: 'Ship battles' }] } },
    errors: ['500'],
  }),

  ep('put', '/v1/cms/roadmapupdate', {
    tag: 'CMS',
    summary: 'Update a roadmap entry',
    auth: 'admin',
    encrypt: 'decrypt',
    body: {
      required: ['id'],
      props: {
        id: P('string', 'Roadmap entry _id'),
        question: P('string', 'Quarter / title'),
        answer: P('string', 'Description'),
      },
      example: { id: '66c...', question: 'Q4 2026', answer: 'New planets' },
    },
    success: { code: 200, message: 'success', encrypted: true, example: { status: true, message: 'success', data: { _id: '66c...' } } },
    errors: ['400', '401', '500'],
  }),

  ep('get', '/v1/cms/contactuslist', {
    tag: 'CMS',
    summary: 'Get newsletter / contact subscriptions',
    auth: 'none',
    success: { code: 200, message: 'success', example: { status: true, message: 'success', data: [{ _id: '66d...', email: 'user@example.com' }] } },
    errors: ['500'],
  }),

  ep('get', '/v1/cms/planetlist', {
    tag: 'CMS',
    summary: 'Get planet list (CMS)',
    auth: 'none',
    success: { code: 200, message: 'success', example: { status: true, message: 'success', data: [{ _id: '66e...', name: 'Earth' }] } },
    errors: ['500'],
  }),

  ep('put', '/v1/cms/planetupdate', {
    tag: 'CMS',
    summary: 'Update planet(s) (bulk find + update)',
    auth: 'none',
    body: {
      required: ['find', 'update'],
      props: {
        find: P('object', 'MongoDB filter', { ex: { name: 'Earth' } }),
        update: P('object', 'Fields to set', { ex: { description: 'Home planet' } }),
      },
      example: { find: { name: 'Earth' }, update: { description: 'Home planet' } },
    },
    success: { code: 200, message: 'updated', example: { status: true, message: 'updated' } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/cms/cmslist', {
    tag: 'CMS',
    summary: 'Get all CMS pages',
    auth: 'none',
    success: { code: 200, message: 'success', example: { status: true, message: 'success', data: [{ _id: '66b...', key: 'terms' }] } },
    errors: ['500'],
  }),

  ep('get', '/v1/cms/currencylist', {
    tag: 'CMS',
    summary: 'Get currency list',
    auth: 'none',
    success: { code: 200, message: 'success', example: { status: true, message: 'success', data: [{ _id: '664a...', label: 'GALFI', name: 'GALFI Token' }] } },
    errors: ['500'],
  }),

  ep('post', '/v1/cms/createcurrency', {
    tag: 'CMS',
    summary: 'Create a currency',
    auth: 'none',
    body: {
      required: ['type'],
      props: {
        type: P('string', 'Currency type', { ex: 'token' }),
        imageUrl: P('string', 'Currency icon URL'),
        name: P('string', 'Currency name', { ex: 'GALFI Token' }),
        label: P('string', 'Symbol', { ex: 'GALFI' }),
        contractAddress: P('string', 'Token contract address'),
        network: P('string', 'Network'),
        valueofGalfi: P('number', 'Value vs GALFI'),
      },
      example: { type: 'token', name: 'GALFI Token', label: 'GALFI' },
    },
    success: { code: 200, message: 'created', example: { status: true, message: 'created', data: { _id: '664a...' } } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/cms/changecurrencystatus', {
    tag: 'CMS',
    summary: 'Enable / disable a currency',
    auth: 'none',
    body: {
      required: ['id'],
      props: {
        id: P('string', 'Currency _id'),
        status: P('boolean', 'Target active state'),
      },
      example: { id: '664a...', status: false },
    },
    success: { code: 200, message: 'status changed', example: { status: true, message: 'status changed' } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/cms/collectiontypelist', {
    tag: 'CMS',
    summary: 'Get collection types',
    auth: 'none',
    success: { code: 200, message: 'success', example: { status: true, message: 'success', data: [{ _id: '66f...', type: 'planet', imageUrl: '...' }] } },
    errors: ['500'],
  }),

  ep('post', '/v1/cms/createcollectiontype', {
    tag: 'CMS',
    summary: 'Create a collection type',
    auth: 'none',
    body: {
      required: ['type'],
      props: {
        type: P('string', 'planet | crew | ship | astroid | galficrew | galfispecialcrew', { ex: 'planet' }),
        imageUrl: P('string', 'Type icon URL'),
      },
      example: { type: 'planet', imageUrl: 'https://cdn.galfi.com/types/planet.png' },
    },
    success: { code: 200, message: 'created', example: { status: true, message: 'created', data: { _id: '66f...' } } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/cms/sociallist', {
    tag: 'CMS',
    summary: 'Get social links',
    auth: 'none',
    success: { code: 200, message: 'success', example: { status: true, message: 'success', data: [{ _id: '66g...', platform: 'twitter', url: 'https://x.com/galfi' }] } },
    errors: ['500'],
  }),

  ep('put', '/v1/cms/updatesocial', {
    tag: 'CMS',
    summary: 'Update social links',
    auth: 'none',
    body: {
      required: [],
      props: {
        twitter: P('string', 'Twitter URL'),
        discord: P('string', 'Discord URL'),
        telegram: P('string', 'Telegram URL'),
        youtube: P('string', 'YouTube URL'),
      },
      example: { twitter: 'https://x.com/galfi' },
    },
    success: { code: 200, message: 'updated', example: { status: true, message: 'updated' } },
    errors: ['400', '500'],
  }),
];
