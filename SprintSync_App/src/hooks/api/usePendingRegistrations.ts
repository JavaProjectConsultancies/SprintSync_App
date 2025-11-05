import { useApi, useApiMutation } from './useApi';
import { 
  pendingRegistrationApiService,
  PendingRegistration
} from '../../services/api/entities/pendingRegistrationApi';

// Pending Registration Hooks
export function usePendingRegistrations() {
  return useApi(
    () => pendingRegistrationApiService.getPendingRegistrations(),
    []
  );
}

export function usePendingRegistration(id: string) {
  return useApi(
    () => pendingRegistrationApiService.getPendingRegistrationById(id),
    [id]
  );
}

export function useDeletePendingRegistration() {
  return useApiMutation<void, string>(
    (id) => pendingRegistrationApiService.deletePendingRegistration(id)
  );
}

export function useApprovePendingRegistration() {
  return useApiMutation<any, string>(
    (id) => pendingRegistrationApiService.approvePendingRegistration(id)
  );
}

