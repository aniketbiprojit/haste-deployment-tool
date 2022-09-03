// next js component with name slug

import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { getAPI, getHeaders } from '../../utils/getAPI'

const ServerData = () => {
	const { isReady, query } = useRouter()

	let call_made = false

	const getLogs = async () => {
		if (call_made === false) {
			call_made = true

			const url = getAPI('logs')

			url.searchParams.set('server_id', query.name as string)
			const processes = await fetch(url, {
				headers: getHeaders(),
			})
			const data: { errors: string; logs: string } = await processes.json()

			setLogData(data)
		}
	}

	const [logData, setLogData] = useState<{ errors: string; logs: string }>()

	useEffect(() => {
		if (isReady && query.name) getLogs()
	}, [isReady])

	const logRef = useRef<HTMLTextAreaElement>(null)
	const errorRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		if (logData?.logs && logRef.current) {
			logRef.current.scrollTop = logRef.current.scrollHeight
		}
		if (logData?.errors && errorRef.current) {
			errorRef.current.scrollTop = errorRef.current.scrollHeight
		}
	}, [logData])
	return (
		<>
			{
				<textarea
					ref={logRef}
					rows={20}
					style={{ width: '450px' }}
					onChange={() => {}}
					value={logData?.logs ?? ''}
				/>
			}

			{
				<textarea
					ref={errorRef}
					rows={20}
					style={{ width: '450px' }}
					onChange={() => {}}
					value={logData?.errors ?? ''}
				/>
			}
		</>
	)
}

export default ServerData
