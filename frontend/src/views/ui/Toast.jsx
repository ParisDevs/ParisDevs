import { Banner } from './Banner'

export function Toast({ message, tone }) {
  if (!message) return null
  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-sm">
      <Banner tone={tone === 'error' ? 'error' : 'success'}>{message}</Banner>
    </div>
  )
}
