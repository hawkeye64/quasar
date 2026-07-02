// oxlint-disable-next-line default-param-last
export function debounce(fn, wait = 250, immediate) {
  let timer = null

  function debounced(...args) {
    const later = () => {
      timer = null
      if (!immediate) {
        fn.apply(this, args)
      }
    }

    if (timer !== null) {
      clearTimeout(timer)
    } else if (immediate) {
      fn.apply(this, args)
    }

    timer = setTimeout(later, wait)
  }

  debounced.cancel = () => {
    if (timer !== null) clearTimeout(timer)
  }

  return debounced
}

export default function throttle(fn, limit = 250) {
  let wait = false,
    result

  return function runThrottle(...args) {
    if (!wait) {
      wait = true
      setTimeout(() => {
        wait = false
      }, limit)

      result = fn.apply(this, args)
    }

    return result
  }
}
