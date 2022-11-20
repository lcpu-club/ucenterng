import minimist from 'minimist'
import { App } from '../app.js'
import { CONFIG } from '../config/index.js'
import { VERSION } from '../util/index.js'

const argv = minimist(process.argv.slice(2))

if (argv.v || argv.version) {
  console.log(VERSION)
  process.exit(0)
}

if (argv.h || argv.help) {
  console.log('Usage: cli.js [options]')
  console.log('Options:')
  console.log('  -h, --help          Show this help')
  console.log('  -v, --version       Show version')
  console.log('  -s, --script <name> Show version')
  process.exit(0)
}

const app = new App(CONFIG)
await app.init()

if (argv.s || argv.script) {
  await app.exec(argv.s || argv.script)
  process.exit(0)
}

await app.start()
