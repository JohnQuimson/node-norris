const http = require('http');
const port = process.env.PORT || 8000;
const host = process.env.HOST || 'localhost';
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const readJSONData = (nomeFile) => {
  const filePath = path.join(__dirname, nomeFile + '.json');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const fileData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileData);
};

const writeJSONData = (nomeFile, newData) => {
  const filePath = path.join(__dirname, nomeFile + '.json');
  const fileString = JSON.stringify(newData);
  fs.writeFileSync(filePath, fileString);
};

const server = http.createServer((req, res) => {
  const norrisDb = readJSONData('norrisDb');

  switch (req.url) {
    case '/favicon.ico':
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end();
      break;

    case '/list':
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      let fileHtml = '<ul>';
      norrisDb.forEach((u) => (fileHtml += `<li>${u.joke}</li>`));
      fileHtml += '</ul>';
      res.end(fileHtml);
      break;

    case '/':
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fetch('https://api.chucknorris.io/jokes/random')
        .then((response) => response.json())
        .then((data) => {
          // scrivo la nuova battuta nel norrisDb.json
          const updatedNorrisDb = [...norrisDb, { joke: data.value }];
          writeJSONData('norrisDb', updatedNorrisDb);

          res.write(`<p>${data.value}</p>`);
          res.end();
        });
      break;

    default:
      const joke = req.url.slice(1);
      writeJSONData('norrisDb', [...norrisDb, { joke }]);
      res.writeHead(301, { Location: '/list' });
      res.end();
      break;
  }
});

server.listen(port, host, () => {
  console.log(`Server avviato su http://${host}:${port}`);
});
