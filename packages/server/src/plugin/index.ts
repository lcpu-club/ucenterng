import { join } from 'path'
import { Logger } from 'pino'
import { HookManager } from '../hook/index.js'
import { APP_ROOT, Initable } from '../util/index.js'

export type Plugin = (hooks: HookManager) => void | Promise<void>

async function tryImport(path: string): Promise<unknown> {
  try {
    return await import(path)
  } catch (err) {
    return null
  }
}

async function loadPlugin(path: string): Promise<Plugin> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let plugin: any = await tryImport(path)
  plugin ??= await tryImport(join(APP_ROOT, 'plugins', path, 'lib', 'index.js'))
  plugin ??= await tryImport(join(APP_ROOT, 'plugins', path, 'index.js'))
  plugin ??= await tryImport(`./${path}.js`)
  if (plugin) return plugin.default as Plugin
  throw new Error(`Could not load plugin ${path}`)
}

export interface IPluginManagerInjects {
  logger: Logger
  hooks: HookManager
}

export interface IPluginManagerOptions {
  plugins: string[]
}

export class PluginManager extends Initable {
  plugins: Plugin[] = []

  constructor(
    public injects: IPluginManagerInjects,
    public options: IPluginManagerOptions
  ) {
    super(injects.logger)
  }

  async setup() {
    for (const path of this.options.plugins) {
      const plugin = await loadPlugin(path)
      await plugin(this.injects.hooks)
      this.logger.info(`Loaded plugin ${path}`)
    }
  }
}
