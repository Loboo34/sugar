
import { LogOut, User, ShoppingBag } from "lucide-react";
import { Button } from "./Button";
import { useAuthStore } from "../store/auth.store";

const Header = () => {
  const itemCount = 0; // Replace with actual item count from state or props
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center ml-16 lg:ml-0">
            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mr-2 sm:mr-3" />
            <h1 className="text-lg sm:text-2xl font-bold text-amber-900 truncate">
              <span className="hidden sm:inline">Golden Crust Bakery</span>
              <span className="sm:hidden">Golden Crust</span>
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {itemCount > 0 && (
              <div className="bg-amber-100 text-amber-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                <span className="hidden sm:inline">
                  Cart: {itemCount} items
                </span>
                <span className="sm:hidden">{itemCount}</span>
              </div>
            )}

            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user?.name}</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                {user?.role}
              </span>
            </div>

            {/* Mobile user info */}
            <div className="sm:hidden flex items-center space-x-1">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                {user?.role}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-red-600 p-1 sm:p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
