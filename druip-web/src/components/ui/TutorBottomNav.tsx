import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/tutor/dashboard', icon: 'dashboard', label: 'Dashboard', key: 'dashboard' },
  { href: '/tutor/classrooms', icon: 'school', label: 'Classrooms', key: 'classrooms' },
  { href: '/tutor/students', icon: 'group', label: 'Students', key: 'students' },
  { href: '/profile', icon: 'person', label: 'Profile', key: 'profile' },
]

export default function TutorBottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-4 pb-6 bg-white/80 backdrop-blur-xl shadow-[0_-20px_40px_rgba(0,0,0,0.08)] rounded-t-xl">
      {NAV_ITEMS.map(({ href, icon, label, key }) => {
        const isActive = active === key
        return (
          <Link
            key={key}
            href={href}
            className={
              isActive
                ? 'flex flex-col items-center justify-center bg-primary text-white rounded-full p-3 mb-1 -translate-y-2 scale-110 transition-all duration-200'
                : 'flex flex-col items-center justify-center text-outline p-2 hover:text-primary transition-colors'
            }
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="font-label text-[11px] font-bold uppercase tracking-wider mt-1">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
