import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080', // This points to your backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
