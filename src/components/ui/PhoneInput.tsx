import { useTranslation } from 'react-i18next'
import { formatPhone, normalizePhone } from '@/lib/phone'
import { Input, type InputProps } from './Input'

interface PhoneInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  /** Stored value, e.g. "+99364123456" (may be partial while typing). */
  value: string
  onChange: (value: string) => void
}

/** Masked input: +993 6X XX XX XX */
export function PhoneInput({ value, onChange, placeholder, ...props }: PhoneInputProps) {
  const { t } = useTranslation()
  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder={placeholder ?? t('common.phonePlaceholder')}
      value={formatPhone(value)}
      onChange={(e) => onChange(normalizePhone(e.target.value))}
      {...props}
    />
  )
}
