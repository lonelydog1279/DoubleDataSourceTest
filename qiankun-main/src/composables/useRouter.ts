import { ref, onMounted, onUnmounted } from 'vue'

export function useRouter() {
  const currentPath = ref(window.location.pathname || '/')

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    currentPath.value = path
    // 触发 popstate 事件，让子应用的 router 感知到 URL 变化
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }))
  }

  const handlePopState = () => {
    currentPath.value = window.location.pathname || '/'
  }

  onMounted(() => {
    window.addEventListener('popstate', handlePopState)
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', handlePopState)
  })

  return {
    currentPath,
    navigate
  }
}
