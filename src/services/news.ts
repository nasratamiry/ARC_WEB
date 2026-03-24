import api from './api'
import { normalizeAssetUrl } from './helpers'
import type { NewsDetail, NewsItem, PaginatedResponse } from '../types/api'

const normalizeNewsItem = (item: NewsItem): NewsItem => ({
  ...item,
  image: normalizeAssetUrl(item.image),
})

const normalizeNewsDetail = (item: NewsDetail): NewsDetail => ({
  ...item,
  image: normalizeAssetUrl(item.image),
})

export const getNews = async (page?: number, tag?: string): Promise<PaginatedResponse<NewsItem>> => {
  const params: Record<string, string | number> = {}

  if (page) params.page = page
  if (tag) params.tag = tag

  const response = await api.get<PaginatedResponse<NewsItem>>('news/', { params })
  const data = response.data

  return {
    ...data,
    results: data.results.map(normalizeNewsItem),
  }
}

export const getNewsDetail = async (slug: string): Promise<NewsDetail> => {
  const response = await api.get<NewsDetail>(`news/${slug}/`)
  return normalizeNewsDetail(response.data)
}

export const getLatestNews = async (): Promise<NewsItem[]> => {
  const response = await api.get<NewsItem[] | PaginatedResponse<NewsItem>>('news/latest/')
  const payload = response.data
  const latest = Array.isArray(payload) ? payload : payload.results
  return latest.map(normalizeNewsItem)
}
