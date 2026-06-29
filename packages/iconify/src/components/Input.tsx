'use client'
import type { ChangeEvent } from 'react'

import { getTranslation } from '@payloadcms/translations'
import {
  fieldBaseClass,
  FieldDescription,
  FieldError,
  FieldLabel,
  RenderCustomComponent,
  useDebounce,
  useTranslation,
} from '@payloadcms/ui'
import React, { useMemo, useState } from 'react'

import type { InputProps } from '../types.js'

import { IconGrid } from './IconGrid.js'
import { SearchInput } from './SearchInput.js'
import './index.scss'

const baseClass = 'icon'

export const Input: React.FC<InputProps> = (props) => {
  const {
    AfterInput,
    BeforeInput,
    className,
    customIcons,
    Description,
    description,
    Error,
    icons,
    inputRef,
    Label,
    label,
    localized,
    onChange,
    onKeyDown,
    path,
    placeholder,
    readOnly,
    required,
    rtl,
    searchError,
    searchLoading,
    searchResults,
    showError,
    style,
    value,
  } = props

  const { i18n } = useTranslation()

  const [fieldIsFocused, setFieldIsFocused] = useState(false)
  const [hoveredIcon, setHoveredIcon] = useState<null | string>(null)

  // Merge custom icons with fetched icons (custom icons take precedence)
  const mergedIcons = useMemo(() => {
    const allIcons = { ...customIcons }
    if (icons) {
      Object.assign(allIcons, icons)
    }
    return allIcons
  }, [icons, customIcons])

  // filter mergedIcons by searchResults
  const filteredIcons = useMemo(() => {
    if (!searchResults || searchResults.length === 0) {
      return mergedIcons
    }
    const filtered: Record<string, string> = {}
    searchResults.forEach((result) => {
      if (mergedIcons[result]) {
        filtered[result] = mergedIcons[result]
      }
    })
    if (value && mergedIcons[value]) {
      filtered[value] = mergedIcons[value]
    }
    return filtered
  }, [mergedIcons, searchResults, value])

  const totalIcons = useMemo(() => Object.keys(mergedIcons).length, [mergedIcons])

  const displayedIcons = useMemo(() => Object.keys(filteredIcons).length, [filteredIcons])

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const newValue = evt.target.value
    onChange?.(evt as any)
  }

  const inputMessage = searchLoading
    ? 'Loading icons...'
    : searchError
      ? 'Failed to load icons'
      : `Showing ${displayedIcons > 140 ? 140 : displayedIcons} icons of ${totalIcons}`

  return (
    <div
      className={[fieldBaseClass, 'icon', className, showError && 'error', readOnly && 'read-only']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <RenderCustomComponent
        CustomComponent={Label}
        Fallback={
          <FieldLabel label={label} localized={localized} path={path} required={required} />
        }
      />
      <div className={`${fieldBaseClass}__wrap`}>
        <RenderCustomComponent
          CustomComponent={Error}
          Fallback={<FieldError path={path} showError={showError} />}
        />
        {BeforeInput}
        <div
          className={`${baseClass}__input-container`}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setTimeout(() => {
                setFieldIsFocused(false)
              }, 200)
            }
          }}
          onFocus={() => {
            setFieldIsFocused(true)

            // Initialize search with current field value when modal opens
          }}
        >
          {!rtl && (
            <button
              aria-label="Open icon picker"
              className={`${baseClass}__icon-preview`}
              onClick={() => setFieldIsFocused(true)}
              type="button"
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: (value && mergedIcons && mergedIcons[value]) || '',
                }}
              />
            </button>
          )}
          <input
            data-rtl={rtl}
            disabled={readOnly}
            id={`field-${path.replace(/\./g, '__')}`}
            name={path}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            placeholder={getTranslation(placeholder as string, i18n)}
            ref={inputRef}
            style={{
              borderRadius: '0px 3px 3px 0px',
              marginLeft: '-1px',
            }}
            type="text"
            value={value || ''}
          />
          {rtl && (
            <button
              aria-label="Open icon picker"
              className={`${baseClass}__icon-preview`}
              onClick={() => setFieldIsFocused(true)}
              type="button"
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: (value && mergedIcons && mergedIcons[value]) || '',
                }}
              />
            </button>
          )}
          {fieldIsFocused && (
            <div
              className={`${baseClass}__icon-picker-modal ${
                rtl ? `${baseClass}__icon-picker-modal--rtl` : ''
              }`}
            >
              <div className={`${baseClass}__icon-picker-modal__pagination-meta-container`}>
                <span aria-live="polite">{inputMessage}</span>
              </div>
              <div className={`${baseClass}__icon-picker-modal__icon-container`}>
                {searchLoading && <span>Loading icons...</span>}
                {!searchLoading && searchError && <span>{searchError}</span>}
                {!searchLoading && !searchError && (
                  <IconGrid
                    baseClass={baseClass}
                    icons={filteredIcons}
                    onIconSelect={(icon) => {
                      onChange?.({
                        target: {
                          name: path,
                          value: icon,
                        },
                      } as ChangeEvent<HTMLInputElement>)
                      setFieldIsFocused(false)
                    }}
                    onMouseEnter={(icon) => setHoveredIcon(icon)}
                    onMouseLeave={() => setHoveredIcon(null)}
                    rtl={rtl}
                    selectedIcon={value}
                  />
                )}
              </div>
              <SearchInput
                className={baseClass}
                disabled={true}
                onChange={(evt) => {}}
                placeholder="Select an icon..."
                value={hoveredIcon || value || ''}
              />
            </div>
          )}
        </div>
        {AfterInput}
        <RenderCustomComponent
          CustomComponent={Description}
          Fallback={<FieldDescription description={description} path={path} />}
        />
      </div>
    </div>
  )
}
