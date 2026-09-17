import { api } from './client'

let currentAccessToken: string | null = null

export const setClientToken = (token: string) => {
	currentAccessToken = token
}

export const getClientToken = () => currentAccessToken

api.interceptors.request.use((config) => {
	if (currentAccessToken) {
		config.headers.Authorization = `Bearer ${currentAccessToken}`
	}

	return config
})

// api.interceptors.response.use(
// 	(response) => response,
// 	(error) => {
// 		if (error.response?.status === 401) {
// 			console.log('Unauthorized')
// 		}

// 		return Promise.reject(error)
// 	}
// )
