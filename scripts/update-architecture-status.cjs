const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
const safePath = value => /^(src\/[a-zA-Z0-9_./\[\]-]+\.(tsx?|json)|prisma\/schema\.prisma|docs\/architecture-final-project\.md)$/.test(value) && !value.split('/').includes('..')

function sourceFiles(root, directory = 'src') {
  const files = []
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue
    const file = `${directory}/${entry.name}`
    if (entry.isDirectory()) files.push(...sourceFiles(root, file))
    else if (/\.tsx?$/.test(file) && safePath(file)) files.push(file)
  }
  return files.sort()
}

function scan(root, definitions) {
  const evidence = {}
  for (const item of [...Object.values(definitions.componentDefinitions), ...definitions.connectionDefinitions]) {
    for (const reference of item.evidence) {
      const key = reference.path + '|' + reference.symbol
      if (!safePath(reference.path) || !reference.anchor) { evidence[key] = { valid: false, line: 0 }; continue }
      let source = ''
      try { source = fs.readFileSync(path.join(root, reference.path), 'utf8') } catch { /* No raw errors or logs enter the snapshot. */ }
      const offset = source.indexOf(reference.anchor)
      evidence[key] = { valid: offset >= 0, line: offset < 0 ? 0 : source.slice(0, offset).split('\n').length }
    }
  }
  const routes = []
  const calls = []
  for (const file of sourceFiles(root)) {
    const source = fs.readFileSync(path.join(root, file), 'utf8')
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
    if (/^src\/app\/api\/.+\/route\.ts$/.test(file)) {
      const route = file.replace(/^src\/app/, '').replace(/\/route\.ts$/, '')
      const exports = ast.statements.filter(node => ts.isFunctionDeclaration(node) && node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) && methods.includes(node.name?.text)).map(node => node.name.text)
      routes.push({ path: route, file, methods: exports, status: 'unknown' })
    }
    function visit(node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'fetch') {
        const target = node.arguments[0]
        // Only literal, local API paths. Never copy query values, dynamic payloads, URLs, headers, or source snippets.
        if (target && (ts.isStringLiteral(target) || ts.isNoSubstitutionTemplateLiteral(target))) {
          const route = target.text.split('?')[0]
          if (/^\/api\/[a-zA-Z0-9_/-]+$/.test(route)) {
            let method = node.arguments[1] ? null : 'GET'
            const options = node.arguments[1]
            if (options && ts.isObjectLiteralExpression(options)) {
              const property = options.properties.find(item => ts.isPropertyAssignment(item) && item.name.getText(ast).replace(/['"]/g, '') === 'method')
              method = !property ? 'GET' : ts.isStringLiteral(property.initializer) ? property.initializer.text.toUpperCase() : null
            }
            if (methods.includes(method)) calls.push({ caller: file, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, path: route, method })
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(ast)
  }
  const connections = calls.map(call => {
    const handler = routes.find(route => route.path === call.path && route.methods.includes(call.method))
    return { ...call, handler: handler?.file ?? null, status: handler ? 'partly_connected' : 'unknown' }
  })
  for (const route of routes) if (connections.some(connection => connection.handler === route.file)) route.status = 'partly_connected'
  return { generatedAt: new Date().toISOString(), workflowSourceDigest: require('./workflow-source-digest.cjs')(root), evidence, routes, connections }
}

function update(root = path.resolve(__dirname, '..')) {
  const module = { exports: {} }
  const source = fs.readFileSync(path.join(root, 'src/lib/architectureMap.ts'), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText
  new Function('require', 'module', 'exports', compiled)(name => {
    const files = {
      '@/data/workflowConnectionVerification.json': 'src/data/workflowConnectionVerification.json',
      '@/data/kioskConnectionVerification.json': 'src/data/kioskConnectionVerification.json',
      '@/data/architectureStatusVerification.json': 'src/data/architectureStatusVerification.json',
      '@/data/softwareConnectionVerification.json': 'src/data/softwareConnectionVerification.json',
      '@/data/architectureStatusSnapshot.json': 'src/data/architectureStatusSnapshot.json',
    }
    if (!files[name]) throw new Error('Unsupported architecture dependency')
    return JSON.parse(fs.readFileSync(path.join(root, files[name]), 'utf8'))
  }, module, module.exports)
  const snapshot = scan(root, module.exports)
  fs.writeFileSync(path.join(root, 'src/data/architectureStatusSnapshot.json'), JSON.stringify(snapshot, null, 2) + '\n')
  return snapshot
}

module.exports = { scan, update, safePath }
if (require.main === module) {
  try {
    const snapshot = update()
    console.log(`Architecture inventory updated: ${snapshot.routes.length} routes, ${snapshot.connections.length} local calls. No service or database queries performed.`)
  } catch {
    console.error('Architecture inventory could not be updated. Check source metadata locally; no diagnostic content is published.')
    process.exitCode = 1
  }
}
