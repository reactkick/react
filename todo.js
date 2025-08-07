// Simple To-Do List Application - API Server for ReactKick

// Bu sürüm, orijinal komut satırı uygulamasını bir Express.js API sunucusuna dönüştürür.
// Bir React veya başka bir frontend uygulaması bu API'yi kullanarak to-do listesini yönetebilir.
//
// Gerekli Paketler:
// npm install express cors
//
// Sunucuyu Başlatma:
// node todo.js
//
// API Uç Noktaları (Endpoints):
//   GET    /api/todos          -> Tüm to-do'ları listeler
//   POST   /api/todos          -> Yeni bir to-do ekler (body: { "task": "..." })
//   PATCH  /api/todos/:id      -> Bir to-do'yu günceller (body: { "task": "...", "done": true/false })
//   DELETE /api/todos/:id      -> Bir to-do'yu siler

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // React uygulamanızdan farklı bir port seçin
const STORAGE_FILE = path.resolve(__dirname, 'todo.json');

// Middleware'ler
app.use(cors()); // Farklı porttaki React uygulamasından gelen isteklere izin verir
app.use(express.json()); // Gelen JSON request body'lerini ayrıştırır

// Helper: Dosyadan to-do'ları yükler
function loadTodos() {
  if (!fs.existsSync(STORAGE_FILE)) return [];
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load todos:', err);
    return [];
  }
}

// Helper: To-do'ları dosyaya kaydeder
function saveTodos(todos) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(todos, null, 2));
  } catch (err)
 {
    console.error('Failed to save todos:', err);
  }
}

// --- API Rotaları ---

// GET /api/todos - Tüm to-do'ları listeler
app.get('/api/todos', (req, res) => {
  const todos = loadTodos();
  res.json(todos);
});

// POST /api/todos - Yeni bir to-do ekler
app.post('/api/todos', (req, res) => {
  const { task } = req.body;
  if (!task || typeof task !== 'string') {
    return res.status(400).json({ error: 'Task description is required and must be a string.' });
  }

  const todos = loadTodos();
  const newTodo = {
    id: Date.now(), // Basit ve benzersiz bir ID için timestamp kullanılıyor
    task,
    done: false,
  };

  todos.push(newTodo);
  saveTodos(todos);

  res.status(201).json(newTodo); // Başarıyla oluşturulduğunu ve yeni objeyi döndürür
});

// PATCH /api/todos/:id - Bir to-do'yu günceller (tamamlandı olarak işaretleme veya metni düzenleme)
app.patch('/api/todos/:id', (req, res) => {
  const todos = loadTodos();
  const todoId = Number(req.params.id);
  const { task, done } = req.body;

  const todo = todos.find((t) => t.id === todoId);

  if (!todo) {
    return res.status(404).json({ error: `No todo found with id: ${todoId}` });
  }

  // İstek gövdesinde hangi alanlar varsa onları günceller
  if (task !== undefined) {
    todo.task = String(task);
  }
  if (done !== undefined) {
    todo.done = Boolean(done);
  }

  saveTodos(todos);
  res.json(todo); // Güncellenmiş objeyi döndürür
});

// DELETE /api/todos/:id - Bir to-do'yu siler
app.delete('/api/todos/:id', (req, res) => {
  let todos = loadTodos();
  const todoId = Number(req.params.id);
  const initialLength = todos.length;

  const newTodos = todos.filter((t) => t.id !== todoId);

  if (newTodos.length === initialLength) {
    return res.status(404).json({ error: `No todo found with id: ${todoId}` });
  }

  saveTodos(newTodos);
  res.status(204).send(); // Başarılı silme işleminde standart yanıt (No Content)
});


// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`To-Do API server is running on http://localhost:${PORT}`);
});
