import { useEffect, useState } from 'react'
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from 'react-router-dom'
import Header from './components/layout/Header'
import ProgressSteps, {
	RING_STEPS,
	type RingStep,
} from './components/layout/ProgressSteps'
import CreateYourRing from './pages/CreateYourRing'
import MakeItYours from './pages/MakeItYours'
import Personalise from './pages/Personalise'
import YourRing from './pages/YourRing'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'drgold-theme'

const getInitialTheme = (): Theme => {
	if (typeof window === 'undefined') {
		return 'light'
	}

	const stored = window.localStorage.getItem(THEME_STORAGE_KEY)

	if (stored === 'light' || stored === 'dark') {
		return stored
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light'
}

function RingBuilderProgress() {
	const location = useLocation()
	const navigate = useNavigate()

	const matchedStep = RING_STEPS.find(
		(step) => step.path === location.pathname,
	)

	const currentStep = (matchedStep?.id ?? 1) as RingStep

	return (
		<ProgressSteps
			currentStep={currentStep}
			onStepClick={(step) => {
				navigate(RING_STEPS[step - 1].path)
			}}
		/>
	)
}

const App = () => {
	const [theme, setTheme] = useState<Theme>(getInitialTheme)

	useEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark')
		window.localStorage.setItem(THEME_STORAGE_KEY, theme)
	}, [theme])

	return (
		<BrowserRouter>
			<div className="flex min-h-screen flex-col bg-background text-foreground">
				<Header
					theme={theme}
					onThemeToggle={() =>
						setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
					}
				/>
				<RingBuilderProgress />

				<main className="mx-auto w-full max-w-[1300px] flex-1 px-5 py-8 md:px-8 md:py-10">
					<Routes>
						<Route path="/" element={<CreateYourRing />} />
						<Route path="/make-it-yours" element={<MakeItYours />} />
						<Route path="/personalise" element={<Personalise />} />
						<Route path="/your-ring" element={<YourRing />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</main>
			</div>
		</BrowserRouter>
	)
}

export default App
