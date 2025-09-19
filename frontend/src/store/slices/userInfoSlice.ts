import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserInfoState {
  email: string | null;
  token: string | null;
}

// Load from localStorage if available
const savedUserInfo = localStorage.getItem("userInfo");

const initialState: UserInfoState = savedUserInfo
  ? JSON.parse(savedUserInfo)
  : {
      email: null,
      token: null,
    };

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    setUserInfo: (
      state,
      action: PayloadAction<{ email: string; token: string }>
    ) => {
      state.email = action.payload.email;
      state.token = action.payload.token;

      // Save to localStorage
      localStorage.setItem("userInfo", JSON.stringify(state));
    },
    clearUserInfo: (state) => {
      state.email = null;
      state.token = null;

      // Remove from localStorage
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setUserInfo, clearUserInfo } = userInfoSlice.actions;
export default userInfoSlice.reducer;
