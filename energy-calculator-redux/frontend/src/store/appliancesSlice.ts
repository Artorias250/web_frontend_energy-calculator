import axios from 'axios';
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
  isPending,
  isFulfilled,
  isRejected,
} from '@reduxjs/toolkit';
import {
  applianceApi,
  toAppliance,
  errorMessage,
  isBackendUnavailable,
} from '../api';
import type { PublishApplianceDto } from '../api/generated/Api';
import { PUBLISHED_APPLIANCES, type Appliance } from '../data/appliances';
import { loggedOut } from './authSlice';

export type DataSource = 'api' | 'mock' | null;
export interface AppliancesState {
  minPower: number;
  items: Appliance[];
  feed: Appliance | null;
  draft: Appliance | null;
  catalogSource: DataSource;
  feedSource: DataSource;
  error: string | null;
  requests: Record<string, boolean>;
  listRequest?: string;
  feedRequest?: string;
}
const initialState: AppliancesState = {
  minPower: 0,
  items: [],
  feed: null,
  draft: null,
  catalogSource: null,
  feedSource: null,
  error: null,
  requests: {},
};
type ThunkState = {
  appliances: AppliancesState;
  auth: { isAuthenticated: boolean };
};
const thunk = createAsyncThunk.withTypes<{
  state: ThunkState;
  rejectValue: string;
}>();

