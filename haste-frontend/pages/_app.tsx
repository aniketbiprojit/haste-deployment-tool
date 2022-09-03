import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useAuth } from './hooks/useAuth'

function MyApp({ Component, pageProps }: AppProps) {
	const { auth } = useAuth()
	return auth ? <Component {...pageProps} /> : <div>Authorizing...</div>
}

export default MyApp
