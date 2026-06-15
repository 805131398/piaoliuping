import * as React from "react"

/**
 * 组合多个 ref 的 hook
 * 用于将多个 ref 合并到一个 ref 中
 */
export function useComposedRef<T>(
  ...refs: Array<React.Ref<T> | undefined | null>
): React.RefCallback<T> {
  return React.useCallback((element: T) => {
    refs.forEach((ref) => {
      if (!ref) return

      if (typeof ref === "function") {
        ref(element)
      } else {
        ;(ref as React.MutableRefObject<T | null>).current = element
      }
    })
  }, [refs])
} 