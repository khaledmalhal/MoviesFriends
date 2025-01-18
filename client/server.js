const http = require('http')
const url  = require('url')
const fs   = require('fs')

const hostname = 'localhost'
const port = 3012

const server = http.createServer((req, res) => {
    let q = url.parse(req.url, true);
    let filename = '.' + q.pathname
    let ext = filename.split('.').pop()

    if (filename == './') {
        filename = './index.html'
        ext = 'html'
    }
    fs.readFile(filename, function(err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'})
            return res.end("404 Not Found")
        }
        const types = {
            'html': 'text/html',
            'css' : 'text/css',
            'js'  : 'application/javascript',
            'svg' : 'image/svg+xml',
            'png' : 'image/png',
            'wav' : 'audio/wav',
            'mp4' : 'video/mp4'
        }
        try {
            res.writeHead(200, {'Content-Type': types[ext]})
            res.write(data)
        }
        catch (err) {
            console.log(`Error trying to read file with extension: ${ext}`)
        }
        return res.end()
    })
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})