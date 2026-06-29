import React from 'react'

interface IconGridProps {
  baseClass: string
  icons?: Record<string, string>
  onIconSelect: (icon: string) => void
  onMouseEnter?: (icon: string) => void
  onMouseLeave?: () => void
  rtl?: boolean
  selectedIcon?: string
}

export const IconGrid: React.FC<IconGridProps> = ({
  baseClass,
  icons,
  onIconSelect,
  onMouseEnter,
  onMouseLeave,
  selectedIcon,
}) => {
  const handleIconClick = (e: React.MouseEvent, icon: string) => {
    e.stopPropagation()
    onIconSelect(icon)
  }

  if (!icons || Object.keys(icons).length === 0) {
    return <span>No icons found</span>
  }

  return Object.keys(icons)
    .slice(0, 140)
    .map((icon, index) => (
      <button
        aria-label={icon}
        aria-pressed={selectedIcon === icon}
        className={`${baseClass}__icon-picker-modal__icon-option ${
          selectedIcon === icon ? `${baseClass}__icon-picker-modal__icon-option-active` : ''
        }`}
        key={icon}
        onClick={(e) => handleIconClick(e, icon)}
        onMouseEnter={() => onMouseEnter?.(icon)}
        onMouseLeave={() => onMouseLeave?.()}
        title={icon}
        type="button"
      >
        <span
          dangerouslySetInnerHTML={{
            __html: icons[icon] || '',
          }}
        />
      </button>
    ))
}
