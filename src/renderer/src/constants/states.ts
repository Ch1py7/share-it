import { States } from '@renderer/context/sessions/sessions.types'

export const sessionStateConfig: Record<
	States,
	{
		color: string
		label: string
		text: string
		bg: string
	}
> = {
	connected: {
		color: 'bg-emerald-500',
		label: 'Connected',
		text: 'text-emerald-700',
		bg: 'bg-emerald-100',
	},
	loading: {
		color: 'bg-sky-500',
		label: 'Loading',
		text: 'text-sky-700',
		bg: 'bg-sky-100',
	},
	error: {
		color: 'bg-red-500',
		label: 'Error',
		text: 'text-red-700',
		bg: 'bg-red-100',
	},
	disconnected: {
		color: 'bg-zinc-400',
		label: 'Disconnected',
		text: 'text-zinc-700',
		bg: 'bg-zinc-100',
	},
	pending: {
		color: 'bg-yellow-400',
		label: 'Pending',
		text: 'text-yellow-700',
		bg: 'bg-yellow-100',
	},
}
