import { API_USER_REQUEST_LOGS } from '@config/apiRoutes';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/request-logs:
 *   get:
 *     tags:
 *       - User
 *     summary: List current user request logs
 *     description: |
 *       Paged `request_logs` for the signed-in user (RLS). Query mirrors {@link ResourceSearchParams}:
 *       `page`, `pageSize`, `offset`, `cursor`, `keyword`, `filters` (JSON string), `sort` (JSON array), or flat `orderBy`+`order` for the first sort clause.
 *       Parsed and validated by `RequestLogsSearchParamsValidator` in the controller; JSON body uses `AppApiSuccessInterface`; `data` is `ResourceSearchResult` (`items`, `total`, `page`, `pageSize`, `hasMore`).
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: orderBy
 *         description: Whitelisted column (e.g. created_at, event_type).
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: filters
 *         description: JSON string (opaque until server implements filter semantics).
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         description: JSON array of ResourceSortClause (overrides orderBy/order when valid).
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success envelope; `data` is ResourceSearchResult.
 *       400:
 *         description: Not authenticated or query failed.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_USER_REQUEST_LOGS, req)
    .use(new ServerAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(UserController).searchRequestLogsForCurrentUser(
        req.nextUrl.searchParams
      )
    );
}
