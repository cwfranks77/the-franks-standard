/**
 * Background job queue — retries, persistence, failure logging.
 */

const HANDLERS = {}

function registerJob (type, handler) {
  HANDLERS[type] = handler
}

async function enqueue (admin, { jobType, payload = {}, maxAttempts = 3, scheduledAt = null }) {
  const row = {
    job_type: jobType,
    payload,
    status: 'pending',
    max_attempts: maxAttempts,
    scheduled_at: scheduledAt || new Date().toISOString(),
  }

  if (admin) {
    const { data, error } = await admin.from('background_jobs').insert(row).select('id').single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, job_id: data.id }
  }

  const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2)}`
  memoryQueue.push({ id, ...row, attempts: 0 })
  return { ok: true, job_id: id }
}

const memoryQueue = []

async function logFailure (admin, { jobId, jobType, errorMessage, payload, attempts }) {
  if (!admin) return
  await admin.from('job_failures').insert({
    job_id: jobId,
    job_type: jobType,
    error_message: String(errorMessage).slice(0, 4000),
    payload,
    attempts,
  })
}

async function processOne (admin, job) {
  const handler = HANDLERS[job.job_type]
  if (!handler) throw new Error(`unknown_job_type:${job.job_type}`)

  if (admin && job.id && !String(job.id).startsWith('mem-')) {
    await admin.from('background_jobs').update({
      status: 'processing',
      started_at: new Date().toISOString(),
      attempts: (job.attempts || 0) + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', job.id)
  }

  await handler(admin, job.payload || {})

  if (admin && job.id && !String(job.id).startsWith('mem-')) {
    await admin.from('background_jobs').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', job.id)
  }
}

async function processNext (admin, limit = 5) {
  let jobs = []

  if (admin) {
    const { data } = await admin
      .from('background_jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(limit)
    jobs = data ?? []
  } else {
    jobs = memoryQueue.splice(0, limit)
  }

  const results = []
  for (const job of jobs) {
    try {
      await processOne(admin, job)
      results.push({ job_id: job.id, ok: true })
    } catch (e) {
      const attempts = (job.attempts || 0) + 1
      const maxAttempts = job.max_attempts || 3
      const errMsg = e?.message || String(e)

      await logFailure(admin, {
        jobId: job.id,
        jobType: job.job_type,
        errorMessage: errMsg,
        payload: job.payload,
        attempts,
      })

      if (admin && job.id && !String(job.id).startsWith('mem-')) {
        const status = attempts >= maxAttempts ? 'dead' : 'failed'
        await admin.from('background_jobs').update({
          status,
          attempts,
          last_error: errMsg,
          scheduled_at: new Date(Date.now() + attempts * 60_000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', job.id)

        if (status === 'failed') {
          await admin.from('background_jobs').update({ status: 'pending' }).eq('id', job.id)
        }
      }

      results.push({ job_id: job.id, ok: false, error: errMsg })
    }
  }

  return results
}

function getQueueStatus () {
  return {
    registered_handlers: Object.keys(HANDLERS),
    in_memory_pending: memoryQueue.length,
  }
}

module.exports = {
  registerJob,
  enqueue,
  processNext,
  processOne,
  getQueueStatus,
  HANDLERS,
}
