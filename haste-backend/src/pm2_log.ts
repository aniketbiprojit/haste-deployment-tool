import { spawnSync } from 'child_process'
import API from 'pm2'

export const get_list = async () => {
	return new Promise<any[]>((resolve, reject) => {
		API.connect((err) => {
			console.error(err, 'err')
			if (err !== null) reject(err)
			API.list((err, list) => {
				if (err !== null) {
					console.error(err)
					reject(err)
				}
				resolve([...list.map((x) => ({ ...x, pm2_env: { status: x?.['pm2_env']?.status } }))])
			})
		})
	})
}

export const get_logs = async (name: string, lines: string | number = 100) => {
	return new Promise<{ logs: string; errors: string }>((resolve, reject) => {
		API.connect((err) => {
			console.error(err, 'err')
			if (err !== null) reject(err)
			API.list((err, list) => {
				if (err !== null) {
					console.error(err)
					reject(err)
				}
				const list_item = list.filter((elem) => elem.name === name)[0]
				const log_path = list_item.pm2_env!.pm_out_log_path!
				const err_path = list_item.pm2_env!.pm_err_log_path!

				const logs = spawnSync('tail', ['-n', lines.toString(), log_path]).stdout.toString()
				const errors = spawnSync('tail', ['-n', lines.toString(), err_path]).stdout.toString()
				resolve({ logs, errors })
			})
		})
	})
}
