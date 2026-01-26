import { ref, onMounted, onUnmounted } from 'vue'

export function useRouter() {
  const currentPath = ref(window.location.pathname || '/')

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    currentPath.value = path
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
