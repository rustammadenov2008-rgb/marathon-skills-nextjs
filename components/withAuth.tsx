import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'unauthenticated') {
        router.replace('/login');
      }
    }, [status, router]);

    if (status === 'loading') {
      return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#1A1E24' }}>
          <div style={{ color:'#E8501A', fontFamily:'Oswald,sans-serif', fontSize:'20px' }}>Загрузка...</div>
        </div>
      );
    }

    if (!session) return null;
    return <Component {...props} />;
  };
}
