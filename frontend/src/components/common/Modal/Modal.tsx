import { ReactNode, useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-graphite-950/50 backdrop-blur-[2px] animate-fadeIn"
          onClick={onClose}
        />

        <div
          ref={modalRef}
          className="relative bg-white rounded-xl2 shadow-lifted max-w-md w-full p-6 animate-modalIn"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-display font-semibold text-graphite-900">{title}</h3>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-graphite-400 hover:text-graphite-700 hover:bg-graphite-50 transition-colors duration-150"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
