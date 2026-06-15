import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Repository {
  id: string
  name: string
  url: string
  branch: string
  username?: string
  token?: string
  isDefault: boolean
  lastUsed: Date
}

interface RepositoryStore {
  repositories: Repository[]
  currentRepository: Repository | null
  defaultRepository: Repository | null
  
  // 仓库管理
  addRepository: (repo: Omit<Repository, 'id' | 'lastUsed'>) => void
  updateRepository: (id: string, updates: Partial<Repository>) => void
  removeRepository: (id: string) => void
  setDefaultRepository: (id: string) => void
  setCurrentRepository: (id: string) => void
  
  // 获取仓库
  getRepositoryById: (id: string) => Repository | undefined
  getDefaultRepository: () => Repository | null
}

export const useRepositoryStore = create<RepositoryStore>()(
  persist(
    (set, get) => ({
      repositories: [],
      currentRepository: null,
      defaultRepository: null,

      addRepository: (repo) => {
        const newRepo: Repository = {
          ...repo,
          id: `${repo.url}_${repo.branch}`.replace(/[^a-zA-Z0-9]/g, '_'),
          lastUsed: new Date()
        }
        
        set((state) => {
          const updatedRepos = [...state.repositories, newRepo]
          
          // 如果设置为默认，取消其他默认设置
          if (newRepo.isDefault) {
            updatedRepos.forEach(r => {
              if (r.id !== newRepo.id) r.isDefault = false
            })
          }
          
          return {
            repositories: updatedRepos,
            defaultRepository: newRepo.isDefault ? newRepo : state.defaultRepository,
            currentRepository: newRepo
          }
        })
      },

      updateRepository: (id, updates) => {
        set((state) => {
          const updatedRepos = state.repositories.map(repo => {
            if (repo.id === id) {
              const updated = { ...repo, ...updates }
              
              // 如果设置为默认，取消其他默认设置
              if (updates.isDefault) {
                updatedRepos.forEach(r => {
                  if (r.id !== id) r.isDefault = false
                })
              }
              
              return updated
            }
            return repo
          })
          
          const updatedRepo = updatedRepos.find(r => r.id === id)
          
          return {
            repositories: updatedRepos,
            defaultRepository: updatedRepo?.isDefault ? updatedRepo : state.defaultRepository,
            currentRepository: state.currentRepository?.id === id ? updatedRepo || null : state.currentRepository
          }
        })
      },

      removeRepository: (id) => {
        set((state) => {
          const updatedRepos = state.repositories.filter(r => r.id !== id)
          const removedRepo = state.repositories.find(r => r.id === id)
          
          return {
            repositories: updatedRepos,
            currentRepository: state.currentRepository?.id === id ? null : state.currentRepository,
            defaultRepository: state.defaultRepository?.id === id ? null : state.defaultRepository
          }
        })
      },

      setDefaultRepository: (id) => {
        set((state) => {
          const updatedRepos = state.repositories.map(repo => ({
            ...repo,
            isDefault: repo.id === id
          }))
          
          const newDefault = updatedRepos.find(r => r.id === id)
          
          return {
            repositories: updatedRepos,
            defaultRepository: newDefault || null
          }
        })
      },

      setCurrentRepository: (id) => {
        const repo = get().repositories.find(r => r.id === id)
        if (repo) {
          set((state) => ({
            currentRepository: repo,
            repositories: state.repositories.map(r => 
              r.id === id ? { ...r, lastUsed: new Date() } : r
            )
          }))
        }
      },

      getRepositoryById: (id) => {
        return get().repositories.find(r => r.id === id)
      },

      getDefaultRepository: () => {
        return get().repositories.find(r => r.isDefault) || null
      }
    }),
    {
      name: 'repository-store',
      version: 1
    }
  )
) 