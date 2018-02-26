let fs = require('fs')
let path = require('path')
let reg = /\/[a-zA-Z0-9]+\.stylus/
let stylus = require('stylus')
const proxyMiddleware = require('http-proxy-middleware')

let cssPreprocessor = (req, res, next) => {
  if (reg.test(req.url)) {
    let content = fs.readFileSync(path.join('./src', req.url), 'utf8')
    
    stylus.render(content, { filename: `${req.url.split('/').pop().split('.')[0]}.css` }, (err, css) => {
      if (err) {
        throw err
      }
      
      res.setHeader('Content-Type', 'text/css')      
      res.end(css)
    })
  } else if (req.url === '/api/tree') {
    res.setHeader('Content-Type', 'application/json')      
    res.end(JSON.stringify([
      { 
        name: 'Root 1',
        children: [
          { 
            name: 'Sub Root 1', 
            children: [
              { name: 'Leaf 1' },
              { name: 'Leaf 2' },
              { name: 'Leaf 3' },
              { name: 'Leaf 4' }
            ]
          },
          { 
            name: 'Sub Root 2', 
            children: [
              { name: 'Leaf 1' },
              { name: 'Leaf 2' },
              { name: 'Leaf 3' },
              { name: 'Leaf 4' }
            ]
          }
        ]
      },
      { 
        name: 'Root 2',
        children: [
          { 
            name: 'Sub Root 1',
            children: [
              { name: 'Leaf 1' },
              { name: 'Leaf 2' },
              { name: 'Leaf 3' },
              { name: 'Leaf 4' }
            ] 
          },
          { 
            name: 'Sub Root 2',
            children: [
              { name: 'Leaf 1' },
              { name: 'Leaf 2' },
              { name: 'Leaf 3' },
              { name: 'Leaf 4' }
            ] 
          }
        ]
      },
    ]))
  } else {
    next()
  }
}

module.exports = {
  port: 8001,
  files: ['./src/**/*.{html,htm,css,js,stylus}'],
  browser: 'Google Chrome',
  server: {
    baseDir: './src',
    middleware: {
      1: cssPreprocessor,
      2: proxyMiddleware('/api', {
        pathRewrite: {'^/api' : ''},
        target: 'http://192.168.1.159:9030'
      })
    }
  }
}