import { NextResponse } from 'next/server';
import { createSwaggerSpec } from 'next-swagger-doc';

/**
 * Serves the OpenAPI 3.0 spec generated from JSDoc @swagger annotations
 * in src/app/api. Used by the API reference UI (e.g. Scalar) at /api/reference.
 */
export async function GET() {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Next Seed API',
        version: '1.0',
        description: 'API for next-seed example application'
      },
      servers: [
        { url: 'http://localhost:3100', description: 'Local dev' },
        { url: 'http://localhost:3101', description: 'Production start' }
      ]
    }
  });

  return NextResponse.json(spec);
}
