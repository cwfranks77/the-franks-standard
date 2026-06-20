/**
 * Register all background job handlers with the queue manager.
 */
const { registerJob } = require('./queue.js')
const sendEmailJob = require('./send_email_job.js')
const processCoaJob = require('./process_coa_job.js')
const generateReportsJob = require('./generate_reports_job.js')
const cleanupLogsJob = require('./cleanup_logs_job.js')

registerJob('send_email', sendEmailJob)
registerJob('process_coa', processCoaJob)
registerJob('generate_reports', generateReportsJob)
registerJob('cleanup_logs', cleanupLogsJob)

module.exports = { registerJob }
