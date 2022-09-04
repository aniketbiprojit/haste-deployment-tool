import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Nav } from '../components/Nav'
import { getAPI, getHeaders } from '../utils/getAPI'
import styles from '../styles/Home.module.css'
import { AllowedExecution, DataState } from '../utils/types'

const Users: React.FC = () => {
	const [users, setUsers] = useState<{ [key: string]: DataState }>({})
	const [update, setUpdate] = useState(0)
	const increment = () => setUpdate((u) => u + 1)
	const getUsers = async () => {
		const url = getAPI('users')
		const data = await fetch(url, {
			headers: getHeaders(),
		})

		const users = (await data.json()) as { [key: string]: DataState }
		setUsers(users)
	}
	useEffect(() => {
		getUsers()
	}, [update])
	return (
		<>
			<Head>
				<title>Users | Haste Deployment API</title>
				<meta name='description' content='This is a simple API to monitor your projects on a server.' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className={styles.container}>
				<Nav />
				<h1 className='text-center  py-1 text-3xl font-bold'>Users</h1>
				<div className={styles.inner}>
					<table
						style={{ maxWidth: '800px' }}
						className='w-full text-sm text-left text-gray-500 dark:text-gray-400'
					>
						<thead className='text-xs'>
							<tr className='uppercase font-medium'>
								<th scope='col' className='py-3 px-6'>
									Users
								</th>
								<th scope='col' className='py-3 px-6'>
									Execution Roles
								</th>
								<th scope='col' className='py-3 px-6'>
									Action
								</th>
							</tr>
						</thead>
						<tbody>
							{Object.keys(users)
								.sort((a) => {
									return users[a].root_access ? -1 : 1
								})
								.map((user, idx) => {
									return (
										<>
											<tr
												key={idx}
												className={`${styles.serverItem} relative py-3 px-4 my-4 rounded border-collapse shadow-md `}
											>
												<th className='py-3 px-6'>{user}</th>

												<td className='py-3 px-6'>
													{users[user].root_access
														? `Sudo, ${(
																Object.keys(AllowedExecution) as unknown as [
																	keyof typeof AllowedExecution
																]
														  )
																.map((x) => AllowedExecution[x])
																.join(', ')}`
														: users[user].allowed_executions.join(', ')}
												</td>

												<td className='py-3 px-6'>
													{!users[user].root_access && (
														<button
															type='button'
															className='focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900'
														>
															Delete
														</button>
													)}
												</td>
											</tr>
										</>
									)
								})}
							{<AddUser increment={increment} />}
						</tbody>
					</table>
				</div>
			</div>
		</>
	)
}

export default Users

const AddUser: React.FC<{ increment: Function }> = ({ increment }) => {
	const [executions, setExecutions] = useState<AllowedExecution[]>([])
	const [email, setEmail] = useState('')

	return (
		<tr className={`${styles.serverItem} relative py-3 px-4 my-4 rounded border-collapse shadow-md `}>
			<th className='py-3 px-6 flex'>
				<div>
					<label
						htmlFor='email'
						className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'
					></label>
					<input
						onChange={(e) => setEmail(e.target.value)}
						type='email'
						id='email'
						className='bg-gray-50 font-medium border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
						placeholder='Email'
						required
					/>
				</div>
			</th>

			<td className='py-3 px-6'>
				{(Object.keys(AllowedExecution) as unknown as [keyof typeof AllowedExecution]).map((x) => (
					<div key={x} className='flex items-center mb-1'>
						<input
							id={x}
							onClick={() => {
								setExecutions((executions) => {
									if (executions?.includes(AllowedExecution[x])) {
										return executions.filter((execution) => execution !== AllowedExecution[x])
									} else {
										return [...executions, AllowedExecution[x]]
									}
								})
							}}
							checked={executions.includes(AllowedExecution[x])}
							type='checkbox'
							className='w-3 h-3 mr-1'
						/>
						<label htmlFor={x} className='text-gray-700 dark:text-gray-200'>
							{AllowedExecution[x]}
						</label>
					</div>
				))}
			</td>

			<td className='py-3 px-6'>
				<form
					onSubmit={async (e) => {
						e.preventDefault()
						await fetch(getAPI('add-email'), {
							body: JSON.stringify({
								email,
								allowed_executions: executions,
							}),
							headers: {
								Accept: 'application/json',
								'Content-Type': 'application/json',
								...getHeaders(),
							},
							method: 'POST',
						})
						increment()
					}}
				>
					<button
						type='submit'
						className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
					>
						Add
					</button>
				</form>
			</td>
		</tr>
	)
}
