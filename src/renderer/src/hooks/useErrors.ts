import { Errors } from '@renderer/constants/errors'
import { useState } from 'react'

export const useErrors = () => {
	const [error, setError] = useState<Errors | null>(null)
	const [customMessage, setCustomMessage] = useState('')

	const onClose = () => {
		setError(null)
	}

	const setInvalidRepository = () => {
		setError(Errors.INVALID_REPOSITORY)
	}

	const setDifferentRepository = () => {
		setError(Errors.DIFFERENT_REPOSITORY)
	}

	return {
		error,
		customMessage,
		onClose,
		setInvalidRepository,
		setDifferentRepository,
		setCustomMessage,
	}
}
