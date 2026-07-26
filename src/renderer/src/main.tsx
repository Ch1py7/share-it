import { createRoot } from 'react-dom/client'
import { App } from './App'
import { UserProvider } from './context/user.context'
import { SessionsProvider } from './context/sessions/sessions.context'

createRoot(document.getElementById('root')!).render(
	<UserProvider>
		<SessionsProvider>
			<App />
		</SessionsProvider>
	</UserProvider>
)