export const fetchAppliances = thunk(
  'appliances/fetchAppliances',
  async (_, tools) => {
    const minPower = tools.getState().appliances.minPower;
    try {
      const response = await applianceApi.api.getAppliances(
        { minPower },
        { signal: tools.signal },
      );
      return { items: response.data.map(toAppliance), source: 'api' as const };
    } catch (error) {
      if (tools.signal.aborted) throw error;
      if (isBackendUnavailable(error)) {
        if (tools.getState().auth.isAuthenticated) tools.dispatch(loggedOut());
        const value = tools.getState().appliances.minPower;
        return {
          items: PUBLISHED_APPLIANCES.filter(
            (item) => item.powerWatts >= value,
          ),
          source: 'mock' as const,
        };
      }
      return tools.rejectWithValue(errorMessage(error));
    }
  },
);
export const fetchApplianceFeed = thunk(
  'appliances/fetchApplianceFeed',
  async (args: { id?: number; next?: boolean }, tools) => {
    try {
      const response =
        args.id === undefined
          ? await applianceApi.api.getApplianceFeed({ signal: tools.signal })
          : await applianceApi.api.getApplianceFeedById(
              args.id,
              { next: args.next },
              { signal: tools.signal },
            );
      return { item: toAppliance(response.data), source: 'api' as const };
    } catch (error) {
      if (tools.signal.aborted) throw error;
      if (isBackendUnavailable(error)) {
        if (tools.getState().auth.isAuthenticated) tools.dispatch(loggedOut());
        const index =
          args.id === undefined
            ? 0
            : PUBLISHED_APPLIANCES.findIndex((item) => item.id === args.id);
        if (index < 0) return tools.rejectWithValue('Прибор не найден');
        const item =
          PUBLISHED_APPLIANCES[
            args.next ? (index + 1) % PUBLISHED_APPLIANCES.length : index
          ];
        return { item, source: 'mock' as const };
      }
      return tools.rejectWithValue(errorMessage(error));
    }
  },
);
export const fetchApplianceDraft = thunk(
  'appliances/fetchApplianceDraft',
  async (_, tools) => {
    try {
      return toAppliance(
        (await applianceApi.api.getApplianceDraft({ signal: tools.signal }))
          .data,
      );
    } catch (error) {
      if (tools.signal.aborted) throw error;
      if (axios.isAxiosError(error) && error.response?.status === 404)
        return null;
      if (axios.isAxiosError(error) && error.response?.status === 401)
        tools.dispatch(loggedOut());
      return tools.rejectWithValue(errorMessage(error));
    }
  },
);
export const createAppliance = thunk(
  'appliances/createAppliance',
  async (data: { applianceName: string; image: File; video: File }, tools) => {
    try {
      await applianceApi.api.createAppliance(data, { signal: tools.signal });
      return toAppliance(
        (await applianceApi.api.getApplianceDraft({ signal: tools.signal }))
          .data,
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        tools.dispatch(loggedOut());
      return tools.rejectWithValue(errorMessage(error));
    }
  },
);
export const publishAppliance = thunk(
  'appliances/publishAppliance',
  async (data: PublishApplianceDto, tools) => {
    try {
      return toAppliance(
        (
          await applianceApi.api.publishAppliance(data, {
            signal: tools.signal,
          })
        ).data,
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        tools.dispatch(loggedOut());
      return tools.rejectWithValue(errorMessage(error));
    }
  },
);
export const deleteAppliance = thunk(
  'appliances/deleteAppliance',
  async (id: number, tools) => {
    try {
      await applianceApi.api.deleteAppliance(id, { signal: tools.signal });
      return id;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        tools.dispatch(loggedOut());
      return tools.rejectWithValue(errorMessage(error));
    }
  },
);
export const setApplianceLike = thunk(
  'appliances/setApplianceLike',
  async (data: { id: number; value: 0 | 1 }, tools) => {
    try {
      const response = await applianceApi.api.setApplianceLike(
        data.id,
        { value: data.value },
        { signal: tools.signal },
      );
      return {
        id: data.id,
        likesCount: response.data.likesCount!,
        isLiked: response.data.isLiked!,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        tools.dispatch(loggedOut());
      return tools.rejectWithValue(errorMessage(error));
    }
  },
);
const operations = [
  fetchAppliances,
  fetchApplianceFeed,
  fetchApplianceDraft,
  createAppliance,
  publishAppliance,
  deleteAppliance,
  setApplianceLike,
] as const;
const slice = createSlice({
  name: 'appliances',
  initialState,
  reducers: {
    setMinPower(state, action: PayloadAction<number>) {
      state.minPower = action.payload;
    },
    clearApplianceError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loggedOut, (state) => ({
      ...initialState,
      requests: state.requests,
      listRequest: state.listRequest,
      feedRequest: state.feedRequest,
    }));
    builder.addCase(fetchAppliances.pending, (state, action) => {
      state.listRequest = action.meta.requestId;
    });
    builder.addCase(fetchAppliances.fulfilled, (state, action) => {
      if (state.listRequest !== action.meta.requestId) return;
      state.items = action.payload.items;
      state.catalogSource = action.payload.source;
    });
    builder.addCase(fetchApplianceFeed.pending, (state, action) => {
      state.feedRequest = action.meta.requestId;
      if (!action.meta.arg.next) state.feed = null;
    });
    builder.addCase(fetchApplianceFeed.fulfilled, (state, action) => {
      if (state.feedRequest !== action.meta.requestId) return;
      state.feed = action.payload.item;
      state.feedSource = action.payload.source;
    });
    builder.addCase(fetchApplianceDraft.fulfilled, (state, action) => {
      state.draft = action.payload;
    });
    builder.addCase(createAppliance.fulfilled, (state, action) => {
      state.draft = action.payload;
    });
    builder.addCase(publishAppliance.fulfilled, (state) => {
      state.draft = null;
    });
    builder.addCase(deleteAppliance.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.feed?.id === action.payload) state.feed = null;
    });
    builder.addCase(setApplianceLike.fulfilled, (state, action) => {
      for (const item of [...state.items, ...(state.feed ? [state.feed] : [])])
        if (item.id === action.payload.id) {
          item.likesCount = action.payload.likesCount;
          item.isLiked = action.payload.isLiked;
        }
    });
    builder.addMatcher(isPending(...operations), (state, action) => {
      state.requests[action.meta.requestId] = true;
      state.error = null;
    });
    builder.addMatcher(isFulfilled(...operations), (state, action) => {
      delete state.requests[action.meta.requestId];
    });
    builder.addMatcher(isRejected(...operations), (state, action) => {
      delete state.requests[action.meta.requestId];
      const stale =
        (action.type === fetchAppliances.rejected.type &&
          state.listRequest !== action.meta.requestId) ||
        (action.type === fetchApplianceFeed.rejected.type &&
          state.feedRequest !== action.meta.requestId);
      if (!action.meta.aborted && !stale)
        state.error = action.payload ?? 'Не удалось выполнить запрос';
    });
  },
});
export const { setMinPower, clearApplianceError } = slice.actions;
export default slice.reducer;
