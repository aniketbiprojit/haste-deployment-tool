import { useState } from 'react'

export const Nav: React.FC = () => {
	const [dropdown, setDropdown] = useState(false)
	return (
		<>
			<div>
				<nav className='bg-transparent border-gray-200 px-2 sm:px-4 py-2.5 rounded'>
					<div className='container relative flex flex-wrap justify-between items-center mx-auto'>
						<a href='https://flowbite.com/' className='flex items-center'>
							<img src='/logo.png' className='mr-3 h-10' alt='Flowbite Logo' />
							<span className='logo-font self-center text-xl font-semibold whitespace-nowrap dark:text-white'>
								HASTE
							</span>
						</a>
						<button
							onClick={() => setDropdown((dropdown) => !dropdown)}
							data-collapse-toggle='navbar-default'
							type='button'
							className='inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
							aria-controls='navbar-default'
							aria-expanded='false'
						>
							<span className='sr-only'>Open main menu</span>
							<svg
								className='w-6 h-6'
								aria-hidden='true'
								fill='currentColor'
								viewBox='0 0 20 20'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									fillRule='evenodd'
									d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
									clipRule='evenodd'
								></path>
							</svg>
						</button>
						<div
							className={`${
								!dropdown ? 'hidden' : 'absolute z-10'
							} md:static bg-added translate-y-10 w-full md:block md:w-auto`}
							id='navbar-default'
						>
							<ul className='flex flex-col p-4 mt-4 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0  dark:border-gray-700'>
								<li onClick={() => setDropdown(false)}>
									<a
										href='#'
										className='block py-2 pr-4 pl-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white'
										aria-current='page'
									>
										Home
									</a>
								</li>
								<li
									onClick={() => {
										setDropdown(false)
										localStorage.clear()
										window.location.reload()
									}}
								>
									<a
										href='#'
										className='block py-2 pr-4 pl-3 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'
									>
										Logout
									</a>
								</li>
							</ul>
						</div>
					</div>
				</nav>
			</div>
		</>
	)
}
