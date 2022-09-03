import { AllowedExecution } from './persist'
import { NextFunction, Request, Response } from 'express'
import { store } from './index'
import { JsonWebTokenError, verify } from 'jsonwebtoken'

const secret = process.env.SECRET_KEY!

export const isAuthorizedMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
	execution: AllowedExecution
) => {
	try {
		if (req.headers.authorization) {
			const jwt = req.headers.authorization!.split(' ')[1]
			const { email } = verify(jwt, secret) as { email: string }
			if (isAuthorized(email, execution)) {
				next()
				return
			} else {
				return res.status(403).send('Forbidden')
			}
		}
		return res.status(401).send('Unauthorized')
	} catch (err) {
		if (err instanceof JsonWebTokenError) {
			console.error(err)
			return res.status(401).send('JWT malformed or expired')
		} else console.error(err)
		return res.status(500).send('Internal server error')
	}
}
export const isAuthorized = (email: string, execution: AllowedExecution) => {
	const data = store.read(email)
	if (!data) return false
	return data.allowed_executions.includes(execution) || data.root_access === true
}
