import { copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as crypto from 'crypto'
import { deflateSync, inflateSync } from 'zlib'

const db_dir = join(__dirname, '..', 'db_dir')

if (!existsSync(db_dir)) {
	mkdirSync(db_dir)
}

const lockfile_location = join(db_dir, 'store.lock')
const db_location = join(db_dir, 'store.db')
const cache_db_location = join(db_dir, 'cache.store.db')

enum AllowedExecution {}

type DataState = {
	root_access: boolean
	allowed_executions: AllowedExecution[]
}

class JSONParseFail extends Error {
	constructor() {
		super('JSON parse failed')
	}
}

export class PersistentStore {
	static hashmap_state: {
		[key: string]: DataState
	} = {}

	static is_debug = true
	static _name = ''
	static debug(...args: any[]) {
		if (this.is_debug) {
			console.debug('[DEBUG]', this._name, ...args)
		}
	}

	static is_executing = false

	static init_status = false

	static create_lock(uid: string) {
		writeFileSync(lockfile_location, uid)
	}

	static remove_lock() {
		if (existsSync(lockfile_location)) unlinkSync(lockfile_location)
	}

	static can_execute() {
		if (existsSync(lockfile_location)) {
			return false
		}
		return true
	}

	static read(uid: string) {
		this.debug('read')

		// returns old value
		// eventually consistent
		return this.hashmap_state[uid]
	}

	static init(polling_interval = 10_000) {
		if (this.init_status) {
			this.debug('init')
			this.poll()

			setInterval(() => {
				this.poll()
			}, polling_interval)
		}
		this.init_status = true
	}

	private static poll() {
		this.debug('poll')
		try {
			if (existsSync(db_location)) {
				if (this.can_execute() && this.is_executing === false) {
					this.create_lock('init')
					this.is_executing = true

					try {
						this.hashmap_state = JSON.parse(inflateSync(readFileSync(db_location)).toString())
					} catch (err) {
						this.debug('poll error', err)

						if (this.init_status === true) {
							if (existsSync(cache_db_location)) {
								try {
									this.hashmap_state = JSON.parse(
										inflateSync(readFileSync(cache_db_location)).toString()
									)
									copyFileSync(cache_db_location, db_location)
								} catch (err) {
									this.debug('cache missing', err)
									throw new JSONParseFail()
								}
							}
						} else {
							throw new JSONParseFail()
						}
					}

					this.is_executing = false
					this.remove_lock()
				}
			}
		} catch (err) {
			if (err instanceof JSONParseFail) {
				this.debug('json parse error')
				writeFileSync(db_location, deflateSync(JSON.stringify(this.hashmap_state)))
			} else {
				this.hashmap_state = {}
			}
			this.remove_lock()
		}
	}

	static async write({
		uid = crypto.randomBytes(16).toString('hex'),
		data,
	}: {
		uid: string
		data: DataState
	}): Promise<void> {
		if (this.can_execute() && this.is_executing === false) {
			this.create_lock(uid)
			this.debug('write')

			this.is_executing = true

			this.hashmap_state[uid] = data

			writeFileSync(cache_db_location, deflateSync(JSON.stringify(this.hashmap_state)))
			writeFileSync(db_location, deflateSync(JSON.stringify(this.hashmap_state)))

			copyFileSync(cache_db_location, db_location)

			this.is_executing = false
			this.remove_lock()
		} else {
			this.debug('retry write')

			await new Promise((resolve) => {
				setTimeout(() => {
					resolve({})
					this.write({ uid, data })
				}, 5000)
			})
		}
	}
}
PersistentStore.init()
