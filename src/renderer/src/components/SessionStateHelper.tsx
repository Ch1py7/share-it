import { Errors, errorsContent } from '@renderer/constants/errors'
import { Session } from '@renderer/context/sessions/sessions.types'

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

	return (
		<>
			{state === 'disconnected' &&
				'This session is pending, you have to link the local proyect before to make a connection or a room.'}
			{state === 'pending' &&
				`You'r session is pending, you have to click in ${role === 'collaborator' ? 'Connect' : 'Create'}.`}
			{state === 'loading' && "You'r session is loading, be patient."}
			{state === 'connected' &&
				`You're ${role === 'collaborator' ? 'session is open' : 'connected'}`}
			{state === 'error' && error && errorsContent[error].description}
		</>
	)
}
