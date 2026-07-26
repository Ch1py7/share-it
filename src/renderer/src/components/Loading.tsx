import { Loader2 } from 'lucide-react'

export const Loading = () => {
	return (
		<div className="min-h-screen w-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 flex items-center justify-center p-6">
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-zinc-300/20 blur-3xl" />
			</div>

			<div className="flex flex-col items-center gap-8">
				<div className="text-center">
					<h1 className="text-5xl font-bold tracking-tight text-zinc-900">
						Share<span className="text-zinc-500">-it</span>
					</h1>

					<p className="mt-3 text-zinc-500">Preparing your workspace...</p>
				</div>

				<div className="w-105 rounded-2xl border border-zinc-200/80 bg-white/80 backdrop-blur-xl shadow-xl p-10">
					<div className="flex flex-col items-center gap-6">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>

						<div className="space-y-2 text-center">
							<h2 className="text-xl font-semibold text-zinc-900">Loading</h2>

							<p className="text-sm text-zinc-500">
								Fetching repositories and synchronizing your account.
							</p>
						</div>

						<div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
							<div className="h-full w-1/3 animate-pulse rounded-full bg-zinc-900" />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
