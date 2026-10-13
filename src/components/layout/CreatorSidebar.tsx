'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

function LogoIcon({ className = 'h-7 w-8' }: { className?: string }) {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <g clipPath="url(#sidebar_logo_clip)">
        <path d="M13.7856 0.0426033C17.5722 -0.246708 21.6465 0.947345 24.4845 3.32374C24.9524 3.71557 25.9358 4.43814 26.014 5.0175C25.7557 5.38041 21.8688 8.14153 21.3122 8.40632C20.9606 8.45157 19.8723 7.43662 19.5136 7.21919C17.3746 5.92243 14.5769 5.61771 12.1406 6.35059C10.0032 7.00501 8.22861 8.41323 7.19981 10.2714C6.13917 12.25 5.9646 14.5376 6.71419 16.6353C8.41642 21.4169 14.4696 23.456 19.1415 21.0124C19.7041 20.7181 20.6036 19.9005 21.0994 19.7477C21.6074 19.772 22.1566 20.2645 22.5681 20.5684C23.0855 20.9016 25.8108 22.8385 25.9157 23.2797C25.8416 23.4711 25.7186 23.6593 25.5692 23.8075C23.0707 26.2864 19.7071 27.6656 16.1521 27.9502C12.2161 28.2608 8.30785 27.1113 5.28294 24.7533C2.23112 22.3387 0.346804 18.8914 0.0497742 15.1797C-0.274239 11.4608 0.993039 7.77317 3.57727 4.91526C6.23042 2.00361 9.69485 0.357491 13.7856 0.0426033Z" fill="url(#sidebar_logo_paint0)" />
        <path d="M30.7067 7.72159C31.6136 7.64194 32.0035 8.18701 32.0006 8.97071C31.9881 12.3355 31.998 15.7011 31.9952 19.0658C31.995 19.292 31.9561 19.6668 31.8569 19.872C31.7457 20.1008 31.5421 20.2798 31.2898 20.3701C31.134 20.4258 30.8643 20.4547 30.7165 20.4054C29.1718 19.8896 27.4766 19.0823 25.9587 18.4634C24.907 18.0214 23.7755 17.5676 22.7559 17.0766C23.5918 14.7677 23.4525 13.3016 22.7441 11.0521C23.7679 10.4186 26.325 9.52768 27.5327 9.00839C28.3751 8.64599 29.8656 7.98659 30.7067 7.72159Z" fill="url(#sidebar_logo_paint1)" />
        <path d="M14.5816 10.0693L14.7669 10.1252C14.861 10.2001 15.536 11.7619 15.5723 11.938C15.8494 13.2803 18.4464 13.3873 18.7894 14.1018C18.5331 14.5414 17.0646 14.5753 16.2036 15.4063C15.1642 16.4093 15.3361 17.3188 14.7786 18.0702C14.0869 17.6775 14.1773 16.1992 13.3256 15.4111C12.6702 14.8046 10.7902 14.5083 10.668 14.0229C10.9018 13.6543 11.867 13.4756 12.3595 13.2629C14.061 12.5286 14.0223 11.4327 14.5816 10.0693Z" fill="url(#sidebar_logo_paint2)" />
      </g>
      <defs>
        <linearGradient id="sidebar_logo_paint0" x1="0" y1="0" x2="29.8" y2="30.2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#03ACFD" />
          <stop offset="1" stopColor="#1C4AD1" />
        </linearGradient>
        <linearGradient id="sidebar_logo_paint1" x1="0" y1="0" x2="29.8" y2="30.2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#03ACFD" />
          <stop offset="1" stopColor="#1C4AD1" />
        </linearGradient>
        <linearGradient id="sidebar_logo_paint2" x1="0" y1="0" x2="29.8" y2="30.2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#03ACFD" />
          <stop offset="1" stopColor="#1C4AD1" />
        </linearGradient>
        <clipPath id="sidebar_logo_clip">
          <rect width="32" height="28" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function HomeIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M12.5 17.5V10.8333C12.5 10.6123 12.4122 10.4004 12.2559 10.2441C12.0996 10.0878 11.8877 10 11.6667 10H8.33333C8.11232 10 7.90036 10.0878 7.74408 10.2441C7.5878 10.4004 7.5 10.6123 7.5 10.8333V17.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 8.33308C2.49994 8.09064 2.55278 7.8511 2.65482 7.63118C2.75687 7.41126 2.90566 7.21625 3.09083 7.05975L8.92417 2.05975C9.22499 1.80551 9.60613 1.66602 10 1.66602C10.3939 1.66602 10.775 1.80551 11.0758 2.05975L16.9092 7.05975C17.0943 7.21625 17.2431 7.41126 17.3452 7.63118C17.4472 7.8511 17.5001 8.09064 17.5 8.33308V15.8331C17.5 16.2751 17.3244 16.699 17.0118 17.0116C16.6993 17.3242 16.2754 17.4997 15.8333 17.4997H4.16667C3.72464 17.4997 3.30072 17.3242 2.98816 17.0116C2.67559 16.699 2.5 16.2751 2.5 15.8331V8.33308Z" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MessagesIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M18.3327 14.1667C18.3327 14.6087 18.1571 15.0326 17.8445 15.3452C17.532 15.6577 17.108 15.8333 16.666 15.8333H5.68935C5.24736 15.8334 4.8235 16.0091 4.51102 16.3217L2.67602 18.1567C2.59327 18.2394 2.48785 18.2957 2.37309 18.3186C2.25833 18.3414 2.13938 18.3297 2.03127 18.2849C1.92317 18.2401 1.83077 18.1643 1.76575 18.067C1.70074 17.9697 1.66603 17.8553 1.66602 17.7383V4.16667C1.66602 3.72464 1.84161 3.30072 2.15417 2.98816C2.46673 2.67559 2.89065 2.5 3.33268 2.5H16.666C17.108 2.5 17.532 2.67559 17.8445 2.98816C18.1571 3.30072 18.3327 3.72464 18.3327 4.16667V14.1667Z" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.83398 9.16699H14.1673" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.83398 12.5H10.834" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.83398 5.83301H12.5007" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ContractsIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M10 10H10.0083" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.3327 5.00033V3.33366C13.3327 2.89163 13.1571 2.46771 12.8445 2.15515C12.532 1.84259 12.108 1.66699 11.666 1.66699H8.33268C7.89065 1.66699 7.46673 1.84259 7.15417 2.15515C6.84161 2.46771 6.66602 2.89163 6.66602 3.33366V5.00033" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.3327 10.833C15.86 12.4655 12.9623 13.3358 9.99935 13.3358C7.03639 13.3358 4.13869 12.4655 1.66602 10.833" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.666 5H3.33268C2.41221 5 1.66602 5.74619 1.66602 6.66667V15C1.66602 15.9205 2.41221 16.6667 3.33268 16.6667H16.666C17.5865 16.6667 18.3327 15.9205 18.3327 15V6.66667C18.3327 5.74619 17.5865 5 16.666 5Z" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LayananIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M10.692 1.81631C10.4749 1.71727 10.239 1.66602 10.0004 1.66602C9.76172 1.66602 9.52585 1.71727 9.30871 1.81631L2.16704 5.06631C2.01917 5.13152 1.89344 5.23831 1.80518 5.37369C1.71692 5.50908 1.66992 5.6672 1.66992 5.82881C1.66992 5.99043 1.71692 6.14855 1.80518 6.28393C1.89344 6.41931 2.01917 6.52611 2.16704 6.59131L9.31704 9.84965C9.53418 9.94869 9.77005 9.99994 10.0087 9.99994C10.2474 9.99994 10.4832 9.94869 10.7004 9.84965L17.8504 6.59965C17.9983 6.53444 18.124 6.42765 18.2122 6.29227C18.3005 6.15688 18.3475 5.99876 18.3475 5.83715C18.3475 5.67553 18.3005 5.51741 18.2122 5.38203C18.124 5.24665 17.9983 5.13985 17.8504 5.07465L10.692 1.81631Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.66602 10C1.66562 10.1594 1.71095 10.3155 1.79662 10.45C1.88228 10.5844 2.0047 10.6914 2.14935 10.7583L9.31602 14.0167C9.53202 14.1145 9.7664 14.1651 10.0035 14.1651C10.2406 14.1651 10.475 14.1145 10.691 14.0167L17.841 10.7667C17.9885 10.7004 18.1136 10.5926 18.2009 10.4564C18.2882 10.3203 18.3327 10.1617 18.3327 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.66602 14.167C1.66562 14.3264 1.71095 14.4825 1.79662 14.6169C1.88228 14.7514 2.0047 14.8584 2.14935 14.9253L9.31602 18.1837C9.53202 18.2815 9.7664 18.3321 10.0035 18.3321C10.2406 18.3321 10.475 18.2815 10.691 18.1837L17.841 14.9337C17.9885 14.8674 18.1136 14.7596 18.2009 14.6234C18.2882 14.4873 18.3327 14.3287 18.3327 14.167" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProyekIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M3.33268 16.6667H16.666C17.108 16.6667 17.532 16.4911 17.8445 16.1785C18.1571 15.866 18.3327 15.442 18.3327 15V6.66667C18.3327 6.22464 18.1571 5.80072 17.8445 5.48816C17.532 5.17559 17.108 5 16.666 5H10.0577C9.78317 4.99858 9.51326 4.92937 9.27193 4.79853C9.0306 4.66769 8.82533 4.47927 8.67435 4.25L7.99102 3.25C7.84004 3.02073 7.63476 2.83231 7.39343 2.70147C7.15211 2.57063 6.88219 2.50142 6.60768 2.5H3.33268C2.89065 2.5 2.46673 2.67559 2.15417 2.98816C1.84161 3.30072 1.66602 3.72464 1.66602 4.16667V15C1.66602 15.9167 2.41602 16.6667 3.33268 16.6667Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66602 8.33301V11.6663" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 8.33301V9.99967" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.334 8.33301V13.333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FinancesIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M15.8333 5.83333V3.33333C15.8333 3.11232 15.7455 2.90036 15.5893 2.74408C15.433 2.5878 15.221 2.5 15 2.5H4.16667C3.72464 2.5 3.30072 2.67559 2.98816 2.98816C2.67559 3.30072 2.5 3.72464 2.5 4.16667C2.5 4.60869 2.67559 5.03262 2.98816 5.34518C3.30072 5.65774 3.72464 5.83333 4.16667 5.83333H16.6667C16.8877 5.83333 17.0996 5.92113 17.2559 6.07741C17.4122 6.23369 17.5 6.44565 17.5 6.66667V10M17.5 10H15C14.558 10 14.134 10.1756 13.8215 10.4882C13.5089 10.8007 13.3333 11.2246 13.3333 11.6667C13.3333 12.1087 13.5089 12.5326 13.8215 12.8452C14.134 13.1577 14.558 13.3333 15 13.3333H17.5C17.721 13.3333 17.933 13.2455 18.0893 13.0893C18.2455 12.933 18.3333 12.721 18.3333 12.5V10.8333C18.3333 10.6123 18.2455 10.4004 18.0893 10.2441C17.933 10.0878 17.721 10 17.5 10Z" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 4.16699V15.8337C2.5 16.2757 2.67559 16.6996 2.98816 17.0122C3.30072 17.3247 3.72464 17.5003 4.16667 17.5003H16.6667C16.8877 17.5003 17.0996 17.4125 17.2559 17.2562C17.4122 17.1 17.5 16.888 17.5 16.667V13.3337" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NotifikasiIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M8.55664 17.5C8.70293 17.7533 8.91332 17.9637 9.16668 18.11C9.42003 18.2563 9.70743 18.3333 9.99997 18.3333C10.2925 18.3333 10.5799 18.2563 10.8333 18.11C11.0866 17.9637 11.297 17.7533 11.4433 17.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.71772 12.772C2.60886 12.8913 2.53702 13.0397 2.51094 13.1991C2.48486 13.3585 2.50566 13.522 2.57081 13.6698C2.63597 13.8176 2.74267 13.9433 2.87794 14.0316C3.0132 14.1198 3.17121 14.1669 3.33272 14.167H16.6661C16.8276 14.167 16.9856 14.1202 17.1209 14.0321C17.2563 13.944 17.3631 13.8184 17.4285 13.6708C17.4938 13.5231 17.5148 13.3596 17.4889 13.2001C17.4631 13.0407 17.3914 12.8923 17.2827 12.7728C16.1744 11.6303 14.9994 10.4162 14.9994 6.66699C14.9994 5.34091 14.4726 4.06914 13.5349 3.13146C12.5972 2.19378 11.3255 1.66699 9.99939 1.66699C8.67331 1.66699 7.40154 2.19378 6.46386 3.13146C5.52618 4.06914 4.99939 5.34091 4.99939 6.66699C4.99939 10.4162 3.82356 11.6303 2.71772 12.772Z" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PengaturanIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M8.33333 4.16699H2.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 15.833H2.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.666 2.5V5.83333" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.334 14.167V17.5003" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 10H10" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5007 15.833H13.334" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.4993 4.16699H11.666" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66602 8.33301V11.6663" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66667 10H2.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M13.334 14.1663L17.5007 9.99967L13.334 5.83301" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 10H7.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface CreatorNavLink {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.JSX.Element;
}

const primaryLinks: CreatorNavLink[] = [
  { label: 'Home', href: '/', icon: HomeIcon },
  { label: 'Messages', href: '/chat', icon: MessagesIcon },
  { label: 'Contracts', href: '/contracts', icon: ContractsIcon },
  { label: 'Layanan', href: '/dashboard/layanan', icon: LayananIcon },
  { label: 'Proyek', href: '/proyek', icon: ProyekIcon },
  { label: 'Finances', href: '/wallet', icon: FinancesIcon },
];

export function CreatorSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    if (href === '/dashboard/layanan' || href === '/profile?tab=services') {
      return (
        pathname === '/dashboard/layanan' ||
        pathname === '/layanan' ||
        pathname?.startsWith('/dashboard/layanan') ||
        pathname?.startsWith('/layanan') ||
        pathname?.startsWith('/jelajah/layanan')
      );
    }
    if (href === '/proyek') {
      return pathname?.startsWith('/proyek') || pathname?.startsWith('/jelajah/proyek') || pathname?.startsWith('/briefs');
    }
    if (href === '/wallet') {
      return pathname?.startsWith('/wallet') || pathname?.startsWith('/invoice');
    }
    return pathname?.startsWith(href);
  };

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }

    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const notifRes = await fetch('/api/notifications', { cache: 'no-store' });
        if (notifRes.ok) {
          const data = await notifRes.json();
          if (isMounted && Array.isArray(data.notifications)) {
            const count = data.notifications.filter((n: any) => !n.isRead).length;
            setUnreadNotifications(count);
          }
        }
      } catch {
        // Silently ignore network errors in polling
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    window.addEventListener('creatorin_notifications_updated', fetchUnread);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('creatorin_notifications_updated', fetchUnread);
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <aside
      aria-label="Sidebar kreator"
      className="border-b border-[#E1E3EA] bg-white lg:sticky lg:top-0 lg:h-screen lg:w-[99px] lg:shrink-0 lg:border-b-0 lg:border-r lg:overflow-y-auto z-40 select-none scrollbar-none"
    >
      <div className="flex min-h-16 items-center gap-2 px-3 lg:h-full lg:flex-col lg:items-center lg:gap-2 lg:px-4 lg:py-3">
        {/* 1. Link - Beranda Creatorin (48x48 rounded-2xl) */}
        <Link
          href="/"
          aria-label="Beranda Creatorin"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors duration-150 hover:bg-[#F3F5F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
        >
          <LogoIcon className="h-7 w-8 shrink-0" />
        </Link>

        {/* 2. Link - Buka profil Creator (Margin: pt-7 pb-6, 44x44 container, 36x36 avatar) */}
        <div className="shrink-0 lg:pt-7 lg:pb-6">
          <Link
            href="/profile"
            aria-label={`Buka profil ${user?.name || 'kreator'}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-150 hover:bg-[#F3F5F8] hover:ring-2 hover:ring-[#E1E3EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
          >
            <img
              src={user?.avatar || '/creatorin/avatar.png'}
              alt={user?.name || 'Avatar'}
              className="h-9 w-9 rounded-full border border-[#E1E3EA] object-cover"
            />
          </Link>
        </div>

        {/* 3. Navigation - Navigasi kreator (gap: 4px, width: 67px, flex-1) */}
        <nav
          aria-label="Navigasi kreator"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:w-[67px] lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible"
        >
          {primaryLinks.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`flex h-[52px] min-w-[58px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-normal leading-4 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] lg:h-[58px] lg:w-[67px] ${
                  active
                    ? 'bg-[#DFE6EF] text-[#0D0C22] font-semibold'
                    : 'text-[#222222] hover:bg-[#F3F5F8] hover:text-[#0D0B0B]'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="max-w-[65px] truncate text-center text-xs leading-4">{label}</span>
              </Link>
            );
          })}

          {/* 4. Bottom Utility Items (Container:align mt-auto, gap-2) */}
          <div className="ml-auto flex items-center gap-1 lg:ml-0 lg:mt-auto lg:w-[67px] lg:flex-col lg:items-center lg:gap-2 lg:pt-4">
            {/* Notifikasi (44x44 rounded-xl) */}
            <Link
              href="/notifications"
              title="Notifikasi"
              aria-label="Notifikasi"
              aria-current={isActive('/notifications') ? 'page' : undefined}
              className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] ${
                isActive('/notifications')
                  ? 'bg-[#DFE6EF] text-[#0D0C22]'
                  : 'text-[#222222] hover:bg-[#F3F5F8] hover:text-[#0D0B0B]'
              }`}
            >
              <NotifikasiIcon className="h-5 w-5 shrink-0" />
              {unreadNotifications > 0 && (
                <>
                  <span
                    className="absolute top-3 right-3.5 h-[5px] w-[5px] rounded-full bg-[#EB4D4B]"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{unreadNotifications} notifikasi baru</span>
                </>
              )}
            </Link>

            {/* Pengaturan (44x44 rounded-xl) */}
            <Link
              href="/settings"
              title="Pengaturan"
              aria-label="Pengaturan"
              aria-current={isActive('/settings') ? 'page' : undefined}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] ${
                isActive('/settings')
                  ? 'bg-[#DFE6EF] text-[#0D0C22]'
                  : 'text-[#222222] hover:bg-[#F3F5F8] hover:text-[#0D0B0B]'
              }`}
            >
              <PengaturanIcon className="h-5 w-5 shrink-0" />
            </Link>

            {/* Logout (44x44 rounded-xl) */}
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[#222222] transition-colors duration-150 hover:bg-[#FEE4E2]/70 hover:text-[#D92D20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC] cursor-pointer"
            >
              <LogoutIcon className="h-5 w-5 shrink-0" />
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
