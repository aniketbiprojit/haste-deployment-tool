export const getAPI = (path: string) => {
	return new URL(path, process.env.NEXT_PUBLIC_SERVER)
}

export const getHeaders = () => {
	return {
		Authorization: `Bearer ${localStorage.getItem('token')}`,
	}
}
