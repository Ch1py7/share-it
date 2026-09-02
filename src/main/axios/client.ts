import axios from 'axios'

const isProd = false
const baseURL = isProd ? '' : 'http://localhost:8000'
export const api = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
	validateStatus: () => true,
})
