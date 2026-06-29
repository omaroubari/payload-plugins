'use client'

import { useConfig, useField, useLocale, withCondition } from '@payloadcms/ui'
import React, { useCallback, useMemo } from 'react'

import type { IconPickerFieldClientComponent } from './types.js'

import { Input } from './components/Input.js'
import { useFetchIconData, useSearch } from './endpoints/api.js'
import { isFieldRTL } from './utils/isFieldRTL.js'
import { mergeFieldStyles } from './utils/mergeFieldStyles.js'

const IconPickerField: IconPickerFieldClientComponent = (props) => {
  const {
    customIcons,
    field,
    field: {
      admin: { className, description, placeholder, rtl } = {},
      label,
      localized,
      maxLength,
      minLength,
      required,
    },
    icons,
    inputRef,
    path,
    readOnly,
    validate,
  } = props

  const locale = useLocale()

  const {
    config: { localization },
  } = useConfig()

  const memoizedValidate = useCallback(
    (value: string, options: any) => {
      if (typeof validate === 'function') {
        return validate(value, { ...options, maxLength, minLength, required }) || true
      }
      return true
    },
    [validate, minLength, maxLength, required],
  )

  const {
    customComponents: { AfterInput, BeforeInput, Description, Error: ErrorComponent, Label } = {},
    setValue,
    showError,
    value,
  } = useField({
    path,
    validate: memoizedValidate,
  })

  const collections = typeof icons === 'string' ? [icons] : Array.isArray(icons) ? icons : null

  // Use API search across specific icon set or all collections
  const {
    data: searchResults,
    debouncedTerm,
    error,
    isError,
    isLoading,
    isPreviousData,
    setTerm,
    term,
  } = useSearch({
    collections,
  })

  const iconsFromSearch = useMemo(() => {
    if (Object.keys(searchResults).length === 0) {
      return []
    }

    const iconMap: string[] = []

    for (const [iconSet, iconList] of Object.entries(searchResults)) {
      iconList.forEach((icon) => iconMap.push(`${iconSet}:${icon}`))
    }

    return iconMap
  }, [searchResults])

  const {
    error: iconsError,
    icons: fetchedIcons,
    isLoading: iconsLoading,
  } = useFetchIconData(searchResults)

  const renderRTL = isFieldRTL({
    fieldLocalized: Boolean(localized),
    fieldRTL: Boolean(rtl),
    locale,
    localizationConfig: localization || undefined,
  })

  const styles = useMemo(() => mergeFieldStyles(field), [field])

  return (
    <Input
      AfterInput={AfterInput}
      BeforeInput={BeforeInput}
      className={className}
      customIcons={customIcons}
      Description={Description}
      description={description}
      Error={ErrorComponent}
      icons={fetchedIcons}
      inputRef={inputRef}
      Label={Label}
      label={label}
      localized={localized}
      onChange={(e) => {
        const value = e.target.value
        setValue(value)
        setTerm(value)
      }}
      path={path}
      placeholder={placeholder}
      readOnly={readOnly}
      required={required}
      rtl={renderRTL}
      searchError={error || iconsError}
      searchLoading={isLoading || iconsLoading}
      searchResults={iconsFromSearch}
      showError={showError}
      style={styles}
      value={(value as string) || ''}
    />
  )
}

export const IconPickerFieldComponent: IconPickerFieldClientComponent =
  withCondition(IconPickerField)
