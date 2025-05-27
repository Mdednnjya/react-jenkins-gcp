const express = require('express');
const cors = require('cors');
const redis = require('redis');

const app = express();
const port = 3001;

// Redis client setup with proper v4+ syntax
const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT) || 6379
  }
});

client.on('error', (err) => {
  console.log('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Connected to Redis successfully');
});

client.on('ready', () => {
  console.log('Redis client ready to use');
});

// Connect to Redis
async function connectRedis() {
  try {
    await client.connect();
    console.log('Redis connection established');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
}

connectRedis();

app.use(cors());
app.use(express.json());

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await client.lRange('todos', 0, -1);
    const parsedTodos = todos.map(todo => JSON.parse(todo));
    res.json(parsedTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Add new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { name, todo } = req.body;
    
    if (!name || !todo) {
      return res.status(400).json({ error: 'Name and todo are required' });
    }

    const newTodo = {
      id: Date.now().toString(),
      name: name.trim(),
      todo: todo.trim(),
      done: false,
      createdAt: new Date().toISOString()
    };

    // Store in Redis with 2 hour expiration
    await client.lPush('todos', JSON.stringify(newTodo));
    await client.expire('todos', 7200); // 2 hours = 7200 seconds

    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// Toggle todo completion
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todos = await client.lRange('todos', 0, -1);
    
    const updatedTodos = todos.map(todoStr => {
      const todo = JSON.parse(todoStr);
      if (todo.id === id) {
        todo.done = !todo.done;
      }
      return JSON.stringify(todo);
    });

    // Clear and repopulate list
    await client.del('todos');
    if (updatedTodos.length > 0) {
      await client.lPush('todos', ...updatedTodos);
      await client.expire('todos', 7200);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todos = await client.lRange('todos', 0, -1);
    
    const filteredTodos = todos
      .map(todoStr => JSON.parse(todoStr))
      .filter(todo => todo.id !== id)
      .map(todo => JSON.stringify(todo));

    // Clear and repopulate list
    await client.del('todos');
    if (filteredTodos.length > 0) {
      await client.lPush('todos', ...filteredTodos);
      await client.expire('todos', 7200);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const redisStatus = client.isOpen ? 'connected' : 'disconnected';
    const redisPing = client.isOpen ? await client.ping() : 'disconnected';
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      redis: redisStatus,
      redis_ping: redisPing
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      redis: 'error'
    });
  }
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await client.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await client.quit();
  process.exit(0);
});
