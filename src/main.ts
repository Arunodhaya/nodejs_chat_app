import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

// Middleware for parsing JSON requests
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
