import debug from 'debug'
import {Router} from 'express'
import wrap from 'express-async-wrap'

import DB from '../../lib/DB'

const log = debug('analyses')
const router = new Router()

//get analyses by their imageId
router.get('/:imageId', wrap(async (req, res) => {
	log('/analyses/:imageId')
	const db = await DB.get()
	let analyses = await db.collections.analysis.find({
		imageId: req.params.imageId
	})
	res.json(analyses)
}))

export default router
