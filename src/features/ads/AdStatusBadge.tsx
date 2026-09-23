import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'

/** `is_active` comes from the server — never recomputed client-side. */
export function AdStatusBadge({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation()
  return <Badge tone={isActive ? 'success' : 'danger'}>{t(isActive ? 'ads.status.active' : 'ads.status.inactive')}</Badge>
}
