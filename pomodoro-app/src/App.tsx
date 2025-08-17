import { useState } from 'react'
import GridProgressBar from './components/GridProgressBar'
import TimerCountdown from './components/TimerCountdown'
import SpaceshipControlPanel from './components/SpaceshipControlPanel'
import './App.css'

function App() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<'focus' | 'break' | null>(null)
  const totalDuration = 36 * 60 * 1000 // 36 minutes in milliseconds
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseInt(e.target.value)
    setElapsed((percentage / 100) * totalDuration)
  }

  const timeRemaining = totalDuration - elapsed

  // Control panel handlers (mock for now)
  const handleStartFocus = () => {
    setSessionType('focus')
    setIsRunning(true)
    setElapsed(0)
    console.log('🎯 Focus session engaged!')
  }
  
  const handleStartBreak = () => {
    setSessionType('break')
    setIsRunning(true)
    setElapsed(0)
    console.log('☕ Break protocol activated!')
  }
  
  const handleComplete = () => {
    setIsRunning(false)
    console.log('✅ Mission completed successfully!')
  }
  
  const handleAbort = () => {
    setIsRunning(false)
    setSessionType(null)
    setElapsed(0)
    console.log('🛑 Mission aborted')
  }

  const handleRetroactiveStart = (startTime: Date, sessionType: 'focus' | 'break') => {
    const now = new Date()
    const elapsedMs = now.getTime() - startTime.getTime()
    setElapsed(Math.max(0, elapsedMs))
    setSessionType(sessionType)
    setIsRunning(true)
    console.log(`🕐 Retroactive ${sessionType} launch at ${startTime.toLocaleTimeString()}! Elapsed: ${Math.round(elapsedMs / 60000)} minutes`)
  }
  
  const handleAdjustTime = (minutes: number) => {
    const adjustment = minutes * 60 * 1000
    setElapsed(Math.max(0, elapsed + adjustment))
    console.log(`⚡ Time adjusted by ${minutes} minutes`)
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0f0f0f', 
      height: '100vh', 
      width: '100vw',
      color: 'white',
      overflow: 'auto',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Pomodoro Timer Test</h1>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label>
          Progress: {Math.round((elapsed / totalDuration) * 100)}%
          <input 
            type="range" 
            min="0" 
            max="120" 
            value={Math.round((elapsed / totalDuration) * 120)}
            onChange={(e) => {
              const percentage = parseInt(e.target.value)
              setElapsed((percentage / 100) * totalDuration)
            }}
            style={{ marginLeft: '10px', width: '300px' }}
          />
        </label>
      </div>

      {sessionType && (
        <>
          <TimerCountdown 
            timeRemaining={timeRemaining}
            sessionType={sessionType}
          />

          <GridProgressBar 
            sessionId={`test-${sessionType}-1`}
            totalDuration={totalDuration}
            elapsed={elapsed}
            sessionType={sessionType}
          />
        </>
      )}

      <SpaceshipControlPanel 
        onStartFocus={handleStartFocus}
        onStartBreak={handleStartBreak}
        onComplete={handleComplete}
        onAbort={handleAbort}
        onRetroactiveStart={handleRetroactiveStart}
        onAdjustTime={handleAdjustTime}
        isRunning={isRunning}
        sessionType={sessionType}
      />
      
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        🚀 Use the spaceship controls above, or adjust with the test slider
      </div>
    </div>
  )
}

export default App
