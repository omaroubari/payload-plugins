import React from 'react'

interface SearchInputProps {
  className?: string
  disabled?: boolean
  onChange: (value: string) => void
  placeholder?: string
  value: string
}

export const SearchInput: React.FC<SearchInputProps> = ({
  className,
  disabled,
  onChange,
  placeholder = 'Search icons...',
  value,
}) => {
  const searchClassName = `${className}__icon-search`

  return (
    <div className={searchClassName}>
      <input
        className="search_field"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  )
}
