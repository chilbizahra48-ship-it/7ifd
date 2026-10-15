import React from 'react';

interface DomainIllustrationProps {
  domainId: string;
  className?: string;
}

export const DomainIllustration: React.FC<DomainIllustrationProps> = ({ domainId, className = 'w-full h-full' }) => {
  switch (domainId) {
    case 'everyday-essentials':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="ee-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="ee-clock" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" rx="20" fill="url(#ee-bg)" />
          {/* Subtle background circles */}
          <circle cx="280" cy="30" r="60" fill="white" fillOpacity="0.08" />
          <circle cx="40" cy="150" r="45" fill="white" fillOpacity="0.08" />

          {/* Desk Clock */}
          <g transform="translate(65, 45)">
            <circle cx="45" cy="45" r="38" fill="url(#ee-clock)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" />
            <circle cx="45" cy="45" r="34" stroke="#D97706" strokeWidth="2.5" fill="none" />
            <circle cx="45" cy="45" r="3" fill="#B45309" />
            <line x1="45" y1="45" x2="45" y2="24" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
            <line x1="45" y1="45" x2="62" y2="45" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="45" cy="18" r="1.5" fill="#D97706" />
            <circle cx="72" cy="45" r="1.5" fill="#D97706" />
            <circle cx="45" cy="72" r="1.5" fill="#D97706" />
            <circle cx="18" cy="45" r="1.5" fill="#D97706" />
          </g>

          {/* Calendar Page */}
          <g transform="translate(160, 40)">
            <rect x="0" y="0" width="70" height="80" rx="10" fill="white" filter="drop-shadow(0 6px 10px rgba(0,0,0,0.18))" />
            <path d="M0 10C0 4.477 4.477 0 10 0H60C65.523 0 70 4.477 70 10V22H0V10Z" fill="#EF4444" />
            <circle cx="18" cy="11" r="2.5" fill="white" />
            <circle cx="52" cy="11" r="2.5" fill="white" />
            <text x="35" y="56" fill="#1F2937" fontSize="26" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">7</text>
            <text x="35" y="70" fill="#6B7280" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">DAYS</text>
          </g>

          {/* Coffee Mug */}
          <g transform="translate(245, 75)">
            <rect x="0" y="10" width="38" height="42" rx="6" fill="#FFFFFF" fillOpacity="0.95" />
            <path d="M38 20C45 20 48 24 48 31C48 38 45 42 38 42" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <path d="M12 2C12 6 8 8 8 10" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M22 1C22 5 18 7 18 9" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </g>

          {/* Key & Tag */}
          <g transform="translate(20, 115)">
            <circle cx="20" cy="20" r="10" stroke="white" strokeWidth="3.5" fill="none" />
            <line x1="28" y1="26" x2="48" y2="40" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="42" y1="36" x2="45" y2="32" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="46" y1="39" x2="49" y2="35" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'greetings-social':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="gs-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" rx="20" fill="url(#gs-bg)" />
          <circle cx="35" cy="40" r="50" fill="white" fillOpacity="0.06" />
          <circle cx="280" cy="140" r="60" fill="white" fillOpacity="0.06" />

          {/* Left Speech Bubble - Arabic "مرحباً" */}
          <g transform="translate(45, 35)">
            <path d="M0 16C0 7.163 7.163 0 16 0H100C108.837 0 116 7.163 116 16V52C116 60.837 108.837 68 100 68H30L12 82V68H16C7.163 68 0 60.837 0 52V16Z" fill="white" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.15))" />
            <text x="58" y="42" fill="#4338CA" fontSize="22" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">مرحباً</text>
          </g>

          {/* Right Speech Bubble - "Hello!" */}
          <g transform="translate(160, 65)">
            <path d="M16 0H104C112.837 0 120 7.163 120 16V52C120 60.837 112.837 68 104 68H96V82L78 68H16C7.163 68 0 60.837 0 52V16C0 7.163 7.163 0 16 0Z" fill="#38BDF8" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.2))" />
            <text x="60" y="42" fill="#FFFFFF" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Hello!</text>
          </g>

          {/* Friendly Handshake / Connected Avatars */}
          <g transform="translate(130, 135)">
            <circle cx="15" cy="10" r="14" fill="#FDE047" />
            <circle cx="45" cy="10" r="14" fill="#A7F3D0" />
            <path d="M22 10C26 7 34 7 38 10" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'travel-transportation':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="tt-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" rx="20" fill="url(#tt-bg)" />
          {/* Cloud drifts */}
          <ellipse cx="60" cy="140" rx="45" ry="20" fill="white" fillOpacity="0.15" />
          <ellipse cx="270" cy="50" rx="50" ry="22" fill="white" fillOpacity="0.15" />

          {/* Stylized Airplane */}
          <g transform="translate(130, 45) rotate(-15)">
            <path d="M10 35L70 20L110 5L95 28L115 45L85 40L45 55L35 75L25 70L32 50L10 35Z" fill="white" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.2))" />
            <circle cx="75" cy="22" r="3" fill="#0284C7" />
            <circle cx="85" cy="20" r="3" fill="#0284C7" />
            <circle cx="95" cy="18" r="3" fill="#0284C7" />
          </g>

          {/* Travel Suitcase */}
          <g transform="translate(45, 80)">
            <rect x="0" y="16" width="60" height="50" rx="8" fill="#F59E0B" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.15))" />
            <rect x="20" y="4" width="20" height="14" rx="4" stroke="#F59E0B" strokeWidth="4" fill="none" />
            <line x1="0" y1="41" x2="60" y2="41" stroke="#D97706" strokeWidth="3" />
            <circle cx="12" cy="66" r="4" fill="#374151" />
            <circle cx="48" cy="66" r="4" fill="#374151" />
            {/* Passport sticker */}
            <circle cx="30" cy="30" r="7" fill="white" fillOpacity="0.8" />
          </g>

          {/* Compass Rose */}
          <g transform="translate(235, 100)">
            <circle cx="25" cy="25" r="24" fill="white" fillOpacity="0.9" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
            <polygon points="25,6 30,22 25,25 20,22" fill="#EF4444" />
            <polygon points="25,44 30,28 25,25 20,28" fill="#3B82F6" />
          </g>
        </svg>
      );

    case 'food-shopping':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="fs-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" rx="20" fill="url(#fs-bg)" />
          <circle cx="280" cy="40" r="50" fill="white" fillOpacity="0.08" />

          {/* Shopping Cart */}
          <g transform="translate(45, 65)">
            <path d="M0 6H12L24 45H58L68 18H16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="26" cy="54" r="5" fill="white" />
            <circle cx="52" cy="54" r="5" fill="white" />
          </g>

          {/* Red Apple in cart */}
          <g transform="translate(72, 60)">
            <circle cx="14" cy="14" r="12" fill="#EF4444" />
            <path d="M14 2C15 6 18 5 18 2" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Bakery Croissant */}
          <g transform="translate(155, 60)">
            <path d="M10 40C15 20 45 20 60 40C52 35 35 30 20 40Z" fill="#FBBF24" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" />
            <path d="M22 28C28 22 42 22 48 28" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Restaurant Cloche / Covered Dish */}
          <g transform="translate(225, 70)">
            <path d="M10 42H60" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <path d="M15 42C15 22 55 22 55 42Z" fill="white" fillOpacity="0.95" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" />
            <circle cx="35" cy="20" r="4" fill="white" />
          </g>
        </svg>
      );

    case 'home-city':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="hc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" rx="20" fill="url(#hc-bg)" />

          {/* City Skyline Silhouette */}
          <g fill="white" fillOpacity="0.15" transform="translate(20, 45)">
            <rect x="180" y="20" width="30" height="90" rx="4" />
            <rect x="220" y="40" width="25" height="70" rx="4" />
            <rect x="255" y="10" width="35" height="100" rx="4" />
          </g>

          {/* Cozy Home */}
          <g transform="translate(50, 45)">
            {/* Chimney */}
            <rect x="70" y="22" width="12" height="24" fill="#EC4899" />
            {/* Roof */}
            <polygon points="50,15 95,50 5,50" fill="#F43F5E" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))" />
            {/* House body */}
            <rect x="15" y="50" width="70" height="60" rx="6" fill="white" />
            {/* Door */}
            <rect x="42" y="75" width="16" height="35" rx="3" fill="#6D28D9" />
            {/* Windows */}
            <rect x="23" y="60" width="14" height="14" rx="2" fill="#FDE047" />
            <rect x="63" y="60" width="14" height="14" rx="2" fill="#FDE047" />
          </g>

          {/* Street Lamp & Garden Tree */}
          <g transform="translate(160, 80)">
            <circle cx="20" cy="20" r="18" fill="#10B981" />
            <rect x="18" y="38" width="4" height="28" fill="#78350F" rx="2" />
          </g>

          {/* Modern Street Car */}
          <g transform="translate(210, 115)">
            <path d="M10 20L20 8H45L55 20H65V30H0V20H10Z" fill="white" rx="4" />
            <circle cx="15" cy="30" r="6" fill="#1E293B" />
            <circle cx="50" cy="30" r="6" fill="#1E293B" />
          </g>
        </svg>
      );

    case 'work-business':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="wb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" rx="20" fill="url(#wb-bg)" />
          <circle cx="30" cy="30" r="40" fill="white" fillOpacity="0.06" />

          {/* Modern Laptop with Analytics Chart */}
          <g transform="translate(50, 45)">
            <rect x="10" y="10" width="90" height="60" rx="6" fill="#0F172A" />
            <rect x="15" y="15" width="80" height="50" rx="4" fill="#1E293B" />
            {/* Chart lines & bars */}
            <rect x="25" y="45" width="8" height="14" rx="2" fill="#38BDF8" />
            <rect x="38" y="35" width="8" height="24" rx="2" fill="#60A5FA" />
            <rect x="51" y="28" width="8" height="31" rx="2" fill="#34D399" />
            <rect x="64" y="22" width="8" height="37" rx="2" fill="#FBBF24" />
            <rect x="77" y="18" width="8" height="41" rx="2" fill="#F43F5E" />
            {/* Laptop Base */}
            <path d="M0 70H110L102 78H8L0 70Z" fill="#94A3B8" />
          </g>

          {/* Business Briefcase */}
          <g transform="translate(185, 55)">
            <rect x="0" y="15" width="75" height="52" rx="8" fill="#F59E0B" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.18))" />
            <rect x="25" y="5" width="25" height="12" rx="3" stroke="#F59E0B" strokeWidth="4" fill="none" />
            <line x1="0" y1="36" x2="75" y2="36" stroke="#D97706" strokeWidth="3" />
            <rect x="33" y="32" width="9" height="9" rx="2" fill="#FFFFFF" />
          </g>

          {/* Target Milestone / Growth Arrow */}
          <g transform="translate(255, 115)">
            <circle cx="20" cy="20" r="18" fill="white" fillOpacity="0.9" />
            <path d="M12 28L20 12L28 28H12Z" fill="#10B981" />
          </g>
        </svg>
      );

    case 'health-emergencies':
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="he-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" rx="20" fill="url(#he-bg)" />
          <circle cx="40" cy="40" r="50" fill="white" fillOpacity="0.08" />

          {/* First Aid Emergency Kit */}
          <g transform="translate(50, 45)">
            <rect x="0" y="16" width="85" height="65" rx="12" fill="white" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.2))" />
            <rect x="27" y="4" width="31" height="14" rx="4" stroke="white" strokeWidth="4" fill="none" />
            {/* Red Cross */}
            <rect x="37" y="34" width="11" height="29" rx="3" fill="#E11D48" />
            <rect x="28" y="43" width="29" height="11" rx="3" fill="#E11D48" />
          </g>

          {/* Stethoscope */}
          <g transform="translate(165, 40)">
            <path d="M20 15V45C20 60 55 60 55 45V15" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <circle cx="20" cy="12" r="4" fill="white" />
            <circle cx="55" cy="12" r="4" fill="white" />
            <path d="M37 55V75C37 85 60 85 60 75" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <circle cx="62" cy="75" r="9" fill="#FDE047" stroke="white" strokeWidth="3" />
          </g>

          {/* Medicine Capsule */}
          <g transform="translate(245, 100) rotate(35)">
            <rect x="0" y="0" width="45" height="20" rx="10" fill="#38BDF8" />
            <rect x="22" y="0" width="23" height="20" rx="10" fill="#FFFFFF" />
          </g>
        </svg>
      );

    case 'culture-entertainment':
    default:
      return (
        <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="ce-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#A21CAF" />
            </linearGradient>
          </defs>
          <rect width="320" height="180" rx="20" fill="url(#ce-bg)" />
          <circle cx="280" cy="150" r="50" fill="white" fillOpacity="0.08" />

          {/* Theater Masks */}
          <g transform="translate(50, 45)">
            {/* Happy Mask */}
            <path d="M0 25C0 10 15 0 30 0C45 0 60 10 60 25C60 45 45 55 30 55C15 55 0 45 0 25Z" fill="white" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.18))" />
            <circle cx="20" cy="22" r="3.5" fill="#A21CAF" />
            <circle cx="40" cy="22" r="3.5" fill="#A21CAF" />
            <path d="M20 36C24 43 36 43 40 36" stroke="#A21CAF" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          {/* Cinema Film Clapperboard */}
          <g transform="translate(135, 45)">
            <rect x="0" y="16" width="70" height="50" rx="6" fill="#1E293B" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.2))" />
            <rect x="0" y="0" width="70" height="16" rx="4" fill="#334155" />
            <polygon points="10,0 20,0 10,16 0,16" fill="white" />
            <polygon points="30,0 40,0 30,16 20,16" fill="white" />
            <polygon points="50,0 60,0 50,16 40,16" fill="white" />
            <text x="35" y="47" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">7ifd CINEMA</text>
          </g>

          {/* Artist's Palette & Musical Notes */}
          <g transform="translate(230, 50)">
            <ellipse cx="30" cy="30" rx="28" ry="24" fill="#FBBF24" />
            <circle cx="18" cy="22" r="3.5" fill="#EF4444" />
            <circle cx="30" cy="18" r="3.5" fill="#3B82F6" />
            <circle cx="42" cy="25" r="3.5" fill="#10B981" />
            <circle cx="36" cy="38" r="4.5" fill="#A21CAF" />
            {/* Musical Note */}
            <path d="M15 80V60H32V80M15 67H32" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="15" cy="80" r="5" fill="white" />
            <circle cx="32" cy="80" r="5" fill="white" />
          </g>
        </svg>
      );
  }
};
