import React, { useState } from "react";
import Modal from "./Modal";
import { publicApi } from "../../utils/axiosInstance";
import { validateAuthData } from "../../utils/validateAuthData";
import { setUserInfo } from "../../store/slices/userInfoSlice";
import { useDispatch } from "react-redux";
import Toast from "../toast-component/Toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true); // <-- FIX: local toggle
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationResult = validateAuthData(email, password);
    if (!validationResult.success) {
      setError(validationResult.error || "Invalid input");
      return;
    }
    try {
      const response = await publicApi.post("/users/login", {
        email,
        password,
      });
      if (response.status !== 200) {
        setError("Login failed");
      } else {
        console.log("Login successful", response.data);
        dispatch(
          setUserInfo({
            email,
            token: response.data.token,
          })
        );
        setSuccessMessage("Login successful!");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationResult = validateAuthData(email, password, confirmPassword);
    if (!validationResult.success) {
      setError(validationResult.error || "Invalid input");
      return;
    }
    try {
      const response = await publicApi.post("users/register", {
        email,
        password,
      });
      if (response.status !== 201) {
        setError("Signup failed");
      } else {
        console.log("Signup successful", response.data);
        dispatch(
          setUserInfo({
            email,
            token: response.data.token,
          })
        );
        setSuccessMessage("Signup successful!");
      }
    } catch (err) {
      setError("Signup failed");
    }
  };

  return (
    <>
      {" "}
      {error && (
        <Toast message={error} variant="failure" onClose={() => setError("")} />
      )}
      {successMessage && (
        <Toast
          message={successMessage}
          variant="success"
          onClose={() => {
            setSuccessMessage("");
            onClose();
          }}
          duration={3000}
        />
      )}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isLogin ? "Log In" : "Sign Up"}
      >
        <div className="mb-4 flex justify-center space-x-4">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`px-4 py-2 font-medium rounded-t-lg focus:outline-none ${
              isLogin
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setIsLogin(false); // <-- switch to signup
              setError("");
            }}
            className={`px-4 py-2 font-medium rounded-t-lg focus:outline-none ${
              !isLogin
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* {error && <div className="text-red-500 text-sm mb-2">{error}</div>} */}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Log In
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4" noValidate>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default AuthModal;
