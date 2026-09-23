import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { type Admin, DISABLED, USE_MOCK } from '@/api'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { MockNotice } from '@/components/ui/MockNotice'
import { PasswordInput, PasswordStrength } from '@/components/ui/PasswordInput'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useImagePicker } from '@/hooks/useImagePicker'
import { imageSchema, optionalPhoneSchema, requiredString } from '@/lib/validation'
import { toast } from '@/store/toast'
import { useChangePassword, useProfile, useUpdateProfile } from './queries'

const profileSchema = z.object({
  userName: requiredString(60),
  // GET /auth returns surname/phone as null, so neither is required here.
  surname: z.string().trim().max(60, 'validation.tooLong'),
  phone: optionalPhoneSchema,
  avatar: imageSchema.nullable(),
})
type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'validation.required'),
    newPassword: z.string().min(8, 'validation.passwordMin'),
    confirmPassword: z.string().min(1, 'validation.required'),
  })
  .superRefine((values, ctx) => {
    if (values.newPassword !== values.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'validation.passwordsMismatch' })
    }
    if (values.newPassword === values.currentPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newPassword'], message: 'validation.passwordSameAsCurrent' })
    }
  })
type PasswordValues = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const profile = useProfile()
  const errorMessage = useApiErrorMessage()

  if (profile.isPending) {
    return (
      <Card className="flex flex-col gap-6 p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="size-20 rounded-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-10 rounded-control" />
          <Skeleton className="h-10 rounded-control" />
          <Skeleton className="h-10 rounded-control" />
        </div>
      </Card>
    )
  }
  if (profile.isError) {
    return (
      <Card className="p-6">
        <ErrorState message={errorMessage(profile.error)} onRetry={() => profile.refetch()} />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <ProfileForm admin={profile.data} />
      <PasswordForm />
    </div>
  )
}

function ProfileForm({ admin }: { admin: Admin }) {
  const { t } = useTranslation()
  const update = useUpdateProfile()
  const errorMessage = useApiErrorMessage()
  const { pick, release, accept, maxMb } = useImagePicker()
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarErrors, setAvatarErrors] = useState<string[]>([])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      userName: admin.userName,
      surname: admin.surname,
      phone: admin.phone,
      avatar: admin.avatar ? { id: 'current-avatar', url: admin.avatar } : null,
    },
  })

  const avatar = useWatch({ control, name: 'avatar' })
  const userName = useWatch({ control, name: 'userName' })
  const surname = useWatch({ control, name: 'surname' })

  const onAvatarFiles = (files: FileList) => {
    const { images, errors: fileErrors } = pick(Array.from(files).slice(0, 1))
    setAvatarErrors(fileErrors)
    if (images[0]) {
      release(avatar)
      setValue('avatar', images[0], { shouldDirty: true })
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values)
      reset(values)
      toast.success(t('profile.saved'))
    } catch (error) {
      toast.error(errorMessage(error))
    }
  })

  return (
    <Card className="p-4 sm:p-6">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-fg">{t('profile.title')}</h2>
          <Button type="submit" variant="success" loading={isSubmitting}>
            {t('common.save')}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Avatar src={avatar?.url} name={`${userName} ${surname}`} size="xl" />
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="success" size="sm" icon={Upload} onClick={() => fileRef.current?.click()}>
                {t('profile.avatar.upload')}
              </Button>
              {/* PUT /auth accepts a new avatar only — there is no way to clear one. */}
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                disabled={DISABLED.avatarDelete || !avatar}
                title={t('profile.avatar.deleteUnavailable')}
              >
                {t('profile.avatar.delete')}
              </Button>
            </div>
            <p className="text-xs text-fg-subtle">{t('common.images.formats', { size: maxMb })}</p>
            {avatarErrors.map((error) => (
              <p key={error} role="alert" className="text-xs font-medium text-danger-text">
                {error}
              </p>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            hidden
            onChange={(event) => {
              if (event.target.files?.length) onAvatarFiles(event.target.files)
              event.target.value = ''
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t('profile.userName')} error={errors.userName?.message} required>
            <Input autoComplete="username" {...register('userName')} />
          </Field>
          <Field label={t('profile.phone')} error={errors.phone?.message}>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => <PhoneInput ref={field.ref} name={field.name} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
            />
          </Field>
          <Field label={t('profile.lastName')} error={errors.surname?.message}>
            <Input autoComplete="family-name" {...register('surname')} />
          </Field>
        </div>
      </form>
    </Card>
  )
}

function PasswordForm() {
  const { t } = useTranslation()
  const changePassword = useChangePassword()
  const errorMessage = useApiErrorMessage()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const newPassword = useWatch({ control, name: 'newPassword' })

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword: password }) => {
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword: password })
      reset()
      toast.success(t('profile.password.saved'))
    } catch (error) {
      toast.error(errorMessage(error))
    }
  })

  return (
    <Card className="p-4 sm:p-6">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-text">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-fg">{t('profile.password.title')}</h2>
            <p className="text-sm text-fg-muted">{t('profile.password.description')}</p>
          </div>
        </div>

        {USE_MOCK.passwordChange && <MockNotice>{t('profile.password.mockNotice')}</MockNotice>}

        <div className="grid items-start gap-4 md:grid-cols-3">
          <Field label={t('profile.password.current')} error={errors.currentPassword?.message} required>
            <PasswordInput autoComplete="current-password" {...register('currentPassword')} />
          </Field>
          <Field label={t('profile.password.new')} error={errors.newPassword?.message} required>
            <PasswordInput autoComplete="new-password" {...register('newPassword')} />
            <PasswordStrength password={newPassword} />
          </Field>
          <Field label={t('profile.password.confirm')} error={errors.confirmPassword?.message} required>
            <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
          </Field>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="success" loading={isSubmitting}>
            {t('profile.password.submit')}
          </Button>
        </div>
      </form>
    </Card>
  )
}
