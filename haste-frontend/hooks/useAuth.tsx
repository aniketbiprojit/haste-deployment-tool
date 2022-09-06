import { useRouter } from 'next/router'
import { useCallback, useEffect, useState, createContext, Dispatch, SetStateAction, useContext } from 'react'

export enum AuthState {
	False,
	True,
	Redirect,
	AuthorizationFailed,
}

const AuthContext = createContext<{ auth: AuthState; setAuth: Dispatch<SetStateAction<AuthState>> }>({
	auth: AuthState.False,
	setAuth: () => {},
})

export const AuthProvider = ({ children }: any) => {
	const [auth, setAuth] = useState(AuthState.False)
	return <AuthContext.Provider value={{ auth: auth, setAuth }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const { query, isReady, push } = useRouter()

	const { auth, setAuth } = useContext(AuthContext)

	const checkAuth = async (token: string) => {
		const data = await fetch(new URL('auth', process.env.NEXT_PUBLIC_SERVER), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (data.ok) {
			setTimeout(() => {
				setAuth(AuthState.True)
				if (query.code) push('/')
			}, 1000)
			return
		} else {
			setTimeout(() => {
				localStorage.clear()
				setAuth(AuthState.False)
			}, 1000)
			return
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
		if (isReady && auth !== AuthState.True) {
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
