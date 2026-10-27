import axios from 'axios'

// The lab portal URL is not necessarily the payment API URL.
// Set NEXT_PUBLIC_OWO_API_BASE_URL to the verified sandbox API origin for testing.
const baseURL = (process.env.NEXT_PUBLIC_OWO_API_BASE_URL || 'https://api.owooafrika.com').replace(/\/$/, '')

const owoApi = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
})

// OWO 401 responses must not log users out of AGRICONNECT.
export default owoApi
