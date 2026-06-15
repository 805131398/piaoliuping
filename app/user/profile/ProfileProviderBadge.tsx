import { Badge } from "@/components/ui/badge";

import UseAnimations from 'react-useanimations';
import GitHub from 'react-useanimations/lib/github';

 

export function ProfileProviderBadge({ provider }: { provider: string | null }) {
  // 加载中时不显示，避免闪烁
  if (!provider) return null;

  return (
    <Badge>
      {provider === "github" && (
        <>
          <div 
            style={{ 
              display: 'inline-block',
              width: '16px',
              height: '16px',
              marginRight: '4px'
            }}
          >
            <UseAnimations
              animation={GitHub}
              size={16}
              strokeColor="currentColor"
              fillColor="currentColor"
              loop={true}
              autoplay={true}
              style={{ 
                width: '100%',
                height: '100%'
              }}
            />
          </div>
          GitHub
        </>
      )}
      {provider === "google" && (
        <>
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </>
      )}
      {provider === "email" && (
        <>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          email
        </>
      )}
      {provider === "phone_code" && (
        <>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          phone
        </>
      )}
    </Badge>
  );
} 