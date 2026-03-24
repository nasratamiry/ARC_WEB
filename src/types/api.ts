export type Tag = {
  name: string
  slug: string
}

export type NewsItem = {
  title: string
  slug: string
  image: string
  excerpt: string
  created_at: string
}

export type NewsDetail = {
  title: string
  slug: string
  content: string
  image: string
  excerpt: string
  tags: Tag[]
  created_at: string
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type Partner = {
  name: string
  logo: string
  website: string
  description: string
  order: number
}

export type ContactPayload = {
  name: string
  email: string
  message: string
}
