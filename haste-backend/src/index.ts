import './config'
import { AllowedExecution, PersistentStore } from './persist'
import express from 'express'
import axios from 'axios'
import { sign } from 'jsonwebtoken'
import { isAuthorizedMiddleware } from './utils'

const port = process.env.PORT || 8080

export const store = new PersistentStore('master-thread')
export const servers = new PersistentStore<{ path: string }>('servers')

store.init(10000, {
	data: {
		allowed_executions: [0],
		root_access: true,
	},
	uid: process.env.SUDO_EMAIL!,
})

servers.init(10000, {
	uid: 'server1',
	data: {
		path: '/Users/aniketchowdhury/Work/zoho-server',
	},
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

app.get(
	'/logs',
	(req, res, next) => isAuthorizedMiddleware(req, res, next, AllowedExecution.CheckDeploymentStatus),
	async (req, res) => {
		const { server_id } = req.query as { server_id: string }

		const server_logs = servers.read(server_id)

		console.log(server_logs, server_id)
		if (server_logs) return res.send(server_logs)
		return res.status(400).send('Bad Request')
	}
)

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
