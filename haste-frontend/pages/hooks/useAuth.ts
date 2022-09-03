import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

export const useAuth = () => {
	const { query, isReady } = useRouter()

	const [auth, setAuth] = useState<boolean>(false)

	const checkAuth = async (token: string) => {
		const data = await fetch(new URL('auth', process.env.NEXT_PUBLIC_SERVER), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		if (data.ok) {
			setTimeout(() => setAuth(true), 1000)
			return
		} else {
			window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=read:user,user:email`
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
			setAuth(true)
		}
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
				window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=read:user,user:email`
			}
		}
	}, [query, isReady])

	return { auth }
}
