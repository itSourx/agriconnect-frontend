import axios from 'axios'

const api = axios.create({
  baseURL: 'https://agriconnect-bc17856a61b8.herokuapp.com',
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*'
  }
})

export { api } 