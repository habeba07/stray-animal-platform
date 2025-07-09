import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const submitReport = createAsyncThunk(
  'reports/submit',
  async (reportData, thunkAPI) => {
    try {
      const response = await api.post('/reports/', reportData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchReports = createAsyncThunk(
  'reports/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/reports/');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchMyReports = createAsyncThunk(
  'reports/fetchMyReports',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/reports/my_reports/');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchReportById = createAsyncThunk(
  'reports/fetchOne',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/reports/${id}/`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateReportStatus = createAsyncThunk(
  'reports/updateStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await api.post(`/reports/${id}/update_status/`, { status });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addReportNote = createAsyncThunk(
  'reports/addNote',
  async ({ id, notes }, thunkAPI) => {
    try {
      const response = await api.post(`/reports/${id}/add_note/`, { notes });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const cancelReport = createAsyncThunk(
  'reports/cancel',
  async ({ id, reason }, thunkAPI) => {
    try {
      const response = await api.post(`/reports/${id}/cancel_report/`, { reason });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  reports: [],
  myReports: [],
  currentReport: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
    clearMyReports: (state) => {
      state.myReports = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Report
      .addCase(submitReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reports.push(action.payload);
        state.myReports.unshift(action.payload); // Add to beginning of myReports
      })
      .addCase(submitReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Fetch All Reports (for staff/admin)
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Fetch My Reports (for public users)
      .addCase(fetchMyReports.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myReports = action.payload;
      })
      .addCase(fetchMyReports.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Fetch Report By ID
      .addCase(fetchReportById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentReport = action.payload;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update Report Status
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentReport = action.payload;
        const index = state.reports.findIndex(report => report.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        const myIndex = state.myReports.findIndex(report => report.id === action.payload.id);
        if (myIndex !== -1) {
          state.myReports[myIndex] = action.payload;
        }
      })
      
      // Add Report Note
      .addCase(addReportNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addReportNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(addReportNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Cancel Report
      .addCase(cancelReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        // Update the report status in both arrays
        const reportId = action.meta.arg.id;
        const updateReport = (report) => {
          if (report.id === reportId) {
            return { ...report, status: 'CANCELLED' };
          }
          return report;
        };
        state.reports = state.reports.map(updateReport);
        state.myReports = state.myReports.map(updateReport);
      })
      .addCase(cancelReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentReport, clearMyReports } = reportSlice.actions;
export default reportSlice.reducer;