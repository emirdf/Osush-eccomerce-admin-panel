import { ArrowLeft, PackageX } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'
import { ApiError, DISABLED, type OrderProduct } from '@/api'
import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FormPageSkeleton } from '@/components/ui/FormPageSkeleton'
import { Image } from '@/components/ui/Image'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { cn } from '@/lib/cn'
import { formatMoney, formatNumber } from '@/lib/format'
import { formatPhone } from '@/lib/phone'
import { useCachedOrderRow, useOrder } from './queries'

/** Passed by the list so "back" restores its page/search/filter, and so the name can be shown. */
export interface OrderLocationState {
  from?: string
  customerName?: string
}

function parseId(raw: string | undefined): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

function ReadonlyField({ label, children, multiline }: { label: string; children: ReactNode; multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-sm font-semibold text-fg">{label}</dt>
      <dd
        className={cn(
          'rounded-control bg-surface-muted px-3 text-base text-fg',
          multiline ? 'min-h-28 py-2.5 break-words whitespace-pre-wrap' : 'flex min-h-10 items-center py-2 break-words',
        )}
      >
        {children || <span className="text-fg-subtle">—</span>}
      </dd>
    </div>
  )
}

function ProductRow({ product }: { product: OrderProduct }) {
  const { t } = useTranslation()
  const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price
  return (
    <li className="flex items-center gap-3 rounded-control border border-border p-2.5">
      <Image src={product.image} className="size-10 shrink-0 rounded-md border border-border bg-surface-muted object-cover" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-base font-medium text-fg">{product.name || '—'}</p>
        <p className="text-sm text-fg-muted tabular-nums">{t('orders.detail.quantity', { count: product.quantity })}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-baseline justify-end gap-x-2 text-right">
        {hasDiscount && (
          <s className="text-xs whitespace-nowrap text-fg-subtle">
            <span className="sr-only">{t('orders.detail.oldPrice')} </span>
            {formatMoney(product.price)}
          </s>
        )}
        <span className="text-sm font-semibold whitespace-nowrap text-fg">{formatMoney(hasDiscount ? product.discountPrice! : product.price)}</span>
      </div>
    </li>
  )
}

export function OrderDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const location = useLocation()
  const state = (location.state ?? {}) as OrderLocationState
  const id = parseId(params.id)
  const query = useOrder(id)
  const cachedRow = useCachedOrderRow(id)
  const errorMessage = useApiErrorMessage()

  const backTo = `/orders${state.from ?? ''}`
  const backLink = (
    <ButtonLink to={backTo} variant="ghost" size="icon-sm" aria-label={t('orders.detail.back')} title={t('orders.detail.back')}>
      <ArrowLeft className="size-5" />
    </ButtonLink>
  )

  const notFound = id === null || (query.error instanceof ApiError && query.error.status === 404)
  if (notFound) {
    return (
      <Card className="p-5">
        <EmptyState
          icon={PackageX}
          title={t('orders.detail.notFound')}
          action={<ButtonLink to={backTo} variant="outline" size="sm" icon={ArrowLeft}>{t('orders.detail.back')}</ButtonLink>}
        />
      </Card>
    )
  }
  if (query.isError) {
    return (
      <Card className="p-5">
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />
      </Card>
    )
  }
  if (query.isPending) return <FormPageSkeleton />

  const order = query.data
  // `GET /product/order/{id}` has no customer name; take it from the list row we came from.
  const customerName = state.customerName || cachedRow?.customerName || ''

  return (
    <div className="grid items-start gap-3 lg:grid-cols-2">
      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {backLink}
          <h2 className="flex-1 text-xl font-semibold text-fg">{t('orders.detail.about')}</h2>
          <Badge tone={order.isSent ? 'success' : 'neutral'}>{t(order.isSent ? 'orders.status.sent' : 'orders.status.notSent')}</Badge>
        </div>
        <dl className="flex flex-col gap-4">
          <ReadonlyField label={t('orders.detail.customerName')}>{customerName}</ReadonlyField>
          <ReadonlyField label={t('orders.detail.phone')}>
            {order.phone && <span className="tabular-nums">{formatPhone(order.phone)}</span>}
          </ReadonlyField>
          <ReadonlyField label={t('orders.detail.city')}>{order.city}</ReadonlyField>
          <ReadonlyField label={t('orders.detail.address')}>{order.deliveryAddress}</ReadonlyField>
          <ReadonlyField label={t('orders.detail.notes')} multiline>
            {order.notes}
          </ReadonlyField>
        </dl>
      </Card>

      <Card className="flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-fg">{t('orders.detail.products', { count: order.products.length })}</h2>

        {order.products.length ? (
          <ul className="flex flex-col gap-2.5">
            {order.products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </ul>
        ) : (
          <EmptyState compact title={t('orders.detail.noProducts')} />
        )}

        <dl className="flex flex-col gap-2 border-t border-border pt-4 text-base">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-fg-muted">{t('orders.detail.itemCount')}</dt>
            <dd className="font-medium text-fg tabular-nums">{formatNumber(order.productCount)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-fg-muted">{t('orders.detail.totalPrice')}</dt>
            <dd className="text-lg font-semibold whitespace-nowrap text-fg">{formatMoney(order.totalPrice)}</dd>
          </div>
        </dl>

        {!order.isSent && (
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
            {/* No endpoint to set is_send yet — visible but disabled, never a dead button. */}
            {DISABLED.orderMarkSent && (
              <p id="mark-sent-hint" className="text-xs text-fg-muted">
                {t('orders.detail.markSentUnavailable')}
              </p>
            )}
            <Button variant="success" disabled={DISABLED.orderMarkSent} aria-describedby={DISABLED.orderMarkSent ? 'mark-sent-hint' : undefined}>
              {t('orders.detail.markSent')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
