import React, { useState } from "react";
import AuthModal from "../modal-components/AuthModal";
import { useSelector } from "react-redux";
import { type RootState } from "../../store/store";

const NavBar: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const isLogin = useSelector(
    (state: RootState) => state.userInfo.token !== null
  );
  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="text-2xl font-bold text-blue-600 cursor-pointer">
            Pastebin
          </div>
          <div className="flex items-center space-x-6">
            {!isLogin && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default NavBar;
