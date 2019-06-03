const express = require('express');
const bp = require('body-parser');
const validator = require('ajv');
const taskSchema = require('./schemas/task');

const app = express();
const router = express.Router();
const port = process.env.PORT || 8080;
const tasks = new Map();

app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());

router.post('/', (req, res) => {
  const ajv = new validator();
  const valid = ajv.validate(taskSchema, req.query);
  if (!valid) {
    return res.send(500, {
      status: 500,
      errors: ajv.errors
    });
  }

  const task = {
    ...req.body,
    id: `${new Date().getTime()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.set(task.id, task);

  res.json(Array.from(tasks));
});

router.get('/', (_, res) =>
  res.json(Array.from(tasks)));

router.delete('/:id', (req, res) => {
  const task = tasks.delete(req.params.id);
  res.json(task);
});

router.post('/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  const { name, priority, dueDate } = req.body;
  Object.assign(task,
    { name, priority, dueDate },
    { updatedAt: new Date() });

  res.json(task);
});

app.use(express.static(__dirname + '/public'));
app.use('/api/tasks/', router);
app.set('views', './views')
app.listen(port, () => console.log(`Server Up and Running http://127.0.0.1:${port}`));
