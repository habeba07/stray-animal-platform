import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Helper function to get user from localStorage
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await api.post('/users/', userData);
      return response.data;
    } catch (error) {
      const message = 
        (error.response?.data?.detail) ||
        (error.response?.data?.message) ||
        error.message ||
        'Registration failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, thunkAPI) => {
    try {
      console.log('Attempting login with:', { username, password: '***' });
      
      // Use the custom login endpoint
      const response = await api.post('/login/', {
        username,
        password,
      });
      
      console.log('Login response:', response.data);
      
      if (response.data) {
        const userData = {
          token: response.data.token,
          user_id: response.data.user_id,
          username: response.data.username,
          user_type: response.data.user_type,
        };
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User data stored in localStorage:', userData);
        
        return userData;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let message = 'Login failed';
      
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.response?.data?.non_field_errors) {
        message = error.response.data.non_field_errors[0];
      } else if (error.message) {
        message = error.message;
      }
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      localStorage.removeItem('user');
      return {};
    } catch (error) {
      return thunkAPI.rejectWithValue('Logout failed');
    }
  }
);

const initialState = {
  user: getUserFromStorage(),
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setUserFromStorage: (state) => {
      state.user = getUserFromStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Registration successful';
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.message = 'Login successful';
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      });
  },
});

export const { reset, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;