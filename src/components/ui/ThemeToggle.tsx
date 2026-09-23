import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toggleTheme, useTheme } from '@/store/theme'
import { Button } from './Button'

export function ThemeToggle() {
  const { t } = useTranslation()
  const theme = useTheme()
  const label = t(theme === 'dark' ? 'common.theme.toLight' : 'common.theme.toDark')

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={label} title={label}>
      {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
