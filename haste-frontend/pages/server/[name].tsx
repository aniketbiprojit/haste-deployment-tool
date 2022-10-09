// next js component with name slug

import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getAPI, getHeaders } from '../../utils/getAPI'
import styles from '../../styles/Home.module.css'
import { Nav } from '../../components/Nav'
// import { CodeMirrorComponent } from '../../components/CodeMirror'

const ServerData = () => {
	const { isReady, query, beforePopState } = useRouter()
	const [logData, setLogData] = useState<{
		errors: string
		logs: string
		total_errors_len: number
		total_logs_len: number
	}>()
	const getLogs = useCallback(async () => {
		const url = getAPI('logs')

		url.searchParams.set('server_id', query.name as string)

		if (logData?.total_errors_len) {
			url.searchParams.set('error_from_line', logData.total_errors_len.toString())
		}

		if (logData?.total_logs_len) {
			url.searchParams.set('log_from_line', logData.total_logs_len.toString())
		}

		const processes = await fetch(url, {
			headers: getHeaders(),
		})
		const data: { errors: string; logs: string; total_logs_len: number; total_errors_len: number } =
			await processes.json()

		setLogData((_logData) => ({
			...data,
			logs: (_logData?.logs ?? '') + data.logs,
			errors: (_logData?.errors ?? '') + data.errors,
		}))
	}, [query, logData])

	const [poll, setPoll] = useState<number>(-1)

	useEffect(() => {
		if (isReady && query.name) getLogs()
	}, [isReady, getLogs, query.name])

	const [, setCounter] = useState(0)
	const [called, setCalled] = useState(false)
	let logsCalled = useRef<boolean>(false)

	const logRef = useRef<HTMLDivElement>(null)
	const errorRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (logData?.logs && logRef.current) {
			logRef.current.scrollTop = logRef.current.scrollHeight
		}
		if (logData?.errors && errorRef.current) {
			errorRef.current.scrollTop = errorRef.current.scrollHeight
		}

		if (isReady && logData?.logs !== undefined && logData?.errors !== undefined) {
			if (poll === -1) {
				const poll_interval = setInterval(async () => {
					setCounter((counter) => counter + 1)
					if (logsCalled.current === false) {
						logsCalled.current = true
						getLogs().finally(() => {
							logsCalled.current = false
						})
					}
				}, 10_000) as unknown as number

				setPoll(poll_interval as any)
			}
		}
	}, [logData, poll, isReady, getLogs])

	beforePopState(() => {
		clearInterval(poll)
		return true
	})
	return (
		<>
			<div className={styles.container}>
				<>
					<Nav />

					<div className={styles.inner + ` my-5`}>
						<button
							onClick={async () => {
								setCalled(true)
								if (called === false) {
									try {
										const url = getAPI(
											`deploy?server_id=${query.name}&type=${
												(query.name as string).includes('frontend') ? 'frontend' : 'backend'
											}`
										)
										await fetch(url, {
											headers: getHeaders(),
										})
									} catch (err) {
										console.error(err)
									}
									setCalled(false)
								}
							}}
							className='inline-flex items-center py-2 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
						>
							Deploy
						</button>

						<div className='my-5'>
							<div
								ref={logRef}
								style={{ height: '480px', width: '80vw', overflowY: 'scroll' }}
								className='border w-full  rounded p-5'
							>
								<pre>
									<code>
										{logData?.logs
											.replaceAll(String.fromCharCode(27), '')
											.replaceAll(new RegExp(/\[[0-9]*m/g), '') ?? ''}
									</code>
								</pre>
							</div>
						</div>

						<div className='my-5'>
							<div
								ref={errorRef}
								style={{ height: '480px', width: '80vw', overflowY: 'scroll' }}
								className='border w-full rounded p-5'
							>
								<pre>
									<code>
										{logData?.errors
											.replaceAll(String.fromCharCode(27), '')
											.replaceAll(new RegExp(/\[[0-9]*m/g), '') ?? ''}
									</code>
								</pre>
							</div>
						</div>
					</div>
				</>
			</div>
		</>
	)
}

export default ServerData
