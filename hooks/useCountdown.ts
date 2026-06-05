import { useEffect, useState } from 'react';
import { getCountdown } from '@/lib/timer';

export function useCountdown(): string {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(getCountdown());
    const id = setInterval(() => setValue(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  return value;
}
