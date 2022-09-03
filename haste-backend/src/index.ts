import { AllowedExecution, PersistentStore } from './persist'
import express from 'express'
import { config } from 'dotenv'
import { join } from 'path'
import axios from 'axios'
import { sign } from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { isAuthorizedMiddleware } from './utils'
config({
	path: join(__dirname, '..', '.env'),
})

const port = process.env.PORT || 8080

export const store = new PersistentStore('master-thread')

store.init(10000, {
	data: {
		allowed_executions: [0],
		root_access: true,
	},
	uid: process.env.SUDO_EMAIL!,
})

const local_store = new PersistentStore<string>('local-state')
local_store.init()

const app = express()

app.use(express.json())

const checkKeys = (keys: string[], obj: Object) => {
	for (let key of keys) {
		if (!obj.hasOwnProperty(key)) return false
	}
	return true
}

const secret = process.env.SECRET_KEY!

app.get('/', async (req, res) => {
	console.log(req.query)
	try {
		if (checkKeys(['redirect', 'auth', 'code'], req.query)) {
			const { code } = req.query as { code: string }
			if (!local_store.read(code)) {
				const resp = await axios.post<{
					access_token: string
					token_type: string
					scope: string
				}>(
					'https://github.com/login/oauth/access_token',
					{
						client_id: process.env.GITHUB_CLIENT_ID,
						client_secret: process.env.GITHUB_CLIENT_SECRET,
						code: req.query.code,
					},
					{
						headers: {
							Accept: 'application/json',
						},
					}
				)
				const { access_token, scope, token_type } = resp.data
				await local_store.write({ uid: code, data: access_token })
			}

			const access_token = local_store.read(code)

			const { email } = (
				await axios.get('https://api.github.com/user', {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				})
			).data

			await store.write({
				uid: process.env.SUDO_EMAIL!,
				data: {
					root_access: true,
					allowed_executions: [],
				},
			})

			const execution_data = store.read(email)
			if (!execution_data) {
				return res.status(401).send('You are not allowed to access this service')
			} else {
				const token = sign({ email }, secret)
				return res.send({ status: 'ok', execution_data: token })
			}
		} else {
			return res.status(400).send({ error: 'bad request' })
		}
	} catch (err) {
		console.error(err)
		return res.status(500).send({ error: 'Failed' })
	}
})

app.post(
	'/add-email',
	(req, res, next) => isAuthorizedMiddleware(req, res, next, AllowedExecution.AddEmail),
	async (req, res) => {
		if (!checkKeys(['email', 'allowed_executions'], req.body)) {
			return res.status(400).send({ error: 'bad request' })
		}
		const { email, allowed_executions } = req.body

		await store.write({
			uid: email,
			data: {
				allowed_executions,
				root_access: false,
			},
		})
		return res.send({ status: 'ok' })
	}
)

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
