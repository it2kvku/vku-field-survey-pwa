export interface Env {
  DB: D1Database
  ASSETS: Fetcher
}

interface SurveyBody {
  id: string
  facilityName: string
  building: string
  inspectorName: string
  inspectionDate: string
  condition: string
  category: string
  notes?: string
  photoDataUrl?: string | null
  gpsLat?: number | null
  gpsLng?: number | null
  createdAt: string
  updatedAt: string
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  })
}

function rowToSurvey(row: Record<string, unknown>) {
  return {
    id: row.id,
    facilityName: row.facility_name,
    building: row.building,
    inspectorName: row.inspector_name,
    inspectionDate: row.inspection_date,
    condition: row.condition,
    category: row.category,
    notes: row.notes ?? '',
    photoDataUrl: row.photo_data_url ?? undefined,
    gpsLat: row.gps_lat ?? undefined,
    gpsLng: row.gps_lng ?? undefined,
    status: 'synced',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function listSurveys(env: Env) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM surveys ORDER BY created_at DESC LIMIT 200'
  ).all()
  return json({ surveys: results.map((row) => rowToSurvey(row as Record<string, unknown>)) })
}

async function upsertSurvey(env: Env, body: SurveyBody) {
  if (!body.id || !body.facilityName || !body.inspectorName) {
    return json({ error: 'Missing required fields' }, 400)
  }

  await env.DB.prepare(
    `INSERT INTO surveys (
      id, facility_name, building, inspector_name, inspection_date,
      condition, category, notes, photo_data_url, gps_lat, gps_lng,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      facility_name = excluded.facility_name,
      building = excluded.building,
      inspector_name = excluded.inspector_name,
      inspection_date = excluded.inspection_date,
      condition = excluded.condition,
      category = excluded.category,
      notes = excluded.notes,
      photo_data_url = excluded.photo_data_url,
      gps_lat = excluded.gps_lat,
      gps_lng = excluded.gps_lng,
      status = 'synced',
      updated_at = excluded.updated_at`
  )
    .bind(
      body.id,
      body.facilityName,
      body.building,
      body.inspectorName,
      body.inspectionDate,
      body.condition,
      body.category,
      body.notes ?? '',
      body.photoDataUrl ?? null,
      body.gpsLat ?? null,
      body.gpsLng ?? null,
      body.createdAt,
      body.updatedAt
    )
    .run()

  return json({ ok: true, id: body.id, status: 'synced' })
}

async function removeSurvey(env: Env, id: string) {
  await env.DB.prepare('DELETE FROM surveys WHERE id = ?').bind(id).run()
  return json({ ok: true })
}

async function getPreferences(env: Env, deviceId: string) {
  if (!deviceId) return json({ locale: null })
  const row = await env.DB.prepare(
    'SELECT locale FROM preferences WHERE device_id = ?'
  )
    .bind(deviceId)
    .first<{ locale: string }>()
  if (!row) return json({ locale: null })
  return json({ locale: row.locale === 'vi' ? 'vi' : 'en' })
}

async function putPreferences(env: Env, body: { deviceId?: string; locale?: string }) {
  if (!body.deviceId || (body.locale !== 'en' && body.locale !== 'vi')) {
    return json({ error: 'Invalid preferences' }, 400)
  }
  await env.DB.prepare(
    `INSERT INTO preferences (device_id, locale, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(device_id) DO UPDATE SET
       locale = excluded.locale,
       updated_at = excluded.updated_at`
  )
    .bind(body.deviceId, body.locale, new Date().toISOString())
    .run()
  return json({ ok: true, locale: body.locale })
}

async function handleApi(request: Request, env: Env) {
  const url = new URL(request.url)

  try {
    if (request.method === 'GET' && url.pathname === '/api/surveys') {
      return await listSurveys(env)
    }

    if (request.method === 'POST' && url.pathname === '/api/surveys/sync') {
      const body = (await request.json()) as SurveyBody
      return await upsertSurvey(env, body)
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/surveys/')) {
      const id = decodeURIComponent(url.pathname.slice('/api/surveys/'.length))
      if (!id) return json({ error: 'Missing id' }, 400)
      return await removeSurvey(env, id)
    }

    if (request.method === 'GET' && url.pathname === '/api/preferences') {
      return await getPreferences(env, url.searchParams.get('deviceId') ?? '')
    }

    if (request.method === 'PUT' && url.pathname === '/api/preferences') {
      const body = (await request.json()) as { deviceId?: string; locale?: string }
      return await putPreferences(env, body)
    }

    return json({ error: 'Not found' }, 404)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return json({ error: message }, 500)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env)
    }
    return env.ASSETS.fetch(request)
  }
}
