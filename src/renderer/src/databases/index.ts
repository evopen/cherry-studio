import { FileMetadata, KnowledgeItem, QuickPhrase, TranslateHistory } from '@renderer/types'
// Import necessary types for blocks and new message structure
import type { Message as NewMessage, MessageBlock } from '@renderer/types/newMessage'
import { IpcChannel } from '@shared/IpcChannel'
import { Dexie, type EntityTable } from 'dexie'

import { upgradeToV5, upgradeToV7 } from './upgrades'

// Database declaration (move this to its own module also)
export const db = new Dexie('CherryStudio') as Dexie & {
  files: EntityTable<FileMetadata, 'id'>
  topics: EntityTable<{ id: string; messages: NewMessage[] }, 'id'> // Correct type for topics
  settings: EntityTable<{ id: string; value: any }, 'id'>
  knowledge_notes: EntityTable<KnowledgeItem, 'id'>
  translate_history: EntityTable<TranslateHistory, 'id'>
  quick_phrases: EntityTable<QuickPhrase, 'id'>
  message_blocks: EntityTable<MessageBlock, 'id'> // Correct type for message_blocks
}

db.version(1).stores({
  files: 'id, name, origin_name, path, size, ext, type, created_at, count'
})

db.version(2).stores({
  files: 'id, name, origin_name, path, size, ext, type, created_at, count',
  topics: '&id, messages',
  settings: '&id, value'
})

db.version(3).stores({
  files: 'id, name, origin_name, path, size, ext, type, created_at, count',
  topics: '&id, messages',
  settings: '&id, value',
  knowledge_notes: '&id, baseId, type, content, created_at, updated_at'
})

db.version(4).stores({
  files: 'id, name, origin_name, path, size, ext, type, created_at, count',
  topics: '&id, messages',
  settings: '&id, value',
  knowledge_notes: '&id, baseId, type, content, created_at, updated_at',
  translate_history: '&id, sourceText, targetText, sourceLanguage, targetLanguage, createdAt'
})

db.version(5)
  .stores({
    files: 'id, name, origin_name, path, size, ext, type, created_at, count',
    topics: '&id, messages',
    settings: '&id, value',
    knowledge_notes: '&id, baseId, type, content, created_at, updated_at',
    translate_history: '&id, sourceText, targetText, sourceLanguage, targetLanguage, createdAt'
  })
  .upgrade((tx) => upgradeToV5(tx))

db.version(6).stores({
  files: 'id, name, origin_name, path, size, ext, type, created_at, count',
  topics: '&id, messages',
  settings: '&id, value',
  knowledge_notes: '&id, baseId, type, content, created_at, updated_at',
  translate_history: '&id, sourceText, targetText, sourceLanguage, targetLanguage, createdAt',
  quick_phrases: 'id'
})

// --- NEW VERSION 7 ---
db.version(7)
  .stores({
    // Re-declare all tables for the new version
    files: 'id, name, origin_name, path, size, ext, type, created_at, count',
    topics: '&id', // Correct index for topics
    settings: '&id, value',
    knowledge_notes: '&id, baseId, type, content, created_at, updated_at',
    translate_history: '&id, sourceText, targetText, sourceLanguage, targetLanguage, createdAt',
    quick_phrases: 'id',
    message_blocks: 'id, messageId, file.id' // Correct syntax with comma separator
  })
  .upgrade((tx) => upgradeToV7(tx))

export default db

window.electron.ipcRenderer.on(IpcChannel.Api_GetAllTopics, async () => {
  const topics = await db.topics.toArray()
  const topicsData = JSON.parse(localStorage.getItem('topics') || '[]')
  const topicsWithMessages = []
  for (const topic of topics) {
    const topicData = topicsData.find((t) => t.id === topic.id)
    const messages = []
    if (topic.messages) {
      for (const message of topic.messages) {
        const blocks = await db.message_blocks.bulkGet(message.blocks || [])
        messages.push({ ...message, blocks: blocks.filter(Boolean) })
      }
    }
    topicsWithMessages.push({ ...topic, ...topicData, messages })
  }
  window.electron.ipcRenderer.send(IpcChannel.Api_Response, topicsWithMessages)
})

window.electron.ipcRenderer.on(IpcChannel.Api_GetTopicByID, async (event, id) => {
  const topic = await db.topics.get(id)
  if (topic) {
    const topicsData = JSON.parse(localStorage.getItem('topics') || '[]')
    const topicData = topicsData.find((t) => t.id === id)
    const messages = []
    if (topic.messages) {
      for (const message of topic.messages) {
        const blocks = await db.message_blocks.bulkGet(message.blocks || [])
        messages.push({ ...message, blocks: blocks.filter(Boolean) })
      }
    }
    window.electron.ipcRenderer.send(IpcChannel.Api_Response, { ...topic, ...topicData, messages })
  } else {
    window.electron.ipcRenderer.send(IpcChannel.Api_Response, null)
  }
})
