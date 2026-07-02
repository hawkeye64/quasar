import { join, normalize } from 'node:path'
import fse from 'fs-extra'

const targetFolder = normalize(join(import.meta.dirname, '../dist'))

fse.removeSync(targetFolder)
fse.ensureDirSync(targetFolder)
console.log(' 💥 Cleaned build artifacts.\n')
