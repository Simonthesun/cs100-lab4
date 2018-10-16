const express = require('express');
const expressVue = require('express-vue');
const path = require('path');
const sqlite3 = require('sqlite3');
require('cross-fetch/polyfill');

const hostname = '127.0.0.1';
const port = 3000;

const API_KEY = '6f433300-bafc-11e8-88c5-811c39b2c016';

// let comments = [];

// Initialize Express
const app = express();
app.use(express.static('static'));

// Options for express-vue
const vueOptions = {
  head: {
    title: 'Harvard Art Museums',
    metas: [
      {
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
    ],
    styles: [
      {
        style: 'static/css/styles.css'
      },
      {
        style: 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
      }
    ]
  },
  rootPath: path.join(__dirname, '/views')
};


// Initialize express-vue
const expressVueMiddleware = expressVue.init(vueOptions);
app.use(expressVueMiddleware);

// List galleries
app.get('/', (req, res) => {
  const url = `https://api.harvardartmuseums.org/gallery?size=100&apikey=${API_KEY}`;
  fetch(url)
  .then(response => response.json())
  .then(data => {
    let galleries = data.records;
    res.renderVue('index.vue', {galleries});
  });
});

// List objects
app.get('/gallery/:gallery_id', (req, res) => {
  const objsUrl = `https://api.harvardartmuseums.org/object?apikey=${API_KEY}&size=99&gallery=${req.params.gallery_id}`;
  fetch(objsUrl)
  .then(response => response.json())
  .then(data => {
    let objects = data.records;
    let people = [];

    objects.forEach((obj) => {
      let ppl = "None Listed";

      if (obj.people) {
        for (let i = 0; i < obj.people.length; i++) {
          if (i > 0) {
            ppl = ppl + ", " + obj.people[i].name;
          } else {
            ppl = obj.people[i].name;
          }
        }

        people.push(ppl);
      } else {
        people.push("");
      }
    })
    res.renderVue('gallery.vue', {objects, people});
  });
});

// Show object
app.get('/object/:object_id', (req, res) => {
  objUrl = `https://api.harvardartmuseums.org/object?apikey=${API_KEY}&objectnumber=${req.params.object_id}`;
  fetch(objUrl)
  .then(response => response.json())
  .then(data => {
    let object = data.records[0];
    loadDatabase(res, object, req.params.object_id);
  });
});

app.post('/object/:object_id', (req, res) => {
  getComment(req, result => {
      comment = result.substring(8).replace(/\+/g,' '); // very hacky
      // obj = req.params.object_id;

      // comments.push({
      //   comment: comment,
      //   object: obj
      // });

      loadDatabase(res, null, req.params.object_id, comment);

      res.redirect(301, `${req.url}`);
  });
});

// Comment on object
app.get('/object/:object_id/comment', (req, res) => {
  objUrl = `https://api.harvardartmuseums.org/object?apikey=${API_KEY}&objectnumber=${req.params.object_id}`;
  fetch(objUrl)
  .then(response => response.json())
  .then(data => {
    let object = data.records[0];
    loadDatabase(res, object, req.params.object_id);
    
  });
});

// Listen on socket
app.listen(port, hostname, () => {
  console.log(`Server running on http://${hostname}:${port}/`);
});

function getComment(request, callback) {
    let text = '';

    request.on('data', chunk => {
        text += chunk;
        console.log(text);
    });
    request.on('end', () => {
        callback(text);
    });
}

function addComment(object, comment, db) {
  let insert = `INSERT INTO comments (object, comment) VALUES (?, ?)`;

  db.run(insert, [object, comment], (err) => {
    if (err) {
      return console.error(err.message);
    }
  });
}

function loadDatabase(res, objData, object, comment=null) {

  let db = new sqlite3.Database('comments.db', (err) => {
    if (err) {
      console.error(err.message);
    }

    let sql = `SELECT * FROM comments WHERE object = ?`;

    db.all(sql, [object], (err, rows) => {
      if (err) {
        console.error(err.message);
      }

      if (objData != null) {
        let filteredComments = rows.filter((row) => {
          return row.object == object;
        })
        
        res.renderVue('object.vue', {objData, filteredComments});
      }
    });

    if (comment != null) {
      addComment(object, comment, db);
    }
  })
}