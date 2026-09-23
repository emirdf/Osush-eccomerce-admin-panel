import { CirclePlus, CircleX, RefreshCw, Star, Upload } from 'lucide-react'
import { type DragEvent, type ReactNode, type Ref, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImageInput } from '@/api'
import { useImagePicker } from '@/hooks/useImagePicker'
import { Image } from './Image'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { useFieldContext } from './field-context'

/* ─── Shared bits ───────────────────────────────────────────────────────── */

function useFileDrop(onFiles: (files: FileList) => void) {
  const [dragging, setDragging] = useState(false)
  const handlers = {
    onDragOver: (e: DragEvent) => {
      if (!e.dataTransfer.types.includes('Files')) return
      e.preventDefault()
      setDragging(true)
    },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
    },
    onDrop: (e: DragEvent) => {
      if (!e.dataTransfer.files.length) return
      e.preventDefault()
      setDragging(false)
      onFiles(e.dataTransfer.files)
    },
  }
  return { dragging, handlers }
}

function HiddenFileInput({ inputRef, accept, multiple, onFiles }: {
  inputRef: Ref<HTMLInputElement>
  accept: string
  multiple?: boolean
  onFiles: (files: FileList) => void
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      hidden
      onChange={(e) => {
        if (e.target.files?.length) onFiles(e.target.files)
        e.target.value = ''
      }}
    />
  )
}

function UploadPrompt({ maxMb, compact }: { maxMb: number; compact?: boolean }) {
  const { t } = useTranslation()
  return (
    <>
      <span className="flex size-11 items-center justify-center rounded-full bg-surface text-primary-text shadow-card">
        <Upload className="size-5" aria-hidden="true" />
      </span>
      <span className="text-base font-semibold text-fg">{t('common.images.upload')}</span>
      {!compact && <span className="text-sm text-fg-muted">{t('common.images.dropHint')}</span>}
      <span className="text-xs text-fg-subtle">{t('common.images.formats', { size: maxMb })}</span>
    </>
  )
}

function DropZone({ onPick, onFiles, className, invalid, id, describedBy, buttonRef, children }: {
  onPick: () => void
  onFiles: (files: FileList) => void
  className?: string
  invalid?: boolean
  id?: string
  describedBy?: string
  buttonRef?: Ref<HTMLButtonElement>
  children: ReactNode
}) {
  const { dragging, handlers } = useFileDrop(onFiles)
  return (
    <button
      ref={buttonRef}
      id={id}
      type="button"
      onClick={onPick}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      {...handlers}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-4 text-center transition-colors',
        dragging
          ? 'border-primary bg-primary-soft'
          : invalid
            ? 'border-danger bg-danger-soft/40'
            : 'border-border-strong bg-surface-muted hover:border-primary-text/50',
        className,
      )}
    >
      {children}
    </button>
  )
}

const iconButton =
  'flex size-7 items-center justify-center rounded-full bg-surface/95 text-fg-muted shadow-card transition-colors hover:text-danger-text'

function ImageErrors({ errors }: { errors: string[] }) {
  if (!errors.length) return null
  return (
    <ul role="alert" className="flex flex-col gap-0.5 text-xs font-medium text-danger-text">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  )
}

/* ─── Single image ──────────────────────────────────────────────────────── */

interface SingleImageUploaderProps {
  value: ImageInput | null
  onChange: (value: ImageInput | null) => void
  aspectClassName?: string
  fit?: 'contain' | 'cover'
  ref?: Ref<HTMLButtonElement>
}

export function SingleImageUploader({ value, onChange, aspectClassName = 'aspect-[4/3]', fit = 'contain', ref }: SingleImageUploaderProps) {
  const { t } = useTranslation()
  const field = useFieldContext()
  const { pick, release, accept, maxMb } = useImagePicker()
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { dragging, handlers } = useFileDrop(handleFiles)

  function handleFiles(files: FileList) {
    const { images, errors: fileErrors } = pick(Array.from(files).slice(0, 1))
    setErrors(fileErrors)
    if (images[0]) {
      release(value)
      onChange(images[0])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div
          {...handlers}
          className={cn(
            'relative overflow-hidden rounded-card border bg-surface-muted',
            dragging ? 'border-primary ring-2 ring-primary/30' : 'border-border',
            aspectClassName,
          )}
        >
          <Image src={value.url} alt={t('common.images.preview')} className={cn('size-full', fit === 'cover' ? 'object-cover' : 'object-contain p-4')} />
          <button
            type="button"
            onClick={() => {
              release(value)
              onChange(null)
            }}
            aria-label={t('common.images.remove')}
            title={t('common.images.remove')}
            className={cn(iconButton, 'absolute top-2 right-2')}
          >
            <CircleX className="size-5" />
          </button>
          <Button
            ref={ref}
            variant="outline"
            size="sm"
            icon={RefreshCw}
            className="absolute right-2 bottom-2"
            onClick={() => inputRef.current?.click()}
          >
            {t('common.images.replace')}
          </Button>
        </div>
      ) : (
        <DropZone
          id={field?.id}
          buttonRef={ref}
          describedBy={field?.describedBy}
          invalid={field?.invalid}
          onPick={() => inputRef.current?.click()}
          onFiles={handleFiles}
          className={aspectClassName}
        >
          <UploadPrompt maxMb={maxMb} />
        </DropZone>
      )}
      <HiddenFileInput inputRef={inputRef} accept={accept} onFiles={handleFiles} />
      <ImageErrors errors={errors} />
    </div>
  )
}

