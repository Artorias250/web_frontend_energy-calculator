import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export function useBusy() {
  return useAppSelector(state => state.auth.loading || Object.keys(state.appliances.requests).length > 0);
}
