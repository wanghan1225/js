const scanImports = require('./scan')
const path = require('path')
const { build } = require('esbuild')
const fs = require('fs-extra')
const { normalizePath } = require('../utils')

async function createOptimizeDepsRun(config) {
    const deps = await scanImports(config)
    const { cacheDir } = config
    const depsCacheDir = path.resolve(cacheDir, 'deps')
    const metaDataPath = path.join(depsCacheDir, '_metadata.json')
    const metadata = {
        optimized: {}
    }
    debugger
    for(const id in deps) {
        const entry = deps[id]
        const file = path.resolve(depsCacheDir, id + '.js')
        metadata.optimized[id] = {
            src: entry,
            file
        }
        await build({
            absWorkingDir: process.cwd(),
            entryPoints: [deps[id]],
            outfile: file,
            bundle: true,
            write: true,
            format: 'esm'
        })
    }
    // await fs.ensureDir(depsCacheDir)
    await fs.writeFile(metaDataPath, JSON.stringify(metadata, (key, value) => {
        if (['src', 'file'].includes(key)) {
            return normalizePath(path.relative(depsCacheDir, value))
        }
        return value
    }))
    return { metadata }
    
}

exports.createOptimizeDepsRun = createOptimizeDepsRun