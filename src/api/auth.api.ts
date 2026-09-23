import { DEFAULT_LIMIT } from '@/lib/pagination'
import { http } from './client'
import { USE_MOCK } from './featureFlags'
import { buildFormData } from './formData'
import { toAdmin, toProfileDataDto } from './mappers/admin'
import { toDashboard } from './mappers/dashboard'
import { adminDto, dashboardDto, loginResponseDto } from './types/auth.dto'
import { parseDto } from './types/common'
import type { Admin, Dashboard, LoginPayload, PasswordPayload, ProfilePayload } from './types/models'

export const authApi = {
  /** POST /auth/login → { token }. The profile is fetched separately. */
  async login(payload: LoginPayload): Promise<string> {
    const { data } = await http.post('/auth/login', {
      user_name: payload.userName.trim(),
      password: payload.password,
    })
    return parseDto(loginResponseDto, data, 'POST /auth/login').token
  },

  /** Path not documented; GET /auth is what the live API answers. */
  async profile(): Promise<Admin> {
    const { data } = await http.get('/auth')
    return toAdmin(parseDto(adminDto, data, 'GET /auth'))
  },

  async updateProfile(payload: ProfilePayload): Promise<Admin> {
    const { data } = await http.put(
      '/auth',
      buildFormData({ data: toProfileDataDto(payload), files: { avatar: payload.avatar?.file ?? null } }),
    )
    // Some backends answer with { message } only — re-read to stay in sync.
    const parsed = adminDto.safeParse(data)
    return parsed.success ? toAdmin(parsed.data) : authApi.profile()
  },

  async dashboard(): Promise<Dashboard> {
    const { data } = await http.get('/auth/index', { params: { limit: DEFAULT_LIMIT } })
    return toDashboard(parseDto(dashboardDto, data, 'GET /auth/index'))
  },

  /**
   * No password endpoint exists yet (USE_MOCK.passwordChange). The form stays
   * fully functional and the screen says the change is not persisted.
   */
  async changePassword(payload: PasswordPayload): Promise<void> {
    if (USE_MOCK.passwordChange) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return
    }
    await http.put('/auth/password', {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
    })
  },
}