/* ─── Main + additional images ──────────────────────────────────────────── */

export interface GalleryValue {
  main: ImageInput | null
  additional: ImageInput[]
}

interface GalleryUploaderProps extends GalleryValue {
  onChange: (value: GalleryValue) => void
  mainAspectClassName?: string
  fit?: 'contain' | 'cover'
  maxAdditional?: number
  /**
   * Images already stored on the server cannot be removed, reordered or
   * promoted (no endpoint) — those controls are disabled with a tooltip.
   */
  lockServerImages?: boolean
  lockedHint?: string
  ref?: Ref<HTMLButtonElement>
}

/**
 * `main` is the cover image (exactly one); `additional` is an ordered strip.
 * Supports drag-and-drop upload, drag or arrow-key reordering, and promoting
 * any additional image to main.
 */
export function GalleryUploader({
  main,
  additional,
  onChange,
  mainAspectClassName = 'aspect-[4/3]',
  fit = 'contain',
  maxAdditional = 8,
  lockServerImages = false,
  lockedHint,
  ref,
}: GalleryUploaderProps) {
  const { t } = useTranslation()
  const field = useFieldContext()
  const hintId = useId()
  const { pick, release, accept, maxMb } = useImagePicker()
  const [errors, setErrors] = useState<string[]>([])
  const [announcement, setAnnouncement] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const mainInputRef = useRef<HTMLInputElement>(null)
  const addInputRef = useRef<HTMLInputElement>(null)
  const stripRef = useRef<HTMLUListElement>(null)
  const pendingFocus = useRef<string | null>(null)

  const mainDrop = useFileDrop((files) => addFiles(files, 'main'))
  const addDrop = useFileDrop((files) => addFiles(files, 'additional'))

  /**
   * A cover that is already on the server can only be *replaced* (a new file is
   * uploaded). Removing it would promote another image, which no endpoint can
   * save — the form would show a change that never reaches the server.
   */
  const mainLocked = lockServerImages && Boolean(main) && !main?.file

  useEffect(() => {
    if (!pendingFocus.current) return
    stripRef.current?.querySelector<HTMLElement>(`[data-image-id="${pendingFocus.current}"]`)?.focus()
    pendingFocus.current = null
  }, [additional])

  function addFiles(files: FileList, target: 'main' | 'additional') {
    const { images, errors: fileErrors } = pick(files)
    if (!images.length) {
      setErrors(fileErrors)
      return
    }
    let nextMain = main
    let queue = images
    let nextAdditional = [...additional]
    if (target === 'main' || !nextMain) {
      if (nextMain) nextAdditional = [nextMain, ...nextAdditional]
      nextMain = queue[0]
      queue = queue.slice(1)
    }
    nextAdditional = [...nextAdditional, ...queue]
    if (nextAdditional.length > maxAdditional) {
      nextAdditional.slice(maxAdditional).forEach(release)
      nextAdditional = nextAdditional.slice(0, maxAdditional)
      fileErrors.push(t('common.images.maxReached', { max: maxAdditional }))
    }
    setErrors(fileErrors)
    onChange({ main: nextMain, additional: nextAdditional })
  }

  function removeMain() {
    release(main)
    const [first, ...rest] = additional
    onChange({ main: first ?? null, additional: rest })
    setAnnouncement(t('common.images.removed'))
  }

  function removeAdditional(index: number) {
    release(additional[index])
    const next = additional.filter((_, i) => i !== index)
    pendingFocus.current = next[Math.min(index, next.length - 1)]?.id ?? null
    onChange({ main, additional: next })
    setAnnouncement(t('common.images.removed'))
  }

  function makeMain(index: number) {
    const chosen = additional[index]
    const next = [...additional]
    if (main) next[index] = main
    else next.splice(index, 1)
    onChange({ main: chosen, additional: next })
    setAnnouncement(t('common.images.madeMain'))
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= additional.length || from === to) return
    const next = [...additional]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    pendingFocus.current = item.id
    onChange({ main, additional: next })
    setAnnouncement(t('common.images.moved', { position: to + 1, total: next.length }))
  }

  const resetDrag = () => {
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {main ? (
        <div
          {...mainDrop.handlers}
          className={cn(
            'relative overflow-hidden rounded-card border bg-surface-muted',
            mainDrop.dragging ? 'border-primary ring-2 ring-primary/30' : 'border-border',
            mainAspectClassName,
          )}
        >
          <Image src={main.url} alt={t('common.images.mainAlt')} className={cn('size-full', fit === 'cover' ? 'object-cover' : 'object-contain p-4')} />
          <span className="absolute top-2 left-2 inline-flex h-6 items-center gap-1 rounded-full bg-surface/95 px-2 text-xs font-semibold text-primary-text shadow-card">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
            {t('common.images.mainBadge')}
          </span>
          <button
            type="button"
            onClick={removeMain}
            disabled={mainLocked}
            aria-label={t('common.images.removeMain')}
            title={mainLocked ? lockedHint : t('common.images.removeMain')}
            className={cn(iconButton, 'absolute top-2 right-2', mainLocked && 'opacity-45')}
          >
            <CircleX className="size-5" />
          </button>
          <Button ref={ref} variant="outline" size="sm" icon={RefreshCw} className="absolute right-2 bottom-2" onClick={() => mainInputRef.current?.click()}>
            {t('common.images.replace')}
          </Button>
        </div>
      ) : (
        <DropZone
          id={field?.id}
          buttonRef={ref}
          describedBy={field?.describedBy}
          invalid={field?.invalid}
          onPick={() => mainInputRef.current?.click()}
          onFiles={(files) => addFiles(files, 'main')}
          className={mainAspectClassName}
        >
          <UploadPrompt maxMb={maxMb} compact={mainAspectClassName.includes('16/6')} />
        </DropZone>
      )}

      <ul ref={stripRef} className="grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label={t('common.images.additional')}>
        {additional.map((image, index) => {
          const locked = lockServerImages && !image.file
          return (
          <li key={image.id} className="group relative">
            <div
              data-image-id={image.id}
              tabIndex={0}
              draggable={!locked}
              aria-label={t('common.images.position', { index: index + 1, total: additional.length })}
              aria-describedby={hintId}
              onDragStart={(e) => {
                setDragIndex(index)
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', image.id)
              }}
              onDragEnd={resetDrag}
              onDragOver={(e) => {
                if (dragIndex === null) return
                e.preventDefault()
                setOverIndex(index)
              }}
              onDrop={(e) => {
                if (dragIndex === null) return
                e.preventDefault()
                move(dragIndex, index)
                resetDrag()
              }}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget || locked) return
                if (e.key === 'ArrowLeft') {
                  e.preventDefault()
                  move(index, index - 1)
                } else if (e.key === 'ArrowRight') {
                  e.preventDefault()
                  move(index, index + 1)
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                  e.preventDefault()
                  removeAdditional(index)
                }
              }}
              className={cn(
                'relative aspect-square overflow-hidden rounded-control border bg-surface-muted',
                locked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
                overIndex === index && dragIndex !== index ? 'border-primary ring-2 ring-primary/30' : 'border-border',
                dragIndex === index && 'opacity-50',
              )}
            >
              <Image src={image.url} draggable={false} className="size-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => removeAdditional(index)}
              disabled={locked}
              aria-label={t('common.images.removeNumber', { index: index + 1 })}
              title={locked ? lockedHint : t('common.images.remove')}
              className={cn(iconButton, 'absolute top-1 right-1 size-6', locked && 'opacity-45')}
            >
              <CircleX className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => makeMain(index)}
              disabled={locked}
              aria-label={t('common.images.makeMainNumber', { index: index + 1 })}
              title={locked ? lockedHint : t('common.images.makeMain')}
              className={cn(
                iconButton,
                'absolute bottom-1 left-1 size-6 hover:text-primary-text focus-visible:opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100',
                locked && 'hidden',
              )}
            >
              <Star className="size-3.5" />
            </button>
          </li>
          )
        })}
        {additional.length < maxAdditional && (
          <li className={cn(additional.length === 0 && 'col-span-2')}>
            <button
              type="button"
              onClick={() => addInputRef.current?.click()}
              {...addDrop.handlers}
              className={cn(
                'flex h-full min-h-20 w-full flex-col items-center justify-center gap-1 rounded-control border-2 border-dashed text-success-text transition-colors',
                addDrop.dragging ? 'border-success bg-success-soft' : 'border-border-strong hover:border-success hover:bg-success-soft',
                additional.length > 0 && 'aspect-square',
              )}
            >
              <CirclePlus className="size-5 fill-success text-on-success" aria-hidden="true" />
              <span className="text-xs font-semibold">{t('common.images.add')}</span>
            </button>
          </li>
        )}
      </ul>

      <p id={hintId} className="text-xs text-fg-subtle">
        {lockServerImages && lockedHint ? lockedHint : t('common.images.reorderHint')}
      </p>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <HiddenFileInput inputRef={mainInputRef} accept={accept} onFiles={(files) => addFiles(files, 'main')} />
      <HiddenFileInput inputRef={addInputRef} accept={accept} multiple onFiles={(files) => addFiles(files, 'additional')} />
      <ImageErrors errors={errors} />
    </div>
  )
}
