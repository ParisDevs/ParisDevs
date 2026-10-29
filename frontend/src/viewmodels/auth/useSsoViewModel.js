import { useState } from 'react'

export function useSsoViewModel() {
  const [status, setStatus] = useState('idle')

  return {
    status,
    continueDemo: () => setStatus('fail'),
    failProvider: () => setStatus('fail'),
  }
}
