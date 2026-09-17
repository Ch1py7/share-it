import { ArrowLeft } from 'lucide-react'
import { SyncDestinationSetting } from '@renderer/components/settings/SyncDestinationSetting'
import { useUserStore } from '@renderer/stores/user/user.store'

interface SettingsProps {
	onBack: () => void
}

export const Settings = ({ onBack }: SettingsProps) => {
	const userId = useUserStore((state) => state.user?.id)

	return (
		<div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-6">
			<button
				type="button"
				onClick={onBack}
				className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900"
			>
				<ArrowLeft size={16} /> Back
			</button>
			<div>
				<h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
				<p className="mt-1 text-sm text-zinc-500">Preferences for your account.</p>
			</div>
			{userId && <SyncDestinationSetting key={userId} userId={userId} />}
		</div>
	)
}
