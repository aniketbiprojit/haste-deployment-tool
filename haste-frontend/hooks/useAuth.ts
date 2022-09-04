import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

export enum AuthState {
	False,
	True,
	Redirect,
	AuthorizationFailed,
}

export const useAuth = () => {
	const { query, isReady } = useRouter()

	const [auth, setAuth] = useState<AuthState>(AuthState.False)

	const checkAuth = async (token: string) => {
		const data = await fetch(new URL('auth', process.env.NEXT_PUBLIC_SERVER), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		if (data.ok) {
			setTimeout(() => setAuth(AuthState.True), 1000)
			return
		} else {
		}
	}

	const getToken = useCallback(async () => {
		const url = new URL('', process.env.NEXT_PUBLIC_SERVER)
		url.searchParams.set('redirect', 'true')
		url.searchParams.set('auth', 'github')
		url.searchParams.set('code', query.code as string)

		const response = await fetch(url.href)
		if (response.ok) {
			const { token } = await response.json()
			localStorage.setItem('token', token)
			return setAuth(AuthState.True)
		}

		if (response.status === 401) {
			return setTimeout(() => setAuth(AuthState.AuthorizationFailed), 1000)
		}
		return setTimeout(() => setAuth(AuthState.False), 1000)
	}, [query])

	useEffect(() => {
		console.log('effect')
		if (isReady) {
			const token = localStorage.getItem('token')
			if (token) {
				checkAuth(token)
			} else if (query.code) {
				getToken()
			} else {
				setAuth(AuthState.Redirect)
			}
		}
	}, [query, isReady])

	return { auth }
}
