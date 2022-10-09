import Head from 'next/head'
import Image from 'next/image'

export const Authorize: React.FC = () => {
	return (
		<>
			<Head>
				<title>Authorization | Haste Deployment API</title>
				<meta name='description' content='This is a simple API to monitor your projects on a server.' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className='flex h-screen'>
				<div className='m-auto'>
					<div
						style={{ width: '800px' }}
						className='w-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700'
					>
						<div className='flex flex-col items-center py-10'>
							<Image
								height='96px'
								width='96px'
								className='mb-3 w-24 h-24 rounded-full shadow-lg'
								src='/logo.png'
								alt='haste-logo'
							/>
							<h5 className='mb-1 text-xl font-medium text-gray-900 dark:text-white'>
								Haste Deployment API
							</h5>
							<span className='text-sm text-gray-500 dark:text-gray-400'>Scope: Email, Username</span>
							<div className='flex mt-4 space-x-3 md:mt-6'>
								<a
									href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=read:user,user:email`}
									className='inline-flex items-center py-2 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
								>
									Authorize with GitHub
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
