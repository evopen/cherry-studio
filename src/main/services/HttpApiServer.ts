import { app, ipcMain } from 'electron'
import express from 'express'
import { Server } from 'http'

import { IpcChannel } from '../../../packages/shared/IpcChannel'
import { configManager } from './ConfigManager'
import { windowService } from './WindowService'

export class HttpApiServer {
  private app: express.Application
  private server: Server | null = null

  constructor() {
    this.app = express()
    this.setupRoutes()
  }

  private setupRoutes() {
    this.app.get('/version', (_, res) => {
      res.json({ version: app.getVersion() })
    })

    this.app.get('/topics', async (_, res) => {
      const mainWindow = windowService.getMainWindow()
      if (!mainWindow) {
        return res.status(503).json({ error: 'Service unavailable' })
      }

      ipcMain.once(IpcChannel.Api_Response, (event, data) => {
        res.json(data)
      })
      mainWindow.webContents.send(IpcChannel.Api_GetAllTopics)
    })

    this.app.get('/topic/:id', async (req, res) => {
      const mainWindow = windowService.getMainWindow()
      if (!mainWindow) {
        return res.status(503).json({ error: 'Service unavailable' })
      }

      const { id } = req.params

      ipcMain.once(IpcChannel.Api_Response, (event, data) => {
        res.json(data)
      })
      mainWindow.webContents.send(IpcChannel.Api_GetTopicByID, id)
    })
  }

  public start() {
    const port = configManager.getHttpApiServerPort()
    this.server = this.app.listen(port, () => {
      console.log(`HTTP API server listening on port ${port}`)
    })
  }

  public stop() {
    if (this.server) {
      this.server.close(() => {
        console.log('HTTP API server stopped')
      })
      this.server = null
    }
  }

  public isRunning(): boolean {
    return this.server !== null
  }
}

export const httpApiServer = new HttpApiServer()
