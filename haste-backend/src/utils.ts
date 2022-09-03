import { AllowedExecution } from './persist'
import { NextFunction, Request, Response } from 'express'
import { store } from './index'
import { verify } from 'jsonwebtoken'

const secret = process.env.SECRET_KEY!

export const isAuthorizedMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
	execution: AllowedExecution
) => {
	const { email } = verify(req.headers.authorization!, secret) as { email: string }
	if (isAuthorized(email, execution)) {
		next()
	} else {
		res.status(401).send('Unauthorized')
	}
}
const isAuthorized = (email: string, execution: AllowedExecution) => {
	const data = store.read(email)
	if (!data) return false
	return data.allowed_executions.includes(execution) || data.root_access === true
}
