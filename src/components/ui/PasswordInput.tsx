import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { passwordStrength } from '@/lib/utils'
import { Input, type InputProps } from './Input'

export function PasswordInput(props: Omit<InputProps, 'type' | 'rightSlot'>) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const label = t(visible ? 'common.hidePassword' : 'common.showPassword')

  return (
    <Input
      type={visible ? 'text' : 'password'}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={label}
          title={label}
          aria-pressed={visible}
          className="flex size-8 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      }
      {...props}
    />
  )
}

const LEVELS = [
  { key: 'weak', bar: 'bg-danger', text: 'text-danger-text' },
  { key: 'medium', bar: 'bg-primary', text: 'text-primary-text' },
  { key: 'strong', bar: 'bg-success', text: 'text-success-text' },
] as const

export function PasswordStrength({ password }: { password: string }) {
  const { t } = useTranslation()
  const score = passwordStrength(password)
  const level = score > 0 ? LEVELS[score - 1] : null

  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1" aria-hidden="true">
        {LEVELS.map((l, i) => (
          <span key={l.key} className={cn('h-1 flex-1 rounded-full', level && i < score ? level.bar : 'bg-gray-200')} />
        ))}
      </div>
      <span className={cn('min-w-16 text-right text-xs font-medium', level ? level.text : 'text-fg-subtle')}>
        {level ? t(`common.password.${level.key}`) : t('common.password.hint')}
      </span>
    </div>
  )
}
