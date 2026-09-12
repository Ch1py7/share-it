import { AlertCircle, Loader2, SquircleDashed, Wifi, WifiOff } from 'lucide-react'

export const getColorByState = (state?: string) => {
	switch (state) {
		case 'connected':
			return 'border-emerald-200 bg-emerald-50/60'
		case 'loading':
			return 'border-sky-200 bg-sky-50/60'
		case 'error':
			return 'border-red-200 bg-red-50/60'
		case 'disconnected':
			return 'border-zinc-200 bg-zinc-50/60'
		case 'pending':
			return 'border-yellow-200 bg-yellow-50/60'
		default:
			return ''
	}
}

export const getStyleByState = {
	connected: {
		icon: <Wifi size={14} />,
		className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
		label: 'Connected',
	},
	loading: {
		icon: <Loader2 size={14} className="animate-spin" />,
		className: 'border-sky-200 bg-sky-50 text-sky-700',
		label: 'Connecting',
	},
	error: {
		icon: <AlertCircle size={14} />,
		className: 'border-red-200 bg-red-50 text-red-700',
		label: 'Error',
	},
	disconnected: {
		icon: <WifiOff size={14} />,
		className: 'border-zinc-200 bg-zinc-50 text-zinc-600',
		label: 'Disconnected',
	},
	pending: {
		icon: <SquircleDashed size={14} />,
		className: 'border-yellow-200 bg-yellow-50 text-yellow-600',
		label: 'Pending',
	},
}
