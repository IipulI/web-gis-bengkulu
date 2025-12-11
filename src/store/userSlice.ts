import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface IUser {
  userId: string | null;
  name: string | null;
  username: string | null;
  role: string | null;
  token: string | null;
}

// ✅ Ambil dari localStorage jika ada
const savedUser = localStorage.getItem("user");
const initialState: IUser = savedUser
  ? JSON.parse(savedUser)
  : { userId: null, token: null, role: null, username: null, name: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<IUser>) => {
      // Simpan ke localStorage juga agar persist
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
    clearUserData: () => {
      localStorage.removeItem("user");
      return {
        userId: null,
        token: null,
        role: null,
        username: null,
        name: null,
      };
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;
