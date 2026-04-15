import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Сохранение кода
    try {
      const { name, code } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      // Генерируем короткий ID
      const id = generateShortId();

      // Сохраняем в KV
      await kv.set(`snippet:${id}`, {
        name: name || 'Untitled',
        code,
        createdAt: new Date().toISOString()
      }, {
        ex: 60 * 60 * 24 * 30 // Храним 30 дней
      });

      return res.status(200).json({ id });
    } catch (error) {
      console.error('Error saving snippet:', error);
      return res.status(500).json({ error: 'Failed to save snippet' });
    }
  }

  if (req.method === 'GET') {
    // Получение кода
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }

      const snippet = await kv.get(`snippet:${id}`);

      if (!snippet) {
        return res.status(404).json({ error: 'Snippet not found' });
      }

      return res.status(200).json(snippet);
    } catch (error) {
      console.error('Error fetching snippet:', error);
      return res.status(500).json({ error: 'Failed to fetch snippet' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
