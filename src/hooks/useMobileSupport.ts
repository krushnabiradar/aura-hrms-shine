
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type MobileDevice = Database['public']['Tables']['mobile_devices']['Row'];
type MobileDeviceInsert = Database['public']['Tables']['mobile_devices']['Insert'];

type PushNotification = Database['public']['Tables']['push_notifications']['Row'];
type PushNotificationInsert = Database['public']['Tables']['push_notifications']['Insert'];

export const useMobileSupport = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Mobile Devices
  const {
    data: mobileDevices,
    isLoading: isLoadingDevices,
    error: devicesError
  } = useQuery({
    queryKey: ['mobile-devices'],
    queryFn: async () => {
      console.log('Fetching mobile devices...');
      const { data, error } = await supabase
        .from('mobile_devices')
        .select('*')
        .eq('user_id', user!.id)
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('Error fetching mobile devices:', error);
        throw error;
      }

      console.log('Mobile devices fetched successfully:', data);
      return data as MobileDevice[];
    },
    enabled: !!user
  });

  // Push Notifications
  const {
    data: pushNotifications,
    isLoading: isLoadingNotifications,
    error: notificationsError
  } = useQuery({
    queryKey: ['push-notifications'],
    queryFn: async () => {
      console.log('Fetching push notifications...');
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching push notifications:', error);
        throw error;
      }

      console.log('Push notifications fetched successfully:', data);
      return data as PushNotification[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Register device mutation
  const registerDeviceMutation = useMutation({
    mutationFn: async (deviceData: Omit<MobileDeviceInsert, 'user_id'>) => {
      console.log('Registering mobile device:', deviceData);
      
      const { data, error } = await supabase
        .from('mobile_devices')
        .upsert({
          ...deviceData,
          user_id: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering mobile device:', error);
        throw error;
      }

      console.log('Mobile device registered successfully:', data);
      return data as MobileDevice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-devices'] });
    }
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: Omit<PushNotificationInsert, 'tenant_id'>) => {
      console.log('Sending push notification:', notificationData);
      
      const { data, error } = await supabase
        .from('push_notifications')
        .insert({
          ...notificationData,
          tenant_id: user!.tenant_id!
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending push notification:', error);
        throw error;
      }

      console.log('Push notification sent successfully:', data);
      return data as PushNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-notifications'] });
    }
  });

  return {
    // Mobile Devices
    mobileDevices,
    isLoadingDevices,
    devicesError,
    registerDevice: registerDeviceMutation.mutate,
    isRegisteringDevice: registerDeviceMutation.isPending,

    // Push Notifications
    pushNotifications,
    isLoadingNotifications,
    notificationsError,
    sendNotification: sendNotificationMutation.mutate,
    isSendingNotification: sendNotificationMutation.isPending
  };
};
