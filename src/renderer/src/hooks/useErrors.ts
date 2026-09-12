import { REPOSITORY_ERRORS } from '@renderer/constants/errors'
import { useState } from 'react'

export const useErrors = () => {
	const [error, setError] = useState<REPOSITORY_ERRORS | null>(null)
	const [customMessage, setCustomMessage] = useState('')

	const onClose = () => {
		setError(null)
	}

	const setInvalidRepository = () => {
		setError(REPOSITORY_ERRORS.INVALID_REPOSITORY)
	}

	const setDifferentRepository = () => {
		setError(REPOSITORY_ERRORS.DIFFERENT_REPOSITORY)
	}

	const setInvalidFiles = () => {
		setError(REPOSITORY_ERRORS.FILE_OUT_OF_REPOSITORY)
	}

	return {
		error,
		customMessage,
		onClose,
		setInvalidRepository,
		setInvalidFiles,
		setDifferentRepository,
		setCustomMessage,
	}
}
