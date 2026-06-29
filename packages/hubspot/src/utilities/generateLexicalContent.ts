export interface TextElement {
  direction?: 'ltr' | 'rtl' | null | undefined
  text: string
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'p'
}

export const generateLexicalContent = (elements: TextElement[]) => {
  return {
    root: {
      type: 'root',
      children: elements.map((element) => {
        if (element.type === 'p') {
          return {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: element.text,
                version: 1,
              },
            ],
            direction: element.direction || 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          }
        } else {
          return {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: element.text,
                version: 1,
              },
            ],
            direction: element.direction || 'ltr',
            format: '',
            indent: 0,
            tag: element.type,
            version: 1,
          }
        }
      }),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  } as any
}
