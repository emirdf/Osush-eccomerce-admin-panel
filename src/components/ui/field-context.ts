import { createContext, useContext } from 'react'

export interface FieldContextValue {
  id: string
  invalid: boolean
  describedBy?: string
}

/** Lets controls inside <Field> pick up id / aria-invalid / aria-describedby automatically. */
export const FieldContext = createContext<FieldContextValue | null>(null)

export const useFieldContext = () => useContext(FieldContext)
