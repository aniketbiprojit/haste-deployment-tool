import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Nav } from '../components/Nav'
import styles from '../styles/Home.module.css'
import { getAPI, getHeaders } from '../utils/getAPI'

const Home: NextPage = () => {
	const { isReady } = useRouter()

	let call_made = false

	const listProcesses = async () => {
		if (call_made === false) {
			call_made = true

			const processes = await fetch(getAPI('running'), {
				headers: getHeaders(),
			})
			const data: { name: string; pm2_env?: { status?: string } }[] = await processes.json()

			setProcesses(
				data.map((elem) => {
					return {
						name: elem.name,
						status: elem.pm2_env?.status ?? 'unknown',
					}
				})
			)
		}
	}

	const [processes, setProcesses] = useState<{ name: string; status: string }[]>([])

	useEffect(() => {
		if (isReady) listProcesses()
	}, [isReady])

	return (
		<div className={styles.container}>
			<Head>
				<title>Haste Deployment API</title>
				<meta name='description' content='This is a simple API to monitor your projects on a server.' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<Nav />
			<div className=''>
				<h1 className='text-3xl font-bold'>Haste Deployment API</h1>
				<p className='text-gray-500'>This is a simple API to monitor your projects on a server.</p>
				{processes.map((elem, idx) => {
					return (
						<>
							<Link key={idx} href={`/server/${elem.name}`}>
								<p className='text-xl font-bold'>
									{elem.name?.toUpperCase()} - <span className='text-gray-500'>{elem.status}</span>
								</p>
							</Link>
						</>
					)
				})}
			</div>
		</div>
	)
}

export default Home
