import React, { useState } from "react";
import { User, Lock, ShoppingBag } from "lucide-react";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/auth.store";


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {login, isLoading} = useAuthStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }
        try {
            await login(email, password);
        } catch (err) {
            console.error("Login failed:", err);
        }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ShoppingBag className="h-12 w-12 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-amber-800 mb-2">
              Golden Crust Bakery
            </h1>
            <p className="text-amber-600">Point of Sale System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )} */}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={!email || !password}
            >
              Sign In
            </Button>
          </form>
          </div>
      </div>
    );
}

export default Login;