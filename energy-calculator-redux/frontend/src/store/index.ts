import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import appliances from './appliancesSlice';
export const store = configureStore({ reducer: { auth, appliances } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
