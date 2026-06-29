import { CopyIcon, useTranslation } from '@payloadcms/ui'

import type { TranslateResolver } from '../../../resolvers/types.js'

import { useTranslator } from '../../providers/Translator/context.js'

export const ResolverButton = ({
  resolver: { key: resolverKey },
}: {
  resolver: TranslateResolver
}) => {
  const { openTranslator } = useTranslator()

  const { t } = useTranslation()

  const handleClick = () => openTranslator({ resolverKey })

  return (
    <button
      aria-label={`${resolverKey} button`}
      // use preview button class temporarily
      className="resolver-btn preview-btn"
      id={`translator__resolver-button-${resolverKey}`}
      onClick={handleClick}
      title={`${resolverKey} button`}
      type="button"
    >
      {/* {t(`plugin-translator:resolver_${resolverKey}_buttonLabel` as Parameters<typeof t>[0])} */}

      {resolverKey === 'copy' && <CopyIcon />}
      {resolverKey === 'aiSDK' && (
        <svg
          className="icon"
          height="1.5384615385rem"
          viewBox="0 0 256 256"
          width="1.5384615385rem"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect fill="none" height="256" width="256" />
          <circle
            cx="128"
            cy="128"
            fill="none"
            r="96"
            stroke="currentColor"
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth="12"
          />
          <path
            d="M168,128c0,64-40,96-40,96s-40-32-40-96,40-96,40-96S168,64,168,128Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth="12"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth="12"
            x1="37.46"
            x2="218.54"
            y1="96"
            y2="96"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth="12"
            x1="37.46"
            x2="218.54"
            y1="160"
            y2="160"
          />
        </svg>
      )}
    </button>
  )
}
