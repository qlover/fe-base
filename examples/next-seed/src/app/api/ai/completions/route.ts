import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse } from 'next/server';
import { AppErrorApi } from '@server/AppErrorApi';
import { AppSuccessApi } from '@server/AppSuccessApi';
import { BootstrapServer } from '@server/BootstrapServer';
import { AIService } from '@server/services/AIService';

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
  const result = await new BootstrapServer().execNoError(
    async ({ parameters: { IOC } }) => {
      // const requestBody = await req.json();

      const result = await IOC(AIService).completions([
        {
          role: 'user',
          content: 'hello'
        }
      ]);

      return result;
    }
  );

  if (result instanceof ExecutorError) {
    console.log(result);
    return NextResponse.json(new AppErrorApi(result.id, result.message), {
      status: 400
    });
  }

  return NextResponse.json(new AppSuccessApi(result));
}
