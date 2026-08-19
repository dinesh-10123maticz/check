const { ep, P } = require('./common');

/**
 * ─────────────────────────────────────────────────────────────
 * CATEGORY MODULE  (mounted at /v1/category)
 * Classes, sub-categories and sub-category values.
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  ep('get', '/v1/category/classlist', {
    tag: 'Category',
    summary: 'Get all classes (categories)',
    auth: 'none',
    success: { code: 200, message: 'success', encrypted: true, example: { status: true, message: 'success', data: [{ _id: '66a...', name: 'Planets', isActive: true }] } },
    errors: ['500'],
  }),

  ep('post', '/v1/category/addclass', {
    tag: 'Category',
    summary: 'Add a new class',
    auth: 'admin',
    encrypt: 'decrypt',
    body: {
      required: ['name'],
      props: { name: P('string', 'Class name', { ex: 'Ships' }) },
      example: { name: 'Ships' },
    },
    success: { code: 200, message: 'created successfully', encrypted: true, example: { status: true, message: 'created successfully', data: { _id: '66a...', name: 'Ships' } } },
    errors: ['400', '401', '209', '500'],
  }),

  ep('put', '/v1/category/changeclass', {
    tag: 'Category',
    summary: 'Toggle class active status',
    auth: 'admin',
    encrypt: 'decrypt',
    body: {
      required: ['id'],
      props: {
        id: P('string', 'Class _id'),
        status: P('boolean', 'Current status (toggled internally)'),
      },
      example: { id: '66a...', status: true },
    },
    success: { code: 200, message: 'status changed', encrypted: true, example: { status: true, message: 'status changed' } },
    errors: ['400', '401', '500'],
  }),

  ep('put', '/v1/category/categoryupdate', {
    tag: 'Category',
    summary: 'Add sub-category (alias of /addsubcategory)',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['_id', 'subname'],
      props: {
        _id: P('string', 'Class _id'),
        subname: P('string', 'Sub-category key', { ex: 'Fighters' }),
      },
      example: { _id: '66a...', subname: 'Fighters' },
    },
    success: { code: 200, message: 'subcategory added', encrypted: true, example: { status: true, message: 'subcategory added', data: { _id: '66b...', key: 'Fighters' } } },
    errors: ['400', '209', '500'],
  }),

  ep('post', '/v1/category/addsubcategory', {
    tag: 'Category',
    summary: 'Add a sub-category to a class',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['_id', 'subname'],
      props: {
        _id: P('string', 'Class _id'),
        subname: P('string', 'Sub-category key', { ex: 'Fighters' }),
      },
      example: { _id: '66a...', subname: 'Fighters' },
    },
    success: { code: 200, message: 'subcategory added', encrypted: true, example: { status: true, message: 'subcategory added', data: { _id: '66b...', key: 'Fighters', value: [] } } },
    errors: ['400', '209', '500'],
  }),

  ep('post', '/v1/category/subcategorylist', {
    tag: 'Category',
    summary: 'Get sub-categories of a class',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['_id'],
      props: { _id: P('string', 'Class _id') },
      example: { _id: '66a...' },
    },
    success: { code: 200, message: 'success', encrypted: true, example: { status: true, message: 'success', data: [{ _id: '66b...', key: 'Fighters' }] } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/category/subcategoryvaluelist', {
    tag: 'Category',
    summary: 'Get values of a sub-category',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['_id'],
      props: { _id: P('string', 'Sub-category _id') },
      example: { _id: '66b...' },
    },
    success: { code: 200, message: 'success', encrypted: true, example: { status: true, message: 'success', data: { _id: '66b...', value: ['Interceptor', 'Bomber'] } } },
    errors: ['400', '500'],
  }),

  ep('post', '/v1/category/addsubcategoryvalue', {
    tag: 'Category',
    summary: 'Add a value to a sub-category',
    auth: 'none',
    encrypt: 'decrypt',
    body: {
      required: ['_id', 'value'],
      props: {
        _id: P('string', 'Sub-category _id'),
        value: P('string', 'Value to add', { ex: 'Interceptor' }),
      },
      example: { _id: '66b...', value: 'Interceptor' },
    },
    success: { code: 200, message: 'added', encrypted: true, example: { status: true, message: 'added', data: { value: ['Interceptor'] } } },
    errors: ['400', '500'],
  }),

  ep('get', '/v1/category/categorylist', {
    tag: 'Category',
    summary: 'Get all categories (legacy)',
    auth: 'none',
    success: { code: 200, message: 'success', encrypted: true, example: { status: true, message: 'success', data: [{ _id: '66a...', name: 'Planets' }] } },
    errors: ['500'],
  }),
];
