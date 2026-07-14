import { configureStore } from '@reduxjs/toolkit';
import workspaceReducer from './Slice/workspaceSlice';
import emailTemplateReducer from './Slice/emailTemplateSlice';

const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    emailTemplate: emailTemplateReducer,
  },
  // Optimize for production
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serialization checks in production for better performance
      serializableCheck: process.env.NODE_ENV !== 'production',
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;