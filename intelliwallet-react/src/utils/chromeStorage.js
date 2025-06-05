// Chrome Extension Storage Adapter
// This provides a unified interface for both Chrome extension storage and localStorage

export class ChromeStorageAdapter {
  constructor() {
    this.isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local
  }

  async get(keys) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, resolve)
      })
    } else {
      // Fallback to localStorage for development
      const result = {}
      if (Array.isArray(keys)) {
        keys.forEach(key => {
          const value = localStorage.getItem(key)
          if (value) {
            try {
              result[key] = JSON.parse(value)
            } catch {
              result[key] = value
            }
          }
        })
      } else if (typeof keys === 'object') {
        Object.keys(keys).forEach(key => {
          const value = localStorage.getItem(key)
          if (value) {
            try {
              result[key] = JSON.parse(value)
            } catch {
              result[key] = value
            }
          }
        })
      } else {
        const value = localStorage.getItem(keys)
        if (value) {
          try {
            result[keys] = JSON.parse(value)
          } catch {
            result[keys] = value
          }
        }
      }
      return Promise.resolve(result)
    }
  }

  async set(items) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.set(items, resolve)
      })
    } else {
      // Fallback to localStorage for development
      Object.keys(items).forEach(key => {
        const value = typeof items[key] === 'string' ? items[key] : JSON.stringify(items[key])
        localStorage.setItem(key, value)
      })
      return Promise.resolve()
    }
  }

  async remove(keys) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(keys, resolve)
      })
    } else {
      // Fallback to localStorage for development
      if (Array.isArray(keys)) {
        keys.forEach(key => localStorage.removeItem(key))
      } else {
        localStorage.removeItem(keys)
      }
      return Promise.resolve()
    }
  }

  async clear() {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(resolve)
      })
    } else {
      localStorage.clear()
      return Promise.resolve()
    }
  }
}

// Export singleton instance
export const chromeStorage = new ChromeStorageAdapter()