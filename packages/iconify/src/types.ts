import type { IconifyCategories, IconifyInfo } from '@iconify/types'
import type {
  FieldClientComponent,
  StaticDescription,
  StaticLabel,
  TextFieldClient,
  TextFieldValidation,
} from 'payload'
import type { ChangeEvent, ComponentType } from 'react'
import type React from 'react'

// Custom implementation of MarkOptional from 'ts-essentials'
type MarkOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type SharedIconPickerFieldProps = {
  readonly hasMany?: false
  readonly onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export type InputProps = {
  readonly AfterInput?: React.ReactNode
  readonly BeforeInput?: React.ReactNode
  readonly className?: string
  readonly customIcons?: Record<string, string>
  readonly Description?: React.ReactNode
  readonly description?: StaticDescription
  readonly Error?: React.ReactNode
  readonly icons?: Record<string, string>
  // readonly iconLoadError?: string | Error | null
  // readonly iconsLoading?: boolean
  readonly inputRef?: React.RefObject<HTMLInputElement>
  readonly Label?: React.ReactNode
  readonly label?: StaticLabel
  readonly localized?: boolean
  readonly onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  readonly path: string
  readonly placeholder?: Record<string, string> | string
  readonly readOnly?: boolean
  readonly required?: boolean
  readonly rtl?: boolean
  readonly searchError?: null | string
  readonly searchLoading?: boolean
  readonly searchResults?: string[]
  readonly searchTerm?: string
  readonly showError?: boolean
  readonly style?: React.CSSProperties
  readonly value?: string
} & SharedIconPickerFieldProps

type IconPickerFieldClientWithoutType = MarkOptional<TextFieldClient, 'type'>

type IconPickerFieldProps = {
  readonly customIcons?: Record<string, string>
  readonly icons?: null | string | string[]
  readonly inputRef?: React.RefObject<HTMLInputElement>
  readonly onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  readonly path: string
  readonly validate?: TextFieldValidation
}
export type IconPickerFieldClientComponent = FieldClientComponent<
  IconPickerFieldClientWithoutType,
  IconPickerFieldProps
>

type IconPrefix = string

export interface IconCollection {
  categories?: IconifyCategories
  icons?: any
  prefix?: string
  title?: string
  total?: number
}

export interface IconOptions {
  collections?: IconPrefix[]
  showName?: boolean
}

// export interface IconifyPluginConfig {
//   collections?: IconPrefix[];
//   showName?: boolean;
// }

export interface IconifySearchResult {
  collections: Record<string, IconifyInfo>
  icons: string[]
}
