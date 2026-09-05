import { errorsContent, REPOSITORY_ERRORS } from '@renderer/constants/errors'
import { ChevronDown, ChevronUp, CircleAlert } from 'lucide-react'
import { useState } from 'react'

interface ErrorFallbackProps {
	error: REPOSITORY_ERRORS
	children?: React.ReactNode
	onClose: () => void
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, children, onClose }) => {
	const [isExpanded, setIsExpanded] = useState(false)

	return (
		<div className="rounded-2xl border border-red-200 bg-red-50 p-4">
			<div className="flex items-center gap-4">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
					<CircleAlert size={20} />
				</div>

				<div>
					<h3 className="font-semibold text-red-900">{errorsContent[error].title}</h3>
					<p className="text-sm leading-6 text-red-700">{errorsContent[error].description}</p>
				</div>

				<button
					type="button"
					className="rounded-lg ms-auto border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-all hover:border-red-300 hover:bg-red-100 hover:text-red-900"
					onClick={onClose}
				>
					Close
				</button>
				{children && (
					<button
						type="button"
						onClick={() => setIsExpanded((p) => !p)}
						className="ml-2 flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
					>
						{isExpanded ? (
							<>
								<ChevronUp size={16} />
								Hide details
							</>
						) : (
							<>
								<ChevronDown size={16} />
								Show details
							</>
						)}
					</button>
				)}
			</div>
			<div
				className={`grid transition-all duration-300 ${
					isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
				}`}
			>
				<div className="overflow-hidden">
					<div className="mt-4 rounded-xl border border-red-200/70 bg-white/60 p-4">{children}</div>
				</div>
			</div>
		</div>
	)
}
