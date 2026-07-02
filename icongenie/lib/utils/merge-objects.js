export function mergeObjects(...args) {
  const base = {}

  for (let i = 0; i < args.length; i++) {
    const obj = args[i]

    Object.keys(obj).forEach(key => {
      if (obj[key] !== void 0) {
        base[key] = obj[key]
      }
    })
  }

  return base
}
