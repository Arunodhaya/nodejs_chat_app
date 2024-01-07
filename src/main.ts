import express from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv'
import UserRoutes from '../src/routes/user_route'
import AuthRoutes from '../src/routes/auth_route'
import GroupRoutes from '../src/routes/group_routes'

dotenv.config({ path: __dirname + "/../.env.local" });
dotenv.config({ path: __dirname + "/../.env" });
dotenv.config();

const app = express();
const port = process.env.APP_PORT;

// Middleware for parsing JSON requests
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/users",UserRoutes);
app.use("/auth",AuthRoutes);
app.use("/groups",GroupRoutes);


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
