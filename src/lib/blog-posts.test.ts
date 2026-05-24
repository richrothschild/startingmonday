import { describe, expect, it } from 'vitest'
import { BLOG_POSTS, getPost, getRelated } from './blog-posts'

describe('blog posts module', () => {
  it('exposes BLOG_POSTS content', () => {
    expect(Array.isArray(BLOG_POSTS)).toBe(true)
    expect(BLOG_POSTS.length).toBeGreaterThan(0)
  })

  it('exposes lookup helpers', () => {
    const first = BLOG_POSTS[0]
    expect(getPost(first.slug)?.slug).toBe(first.slug)
    expect(Array.isArray(getRelated(first.slug))).toBe(true)
  })
})