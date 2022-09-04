import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider, AuthState, useAuth } from '../hooks/useAuth'
import { Authorize } from '../components/Authorize'
;(global as any)['PREVENT_CODEMIRROR_RENDER'] = true
function HasteAuthApplication({ Component, pageProps }: AppProps) {
	const { auth } = useAuth()

	switch (auth) {
		case AuthState.False:
			return (
				<>
					<div>Authorizing...</div>
				</>
			)

		case AuthState.True:
			return (
				<>
					<Component {...pageProps} />
				</>
			)

		case AuthState.Redirect:
			return (
				<>
					<Authorize />
				</>
			)

		case AuthState.AuthorizationFailed:
			return <h1 className='text-3xl font-bold underline'>Failed </h1>

		default:
			return <></>
	}
}

function HasteApplication(props: AppProps) {
	return (
		<AuthProvider>
			<HasteAuthApplication {...props} />
		</AuthProvider>
	)
}

export default HasteApplication
