import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthState, useAuth } from './hooks/useAuth'
import { Authorize } from '../components/Authorize'

function HasteApplication({ Component, pageProps }: AppProps) {
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
			return 'Failed'

		default:
			return <></>
	}
}

export default HasteApplication
