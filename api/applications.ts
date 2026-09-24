import crypto from 'node:crypto';
import { z } from 'zod';
import {
  type RequestLike,
  type ResponseLike,
  applyCors,
  checkRateLimit,
  getClientIp,
  getDb,
  getRequesterSession,
  sendSanitizedError
} from './_security';

const STAGE_KEYS = [
  'questionnaire',
  'essay',
  'recommendations',
  'tests_sent',
  'submitted',
  'decision'
] as const;

const UpdateStageSchema = z.object({
  programId: z.string().min(1).max(128),
  programName: z.string().min(1).max(256),
  country: z.string().max(100).optional(),
  stageKey: z.enum(STAGE_KEYS),
  status: z.enum(['not_started', 'in_progress', 'completed', 'pending', 'accepted', 'rejected', 'waitlist']),
  notes: z.string().max(500).optional(),
  date: z.string().max(30).optional()
});

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (applyCors(req, res)) return;

  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp, 60, 60000)) {
    return res.status(429).json({ error: 'Слишком много запросов. Подождите 1 минуту.' });
  }

  const session = getRequesterSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Необходима авторизация для доступа к трекеру заявок' });
  }

  const userId = session.userId;
  const sql = getDb();

  try {
    // 1. GET: Fetch user's application trackers
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, program_id, program_name, stages, status, updated_at
        FROM application_trackers
        WHERE user_id = ${userId}
        ORDER BY updated_at DESC;
      `;

      return res.status(200).json({
        success: true,
        applications: rows.map(r => ({
          id: r.id,
          programId: r.program_id,
          programName: r.program_name,
          stages: r.stages,
          status: r.status,
          updatedAt: r.updated_at
        }))
      });
    }

    // 2. POST: Create or Update stage for a program
    if (req.method === 'POST') {
      const parsed = UpdateStageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Некорректные параметры заявки' });
      }

      const { programId, programName, stageKey, status, notes, date } = parsed.data;

      // Find existing tracker
      const existing = await sql`
        SELECT id, stages, status FROM application_trackers
        WHERE user_id = ${userId} AND program_id = ${programId}
        LIMIT 1;
      `;

      let currentStages: Record<string, any> = {};
      let trackerId = '';

      if (existing.length > 0) {
        trackerId = existing[0].id;
        currentStages = existing[0].stages || {};
      } else {
        trackerId = `app-${crypto.randomUUID()}`;
        // Initialize default stages
        for (const key of STAGE_KEYS) {
          currentStages[key] = { status: 'not_started', updatedAt: null };
        }
      }

      // Update specific stage
      currentStages[stageKey] = {
        status,
        notes: notes || '',
        date: date || new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString()
      };

      // Determine overall application status
      let overallStatus = 'in_progress';
      if (currentStages.decision?.status === 'accepted') {
        overallStatus = 'accepted';
      } else if (currentStages.decision?.status === 'rejected') {
        overallStatus = 'rejected';
      } else if (currentStages.submitted?.status === 'completed') {
        overallStatus = 'submitted';
      }

      await sql`
        INSERT INTO application_trackers (id, user_id, program_id, program_name, stages, status, updated_at)
        VALUES (${trackerId}, ${userId}, ${programId}, ${programName}, ${JSON.stringify(currentStages)}::jsonb, ${overallStatus}, NOW())
        ON CONFLICT (user_id, program_id) DO UPDATE SET
          program_name = EXCLUDED.program_name,
          stages = EXCLUDED.stages,
          status = EXCLUDED.status,
          updated_at = NOW();
      `;

      // Check badges / achievements for user
      let newBadgeEarned: string | null = null;
      if (overallStatus === 'submitted') {
        newBadgeEarned = 'first_application_submitted';
      }

      return res.status(200).json({
        success: true,
        application: {
          id: trackerId,
          programId,
          programName,
          stages: currentStages,
          status: overallStatus,
          updatedAt: new Date().toISOString()
        },
        newBadgeEarned
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return sendSanitizedError(res, error, 500, 'Ошибка при работе с трекером заявок');
  }
}
