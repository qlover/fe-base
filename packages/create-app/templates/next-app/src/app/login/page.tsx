import BaseHeader from '@/uikit/components/BaseHeader';

export default function LoginPage() {
  return (
    <div className="flex flex-col h-screen">
      <BaseHeader />

      <div className="flex flex-1 text-sm bg-primary">
        {/* Left side - Brand section */}
        <div className="hidden lg:flex lg:w-1/2 bg-secondary p-12 flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-brand rounded-lg"></div>
            <span className="text-2xl font-semibold text-text">Brain App</span>
          </div>
          <h1 className="text-4xl font-bold text-text mb-4">Welcome Back!</h1>
          <p className="text-text-secondary text-lg mb-8">
            Sign in to continue your learning journey
          </p>
          <div className="space-y-4">
            <FeatureItem icon="🎯" text="AI-Powered Learning Paths" />
            <FeatureItem icon="🎯" text="Smart Recommendations" />
            <FeatureItem icon="📊" text="Progress Tracking" />
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
          <div className="w-full max-w-[420px]">
            <h2 className="text-2xl font-semibold mb-2 text-text">Sign In</h2>
            <p className="text-text-secondary mb-8">
              Welcome back! Please enter your details.
            </p>

            <form className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  // value={formData.email}
                  // onChange={handleInputChange}
                  className="w-full h-12 px-4 text-base bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  // value={formData.password}
                  // onChange={handleInputChange}
                  className="w-full h-12 px-4 text-base bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-brand hover:text-brand-hover text-sm"
                >
                  Forgot password?
                </a>
              </div>

              {/* <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand text-white rounded-lg text-base font-medium hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button> */}

              <div className="text-center text-text-tertiary my-4">
                or continue with
              </div>

              <button
                type="button"
                className="w-full h-12 bg-secondary border border-border rounded-lg text-base font-medium hover:bg-elevated"
              >
                Sign in with Google
              </button>

              <div className="text-center mt-6">
                <span className="text-text-tertiary">
                  Don&apos;t have an account?{' '}
                </span>
                <a
                  href="/register"
                  className="text-brand hover:text-brand-hover"
                >
                  Sign up
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for feature items
function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 text-text">
      <div className="w-8 h-8 bg-elevated rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}
