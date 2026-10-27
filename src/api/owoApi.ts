import axios from 'axios'

// The sandbox URL is provided by OWO. Never silently fall back to production in a test build.
const configuredUrl = process.env.NEXT_PUBLIC_OWO_API_BASE_URL
const isTestEnvironment = process.env.NEXT_PUBLIC_OWO_ENV === 'test'
const baseURL = (configuredUrl || (isTestEnvironment ? 'https://lab.owooafrika.com' : 'https://api.owooafrika.com')).replace(/\/$/, '')

if (isTestEnvironment && new URL(baseURL).hostname !== 'lab.owooafrika.com') {
  throw new Error('OWO test mode requires https://lab.owooafrika.com')
}

const owoApi = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
})

// OWO authentication errors must not sign users out of AGRICONNECT.
export default owoApi
