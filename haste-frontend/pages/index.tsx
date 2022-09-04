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
			const data: {
				name: string
				pm2_env?: { status?: string }
				versioning?: {
					revision: string
				}
			}[] = await processes.json()

			setProcesses(
				data.map((elem) => {
					return {
						name: elem.name,
						status: elem.pm2_env?.status ?? 'unknown',
						versioning: elem?.versioning,
					}
				})
			)
		}
	}

	const [processes, setProcesses] = useState<
		{
			name: string
			status: string
			versioning?: {
				revision: string
			}
		}[]
	>([])

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
			<div className={styles.inner}>
				<h1 className='text-center  py-1 text-3xl font-bold'>
					<span className='logo-font font-medium'>HASTE</span> Deployment API
				</h1>
				<p className='text-center py-1 text-gray-500 pb-4'>
					This is a simple API to monitor your projects on a server.
				</p>
				<table
					style={{ maxWidth: '800px' }}
					className='w-full text-sm text-left text-gray-500 dark:text-gray-400'
				>
					<thead className='text-xs'>
						<tr className='uppercase font-medium'>
							<th scope='col' className='py-3 px-6'>
								Server name
							</th>
							<th scope='col' className='py-3 px-6'>
								Status
							</th>
							<th scope='col' className='py-3 px-6'>
								Version
							</th>
							<th scope='col' className='py-3 px-6'>
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{processes.map((elem, idx) => {
							return (
								<>
									<tr
										key={idx}
										className={`${styles.serverItem} relative py-3 px-4 my-4 rounded border-collapse shadow-md `}
									>
										<th className='py-4 px-6'>{elem.name}</th>
										<td className='flex items-center py-4 px-6'>
											<div
												className={`w-2 h-2 ${
													elem.status === 'online' ? 'bg-green-400' : 'bg-red-400'
												} rounded-full`}
											>
												&nbsp;
											</div>
											&nbsp;{elem.status}
										</td>
										<td className='py-4 px-6'>{elem.versioning?.revision.slice(0, 7)}</td>
										<td className='py-4 px-6'>
											<Link href={`/server/${elem.name}`}>
												<span className='inline-flex items-center text-blue-600 hover:underline right-0'>
													<svg
														className=' w-5 h-5'
														fill='currentColor'
														viewBox='0 0 20 20'
														xmlns='http://www.w3.org/2000/svg'
													>
														<path d='M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z'></path>
														<path d='M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z'></path>
													</svg>
													Logs
												</span>
											</Link>
										</td>
									</tr>
								</>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default Home
