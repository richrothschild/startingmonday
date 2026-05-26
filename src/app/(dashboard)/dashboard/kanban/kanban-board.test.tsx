import { describe, expect, it } from 'vitest'
import { KanbanBoard } from './kanban-board'

describe('kanban board module', () => {
  it('exports KanbanBoard', () => {
    expect(typeof KanbanBoard).toBe('function')
  })
})