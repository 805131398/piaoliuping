import useSWR from 'swr';
import { MenuItem } from '@/types/admin';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('获取菜单失败');
  const data = await res.json();
  return data.menus;
};

export function useMenus() {
  const { data, error, mutate, isLoading } = useSWR<MenuItem[]>(
    '/api/admin/menus',
    fetcher,
    {
      // 缓存配置
      revalidateOnFocus: false,      // 窗口聚焦时不重新验证
      revalidateOnReconnect: false,  // 重新连接时不重新验证
      dedupingInterval: 60000,       // 60秒内去重请求
      // 如果需要更长时间的缓存，可以增加这个值
    }
  );

  return {
    menus: data,
    loading: isLoading,
    error,
    mutate, // 用于手动刷新数据
  };
}
