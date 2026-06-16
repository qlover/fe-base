import { ApiReference } from '@scalar/nextjs-api-reference';

/**
 * Serves the Scalar API Reference UI. Renders interactive API docs from the
 * OpenAPI spec at /api/openapi (generated from JSDoc @swagger in API routes).
 * Open in browser: /api/reference
 */
const config = {
  url: '/api/openapi',
  title: 'Next Seed API Reference'
};

export const GET = ApiReference(config);
