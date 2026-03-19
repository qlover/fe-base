import { NextApiServer } from '@server/NextApiServer';

/**
 * @swagger
 * /api/ai/completions:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get AI chat completion
 *     description: |
 *       Calls the AI service to get a chat completion. Currently uses a fixed
 *       message ("hello") for demonstration. Runs via `BootstrapServer` and
 *       returns a unified API envelope (`AppSuccessApi` / `AppErrorApi`).
 *     responses:
 *       200:
 *         description: Success. Returns AI completion result wrapped in success envelope.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   description: Raw response from the AI completion API (structure depends on provider).
 *                   nullable: true
 *       400:
 *         description: Request failed (e.g. executor error). Error details in envelope.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - id
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 id:
 *                   type: string
 *                   description: Error identifier/code.
 *                 message:
 *                   type: string
 *                   description: Human-readable error message.
 *                   nullable: true
 */
export async function GET() {
  return await new NextApiServer().runWithJson(async () => {
    return 'hello';
    // const result = await IOC(OpenAiAgent).completions([
    //   {
    //     role: 'user',
    //     content: 'hello'
    //   }
    // ]);

    // return result;
  });
}
