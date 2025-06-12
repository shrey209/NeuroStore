import express from 'express';
import { User } from '@neurostore/shared/types';

const app = express();
const PORT = 4000;

const user: User = {
  id: "123",
  name: "Shreyash"
};

app.get('/', (_req, res) => {
  res.send('Hello from backend!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
