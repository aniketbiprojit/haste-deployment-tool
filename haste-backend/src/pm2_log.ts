import { readFileSync } from 'fs'
import API from 'pm2'

export const get_list = async () => {
	return new Promise<any[]>((resolve, reject) => {
		API.connect((err) => {
			if (err !== null) {
				console.error(err, 'err')
				reject(err)
			}
			API.list((err, list) => {
				if (err !== null) {
					console.error(err)
					reject(err)
				}
				resolve([
					...list.map((x) => ({
						...x,
						pm2_env: {
							status: x?.['pm2_env']?.status,
						},
						versioning: (x?.['pm2_env'] as any)?.versioning ?? {},
					})),
				])
			})
		})
	})
}

export const get_logs = async ({
	name,
	lines = '100',
	log_from_line,
	error_from_line,
}: {
	name: string
	lines?: string
	log_from_line?: string
	error_from_line?: string
}) => {
	return new Promise<{
		logs: string
		errors: string
		total_logs_len: number
		total_errors_len: number
		log_file: string
		error_file: string
	}>((resolve, reject) => {
		API.connect((err) => {
			if (err !== null) {
				console.error(err, 'err')
				reject(err)
			}
			API.list((err, list) => {
				if (err !== null) {
					console.error(err)
					reject(err)
				}
				const list_item = list.filter((elem) => elem.name === name)[0]
				const log_path = list_item.pm2_env!.pm_out_log_path!
				const err_path = list_item.pm2_env!.pm_err_log_path!

				const total_logs = readFileSync(log_path).toString().split('\n')
				let logs = total_logs.slice(-parseInt(lines))

				if (log_from_line && !isNaN(parseInt(log_from_line))) {
					logs = total_logs.slice(parseInt(log_from_line), total_logs.length)
				}

				const total_errors = readFileSync(err_path).toString().split('\n')
				let errors = total_errors.slice(-parseInt(lines))

				if (error_from_line && !isNaN(parseInt(error_from_line))) {
					errors = total_errors.slice(parseInt(error_from_line), total_errors.length)
				}

				resolve({
					total_errors_len: total_errors.length,
					total_logs_len: total_logs.length,
					logs: logs.join('\n'),
					errors: errors.join('\n'),
					log_file: log_path,
					error_file: err_path,
				})
			})
		})
	})
}
