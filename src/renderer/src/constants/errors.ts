export enum Errors {
	DIFFERENT_REPOSITORY = 'DIFFERENT REPOSITORY',
	INVALID_REPOSITORY = 'INVALID REPOSITORY',
}

export const errorsContent: Record<Errors, { title: string; description: string }> = {
	[Errors.DIFFERENT_REPOSITORY]: {
		title: 'Different repository selected',
		description:
			'The selected folder belongs to a different repository. Please select the correct repository folder.',
	},
	[Errors.INVALID_REPOSITORY]: {
		title: 'Invalid repository',
		description:
			"The selected folder isn't a valid Git repository. Please select the repository's root directory or clone the repository first.",
	},
}

export enum ErrorCodes {
	INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
	SESSION_REVOKED = 'SESSION_REVOKED',
	SESSION_EXPIRED = 'SESSION_EXPIRED',
}
