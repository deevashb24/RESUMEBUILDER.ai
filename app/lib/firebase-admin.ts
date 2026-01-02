import "server-only"
import { initializeApp, getApps, getApp, cert, ServiceAccount } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// 1. Prepare Service Account (For Local/Vercel)
// On Firebase App Hosting, this is often auto-handled by default credentials
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

let app

if (getApps().length === 0) {
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount
      app = initializeApp({
        credential: cert(serviceAccount)
      })
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY", e)
      app = initializeApp() 
    }
  } else {
    // Fallback for Firebase App Hosting (Uses Google Cloud Default Credentials)
    app = initializeApp() 
  }
} else {
  app = getApp()
}

const adminDb = getFirestore(app)

export { adminDb }