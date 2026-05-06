import { signIn, signOut, auth } from "../../auth"

export default async function AuthJsTestPage() {
  const session = await auth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 p-8">
      <h1 className="text-4xl font-bold mb-8">Auth.js Test Page</h1>
      
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {session?.user ? (
          <div className="space-y-6">
            <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
              <h2 className="text-xl font-semibold mb-2">Authenticated!</h2>
              <p>Welcome, <strong>{session.user.email}</strong></p>
            </div>
            
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <button
                type="submit"
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200">
              <h2 className="text-xl font-semibold mb-2">Not Authenticated</h2>
              <p>You are currently signed out.</p>
            </div>

            <form
              action={async (formData) => {
                "use server"
                await signIn("credentials", formData)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="test@example.com" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Any password works" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mt-4"
              >
                Sign In with Credentials
              </button>
            </form>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        Note: Clerk is still installed and active in the root layout. This is just an isolated test for Auth.js.
      </p>
    </div>
  )
}
