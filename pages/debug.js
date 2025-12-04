export default function Debug() {
  return (
    <div style={{padding:20}}>
      <h2>Debug Env Vars</h2>
      <pre>
        {JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "OK" : "MISSING",
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "OK" : "MISSING",
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "OK" : "MISSING",
        }, null, 2)}
      </pre>
    </div>
  );
}
