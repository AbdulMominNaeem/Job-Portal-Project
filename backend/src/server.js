const app = require('./app');
const env = require('./config/env');

const port = env.PORT;
app.listen(port, () => {
  console.log(`[server] Listening on http://localhost:${port}`);
  console.log(`[server] API docs at http://localhost:${port}/api/docs`);
});
