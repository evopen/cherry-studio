import { app } from 'electron'
import express from 'express'
import { Server } from 'http'

import { configManager } from './ConfigManager'

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
