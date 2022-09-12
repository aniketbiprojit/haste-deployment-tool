import './config'
import { AllowedExecution, PersistentStore } from './persist'
import express from 'express'
import axios, { AxiosError } from 'axios'
import { sign, verify } from 'jsonwebtoken'
import { isAuthorizedMiddleware } from './utils'
import { join } from 'path'

import './pm2_log'
import { get_list, get_logs } from './pm2_log'
import cors from 'cors'
import { appendFileSync, readFileSync } from 'fs'
import { spawn } from 'child_process'

const port = process.env.PORT || 8080

export const store = new PersistentStore('master-thread')
export const servers = new PersistentStore<{ path: string }>('servers')

store.init(10000, [
	{
		data: {
			allowed_executions: [AllowedExecution.AddEmail],
			root_access: true,
		},
		uid: process.env.SUDO_EMAIL!,
	},
])

{
	let server_init_data
	try {
		server_init_data = JSON.parse(readFileSync(join(__dirname, '..', 'server_init_data.json'), 'utf-8').toString())
	} catch (err) {
		console.error('JSON init failed')
		server_init_data = []
	}
	servers.init(10000, server_init_data)
}
const local_store = new PersistentStore<string | { added_at: number }>('local-state')
local_store.init()

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const checkKeys = (keys: string[], obj: Object) => {
	for (let key of keys) {
		if (!obj.hasOwnProperty(key)) return false
	}
	return true
}

const secret = process.env.SECRET_KEY!

app.get('/auth', async (req, res) => {
	try {
		const jwt = req.headers.authorization!.split(' ')[1]
		const { email } = verify(jwt, secret) as { email: string }
		if (email) return res.status(200).send()
		else {
			return res.status(403).send('Internal server error')
		}
	} catch (err) {
		console.error(err)
		return res.status(500).send('Internal server error')
	}
})

app.get('/', async (req, res) => {
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
				const { access_token } = resp.data
				await local_store.write({ uid: code, data: access_token })
			}

			const access_token = local_store.read(code)

			let { email } = (
				await axios.get('https://api.github.com/user', {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				})
			).data

			if (email === null) {
				const data: { primary: boolean; email: string }[] = (
					await axios.get('https://api.github.com/user/emails', {
						headers: {
							Authorization: `Bearer ${access_token}`,
						},
					})
				).data

				const primary_email = data.filter((e) => e.primary)?.[0]?.email
				if (store.read(primary_email)) {
					email = primary_email
				} else {
					for (const { email: resp_email } of data) {
						if (store.read(resp_email)) {
							email = resp_email
							break
						}
					}
				}
			}

			const execution_data = store.read(email)
			if (!execution_data) {
				return res.status(401).send('You are not allowed to access this service')
			} else {
				const token = sign({ email }, secret)
				return res.send({ status: 'ok', token })
			}
		} else {
			return res.status(400).send({ error: 'bad request' })
		}
	} catch (err) {
		if (err instanceof AxiosError) {
			return res
				.status((err.response?.status as unknown as number) || 500)
				.send({ error: 'Failed', message: err?.response?.data })
		}
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

		if (email !== process.env.SUDO_EMAIL)
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

app.post(
	'/add-server',
	(req, res, next) => isAuthorizedMiddleware(req, res, next, AllowedExecution.AddServer),
	async (req, res) => {
		if (!checkKeys(['server', 'allowed_executions'], req.body)) {
			return res.status(400).send({ error: 'bad request' })
		}
		const { server_id, server_data } = req.body

		if (!servers.read(server_id)) {
			await servers.write({
				uid: server_id,
				data: server_data,
			})
		}
		return res.send({ status: 'ok' })
	}
)

app.get(
	'/running',
	(req, res, next) => isAuthorizedMiddleware(req, res, next, AllowedExecution.CheckDeploymentStatus),
	async (_req, res) => {
		try {
			return res.send(await get_list())
		} catch (err) {
			return res.status(500).send({ error: 'Failed' })
		}
	}
)

app.get(
	'/logs',
	(req, res, next) => isAuthorizedMiddleware(req, res, next, AllowedExecution.CheckDeploymentStatus),
	async (req, res) => {
		try {
			const { server_id, lines, log_from_line, error_from_line } = req.query as {
				server_id: string
				lines?: string
				log_from_line?: string
				error_from_line?: string
			}

			const server_logs_public = servers.read(server_id)

			if (server_logs_public)
				return res.send(await get_logs({ name: server_id, lines, log_from_line, error_from_line }))
			return res.status(400).send('Bad Request')
		} catch (err) {
			console.error(err)
			return res.status(500).send({ error: 'Failed' })
		}
	}
)

app.get(
	'/deploy',
	async (req, res, next) => isAuthorizedMiddleware(req, res, next, AllowedExecution.Deploy),
	async (req, res) => {
		try {
			const { server_id } = req.query as { server_id: string }
			const server = servers.read(server_id)
			const child_process = spawn(join(server.path, 'deploy.haste.sh'))

			const { log_file, error_file } = await get_logs({
				name: server_id,
			})
			child_process.on('message', (message) => {
				console.log({ message }, log_file)
			})

			child_process.on('error', (message) => {
				console.error({ message }, error_file)
			})

			child_process.stdout.on('data', (message) => {
				appendFileSync(log_file, message.toString())
			})

			child_process.stdout.on('error', (message) => {
				appendFileSync(error_file, message.toString())
			})

			child_process.on('exit', (code) => {
				appendFileSync(error_file, code?.toString() ?? 'Unknown Error')
			})

			res.send('ok')
		} catch (err) {
			console.error(err)
		}
	}
)

app.get(
	'/users',
	(req, res, next) => isAuthorizedMiddleware(req, res, next, AllowedExecution.ViewUsers),
	async (_req, res) => {
		res.send(store.get_hashmap_state().data)
	}
)

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
	setInterval(() => {
		const hashmap_state = local_store.get_hashmap_state()
		for (const key in hashmap_state) {
			local_store.write({ uid: key, data: '' })
		}
	}, 60_000)
	// fbf4560b0d3fa06de32a: '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'
})
