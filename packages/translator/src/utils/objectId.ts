// Generate a 24-char hex id for new array/block rows, matching the shape Payload
// uses for document IDs. Avoids a runtime dependency on bson-objectid.
export const objectId = (): string => {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0')
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(
    '',
  )
  return `${timestamp}${random}`
}
