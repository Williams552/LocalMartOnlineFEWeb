import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  avatar: "",
  isAdmin: false,
  access_token: "",
  birth_day: "",
  gender: "Other",
  password: "",
};




export const userSlides = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const {
        _id,
        full_name,
        email,
        phone,
        avatar,
        role_id,
        access_token,
        birth_day,
        gender,
        password,
      } = action.payload;
      state.access_token = access_token;
      state.id = _id;
      state.full_name = full_name;
      state.email = email;
      state.phone = phone;
      state.avatar = avatar;
      state.isAdmin = role_id?.role_name;
      state.birth_day = birth_day;
      state.gender = gender;
      state.password = password;
    },

    resetUser: (state) => {
      state.access_token = "";
      state.id = "";
      state.full_name = "";
      state.email = "";
      state.phone = "";
      state.avatar = "";
      state.isAdmin = false;
      state.birth_day = ""; 
      state.gender = "Other"; 
      state.password = ""; 
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateUser, resetUser } = userSlides.actions;
export default userSlides.reducer;
