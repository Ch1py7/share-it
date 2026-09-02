import { Errors, errorsContent } from '@renderer/constants/errors'
import { Session } from '@renderer/stores/sessions/sessions.types'

interface SessionStateHelperProps {
	currentSession: Session | undefined
	error?: Errors | null
}

export const SessionStateHelper: React.FC<SessionStateHelperProps> = ({
	currentSession,
	error,
}) => {
	const state = currentSession?.state ?? 'disconnected'
	const role = currentSession?.role ?? 'owner'

	const messages = {
		disconnected:
			'This session is not linked to a local repository yet. Link a local folder to continue.',
		pending:
			role === 'collaborator'
				? 'Your session is ready. Click Connect to join the collaboration session.'
				: 'Your session is ready. Click Create to start the collaboration session.',
		loading: 'Your session is starting. This may take a moment.',
		connected:
			role === 'collaborator'
				? 'Your session is open and ready to synchronize files.'
				: 'Your session is active and ready for collaborators.',
		error: error ? errorsContent[error].description : 'Something went wrong with this session.',
	}

	return (
		<div className="p-3 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50">
			{messages[state]}
		</div>
	)
}
