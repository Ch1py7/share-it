import './App.css'
import { Loading } from './components/Loading'
import { Login } from './components/Login'
import { useUserStore } from './stores/user/user.store'
import { Initializer } from './components/Initializer'
import { SocketHandler } from './components/SocketHandler'
import { useShallow } from 'zustand/shallow'
import { Toaster } from 'sonner'
import { Layout } from './components/Layout'

export const App = () => {
	const { user, loading } = useUserStore(
		useShallow((state) => ({
			user: state.user,
			loading: state.loading,
		}))
	)

	return (
		<>
			<Toaster position="top-right" richColors closeButton />
			<SocketHandler />
			<Initializer />
			{loading ? <Loading /> : user ? <Layout /> : <Login />}
		</>
	)
}
