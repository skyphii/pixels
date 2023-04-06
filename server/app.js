const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const EventEmitter = require('events');

const Stream = new EventEmitter();

const port = 3000;

// Set up a MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'pixels',
  authPlugins: {
    mysql_native_password: () => () => Buffer.from('password')
  }
});

// Use the cors middleware to allow cross-origin requests
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

// Handle incoming requests to /pixels
app.get('/pixel', (req, res) => {
  // Get the coordinates from the query parameters
  const x = parseInt(req.query.x);
  const y = parseInt(req.query.y);

  // Get a connection from the MySQL connection pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
      return;
    }

    // Execute a SELECT statement to get the pixel at the specified coordinates
    const query = 'SELECT * FROM pixels WHERE x = ? AND y = ?';
    connection.query(query, [x, y], (err, results) => {
      connection.release();

      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
        return;
      }

      // If no pixel is found, return a white pixel
      if (results.length === 0) {
        res.json({ x, y, colour: '#FFFFFF' });
        return;
      }

      // Return the pixel as JSON
      const pixel = results[0];
      res.json(pixel);
    });
  });
});

// Handle incoming requests to /pixels
app.get('/pixels', (req, res) => {
  // Get the coordinates, width and height from the query parameters
  const x = parseInt(req.query.x);
  const y = parseInt(req.query.y);
  const width = parseInt(req.query.width);
  const height = parseInt(req.query.height);

  // Get a connection from the MySQL connection pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
      return;
    }

    // Execute a SELECT statement to get the pixels in the specified rectangular area
    const query = 'SELECT * FROM pixels WHERE x >= ? AND x < ? AND y >= ? AND y < ?';
    connection.query(query, [x, x + width, y, y + height], (err, results) => {
      connection.release();

      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
        return;
      }

      // If no pixels are found, return an empty array
      if (results.length === 0) {
        res.json([]);
        return;
      }

      const returnValue = { pixels: results};
      // Return the pixels as an array of coordinate objects
      res.json(returnValue);
    });
  });
});

// Handle incoming requests to /pixels/update
app.post('/pixels/update', (req, res) => {
  // Get the coordinates and colour from the request body
  const x = req.body.x;
  const y = req.body.y;
  const colour = req.body.colour;

  // Get a connection from the MySQL connection pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal server error');
      return;
    }

    // Execute an INSERT statement to insert or update the pixel at the specified coordinates
    const query = 'INSERT INTO pixels (x, y, colour) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE colour = ?';
    connection.query(query, [x, y, colour, colour], (err, results) => {
      connection.release();

      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
        return;
      }

      // Return a success message
      res.send('Pixel updated successfully');

      clients.forEach(c => {
        c.write('event: update\n');
        c.write(`data: {"x": ${x}, "y": ${y}, "colour": "${colour}"}`);
        c.write('\n\n');
      });
    });
  });
});

clients = [];

app.get('/sse', function(request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  clients.push(response);

  response.write('connected\n\n');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
