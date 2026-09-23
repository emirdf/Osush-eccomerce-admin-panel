import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { requiredString } from '@/lib/validation'
import { useLogin } from './queries'

/** The API authenticates with user_name + password (not the phone number). */
const loginSchema = z.object({
  userName: requiredString(60),
  password: z.string().min(1, 'validation.required'),
  remember: z.boolean(),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { t } = useTranslation()
  const login = useLogin()
  const errorMessage = useApiErrorMessage()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userName: '', password: '', remember: true },
  })

  // On success the session store updates and <GuestRoute> redirects.
  const onSubmit = handleSubmit((values) => login.mutate(values))

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-8 bg-bg px-4 py-16">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <Logo className="h-10 sm:h-11" />

      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-fg">{t('auth.login.title')}</h1>
          <p className="text-base text-fg-muted">{t('auth.login.subtitle')}</p>
        </div>

        {login.isError && (
          <div role="alert" className="mb-5 flex items-start gap-2 rounded-control border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger-text">
            <CircleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
            {errorMessage(login.error)}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <Field label={t('auth.login.userName')} error={errors.userName?.message} required>
            <Input autoComplete="username" autoFocus placeholder={t('auth.login.userNamePlaceholder')} {...register('userName')} />
          </Field>

          <Field label={t('auth.login.password')} error={errors.password?.message} required>
            <PasswordInput autoComplete="current-password" placeholder={t('auth.login.passwordPlaceholder')} {...register('password')} />
          </Field>

          <label className="inline-flex w-fit cursor-pointer items-center gap-2.5 text-base text-fg">
            <Checkbox {...register('remember')} />
            {t('auth.login.remember')}
          </label>

          <Button type="submit" variant="success" loading={login.isPending} className="w-full">
            {t('auth.login.submit')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
