import debug from 'debug'
import {Router} from 'express'
import wrap from 'express-async-wrap'
import HTTPError from 'node-http-error'

import DB from '../../lib/DB'

const log = debug('jobs')
const router = new Router()

//get jobs by their jobId
router.get('/:jobId', wrap(async (req, res, next) => {
	log('/jobs/:jobId')
	const db = await DB.get()
	let job = await db.collections.job.findOne({
		id: req.params.jobId
	})
	if( ! job ) {
		throw new HTTPError(404, 'no job found with this id')
	}
	res.json(job)
}))

export default router
