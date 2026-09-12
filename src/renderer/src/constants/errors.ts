export enum REPOSITORY_ERRORS {
	DIFFERENT_REPOSITORY = 'DIFFERENT REPOSITORY',
	INVALID_REPOSITORY = 'INVALID REPOSITORY',
	FILE_OUT_OF_REPOSITORY = 'FILE OUT OF REPOSITORY',
}

export const errorsContent: Record<REPOSITORY_ERRORS, { title: string; description: string }> = {
	[REPOSITORY_ERRORS.DIFFERENT_REPOSITORY]: {
		title: 'Different repository selected',
		description:
			'The selected folder belongs to a different repository. Please select the correct repository folder.',
	},
	[REPOSITORY_ERRORS.INVALID_REPOSITORY]: {
		title: 'Invalid repository',
		description:
			"The selected folder isn't a valid Git repository. Please select the repository's root directory or clone the repository first.",
	},
	[REPOSITORY_ERRORS.FILE_OUT_OF_REPOSITORY]: {
		title: 'File outside repository',
		description:
			'One or more selected files are outside the repository. Please select files located within the repository.',
	},
}

export enum ErrorCodes {
	INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
	SESSION_REVOKED = 'SESSION_REVOKED',
	SESSION_EXPIRED = 'SESSION_EXPIRED',
}
