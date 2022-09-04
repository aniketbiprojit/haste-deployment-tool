// next js component with name slug

import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { getAPI, getHeaders } from '../../utils/getAPI'
import styles from '../../styles/Home.module.css'

const ServerData = () => {
	const { isReady, query } = useRouter()

	const getLogs = async () => {
		// if (call_made === false) {
		// call_made = true

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
	}

	const [logData, setLogData] = useState<{
		errors: string
		logs: string
		total_errors_len: number
		total_logs_len: number
	}>()
	const [poll, setPoll] = useState<number>(-1)

	useEffect(() => {
		if (isReady && query.name) getLogs()
	}, [isReady])

	const [, setCounter] = useState(0)

	const logRef = useRef<HTMLTextAreaElement>(null)
	const errorRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		if (logData?.logs && logRef.current) {
			logRef.current.scrollTop = logRef.current.scrollHeight
		}
		if (logData?.errors && errorRef.current) {
			errorRef.current.scrollTop = errorRef.current.scrollHeight
		}

		if (isReady && logData?.logs !== undefined && logData?.errors !== undefined) {
			if (poll === -1) {
				console.log('polling')

				const poll_interval = setInterval(() => {
					setCounter((counter) => counter + 1)
					getLogs()
				}, 5_000)

				setPoll(poll_interval as any)
			}
		}
	}, [logData, poll, isReady])

	return (
		<>
			<div className={styles.container}>
				<>
					<div className={styles.inner}>
						<div className=''>
							<textarea
								ref={logRef}
								rows={20}
								style={{ width: '450px' }}
								onChange={() => {}}
								value={
									logData?.logs
										.slice(20)
										.replaceAll(String.fromCharCode(27), '')
										.replaceAll(new RegExp(/\[[0-9]*m/g), '') ?? ''
								}
							/>
						</div>

						<div className=''>
							<textarea
								ref={errorRef}
								rows={20}
								style={{ width: '450px' }}
								onChange={() => {}}
								value={
									logData?.errors
										.slice(20)
										.replaceAll(String.fromCharCode(27), '')
										.replaceAll(new RegExp(/\[[0-9]*m/g), '') ??
									'' ??
									''
								}
							/>
						</div>
					</div>
				</>
			</div>
		</>
	)
}

export default ServerData
