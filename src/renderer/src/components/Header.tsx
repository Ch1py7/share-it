import { useSessions } from '@renderer/context/sessions/sessions.context'
import { useUser } from '@renderer/context/user.context'
import { Bell, Search, Settings, User2, Users } from 'lucide-react'
import { CurrentSessions } from './CurrentSessions'
import { Tooltip } from './Tooltip'

export const Header = () => {
	const { user } = useUser()
	const { sessions } = useSessions()

	return (
		<header className="sticky z-10 top-0 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
			<div className="flex h-16 items-center justify-between px-6">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold">
						S
					</div>

					<div>
						<h1 className="text-lg font-semibold tracking-tight text-zinc-900">Share-it</h1>

						<p className="text-xs text-zinc-500">Collaborative version control</p>
					</div>

					{sessions.size > 0 && (
						<Tooltip className="ml-3" position="bottom" content={<CurrentSessions />}>
							<div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-1.5">
								<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-white ms-3">
									<Users size={14} />
								</div>

								<div className="flex flex-col leading-none me-3">
									<span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
										Current Sessions
									</span>

									<span className="text-sm font-semibold text-zinc-900">
										{sessions.size} active
									</span>
								</div>
							</div>
						</Tooltip>
					)}
				</div>

				<div className="hidden lg:flex items-center absolute top-1/2 left-1/2 -translate-1/2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

						<input
							type="text"
							placeholder="Search repositories..."
							className="h-10 w-72 rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-zinc-900 focus:bg-white"
						/>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
					>
						<Bell size={18} />
					</button>

					<button
						type="button"
						className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
					>
						<Settings size={18} />
					</button>

					<button
						type="button"
						className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:scale-105"
					>
						{user?.avatar_url ? (
							<img className="rounded-full" src={user.avatar_url} alt="user" />
						) : (
							<User2 size={18} />
						)}
					</button>
				</div>
			</div>
		</header>
	)
}
