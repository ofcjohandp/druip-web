import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomeDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const firstName = user.user_metadata?.full_name?.split(" ")[0] ?? "Scholar";

  const [profileResult, subscriptionsResult, tutorsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("streak_count")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select(`
        id,
        subscribed_at,
        classrooms (
          id,
          name,
          bio,
          tutor_id
        )
      `)
      .eq("student_id", user.id)
      .eq("status", "active")
      .order("subscribed_at", { ascending: false }),
    supabase
      .from("tutors")
      .select(`
        id,
        created_at,
        profiles (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const streakCount = profileResult.data?.streak_count ?? 0;

  // Supabase infers FK joins as arrays — normalize to single object or null
  type RawClassroom = { id: string; name: string; bio: string | null; tutor_id: string };
  type RawProfile = { full_name: string | null; email: string };

  const rawSubscriptions = (subscriptionsResult.data ?? []) as unknown as Array<{
    id: string;
    subscribed_at: string;
    classrooms: RawClassroom[] | RawClassroom | null;
  }>;
  const rawTutors = (tutorsResult.data ?? []) as unknown as Array<{
    id: string;
    created_at: string;
    profiles: RawProfile[] | RawProfile | null;
  }>;

  const subscriptions = rawSubscriptions.map((s) => ({
    ...s,
    classrooms: Array.isArray(s.classrooms) ? (s.classrooms[0] ?? null) : s.classrooms,
  }));
  const spotlightClassroom = subscriptions[0]?.classrooms ?? null;
  const tutors = rawTutors.map((t) => ({
    ...t,
    profiles: Array.isArray(t.profiles) ? (t.profiles[0] ?? null) : t.profiles,
  }));

  const streakSubtext = streakCount === 0
    ? "Start your streak today!"
    : `You're on a ${streakCount}-day streak. Keep going!`;

  return (
    <div className="bg-surface font-body text-on-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 frosted-glass flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
            {firstName[0]}
          </div>
          <span className="text-2xl font-black italic text-primary font-headline">Druip</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95">
          <span className="material-symbols-outlined text-primary">notifications</span>
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Hero Greeting */}
        <section className="mb-12">
          <h1 className="font-headline text-[3.5rem] font-extrabold leading-none tracking-tight mb-2 text-on-surface">
            Hey {firstName}, <br />
            <span className="text-primary italic">you&apos;ve got this!</span>
          </h1>
          <p className="text-on-surface-variant text-lg">{streakSubtext}</p>
        </section>

        {/* Bento stats grid — conditional on whether user has subscriptions */}
        {spotlightClassroom ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Spotlight card — Continue Learning */}
            <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <span className="bg-tertiary-container text-on-tertiary-container px-4 py-1 rounded-full text-[11px] font-bold tracking-wider mb-6 inline-block uppercase">
                  CONTINUE LEARNING
                </span>
                <h2 className="font-headline text-3xl font-bold mb-2">{spotlightClassroom.name}</h2>
                <p className="text-on-surface-variant mb-6">Your subscribed classroom</p>
                <button className="kinetic-gradient text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-all active:scale-95">
                  Go to Classroom
                </button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
            </div>

            {/* Streak card */}
            <div className="bg-secondary-container rounded-xl p-8 flex flex-col justify-center items-center text-center">
              <span
                className="material-symbols-outlined text-on-secondary-container text-5xl mb-4"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: "3rem" }}
              >
                local_fire_department
              </span>
              <div className="font-headline text-4xl font-black text-on-secondary-container">{streakCount}</div>
              <div className="text-on-secondary-container font-bold tracking-widest text-xs uppercase mt-1">Day Streak</div>
            </div>
          </div>
        ) : (
          <div className="mb-12 flex justify-center">
            {/* Streak card only — no spotlight when no subscriptions */}
            <div className="bg-secondary-container rounded-xl p-8 flex flex-col justify-center items-center text-center w-full max-w-xs">
              <span
                className="material-symbols-outlined text-on-secondary-container text-5xl mb-4"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: "3rem" }}
              >
                local_fire_department
              </span>
              <div className="font-headline text-4xl font-black text-on-secondary-container">{streakCount}</div>
              <div className="text-on-secondary-container font-bold tracking-widest text-xs uppercase mt-1">Day Streak</div>
            </div>
          </div>
        )}

        {/* Continue Learning */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline text-2xl font-bold">Continue Learning</h3>
            <button className="text-outline font-bold cursor-default">View All</button>
          </div>

          {subscriptions.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="min-w-[280px] bg-surface-container-low rounded-lg p-2 transition-transform hover:scale-[1.02]"
                >
                  <div className="h-40 rounded-md overflow-hidden mb-4 bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-4xl">menu_book</span>
                  </div>
                  <div className="px-3 pb-4">
                    <h4 className="font-bold text-lg leading-tight mb-1">
                      {subscription.classrooms?.name ?? "Untitled Classroom"}
                    </h4>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: "0%" }}
                        />
                      </div>
                    </div>
                    <button className="w-full py-2 bg-white rounded-full text-primary font-bold text-sm shadow-sm hover:shadow-md transition-shadow">
                      Resume Lecture
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-secondary text-5xl mb-2 block">search</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Searching for your next mentor...</p>
              <h4 className="font-headline text-2xl font-bold mb-2">No classrooms joined yet.</h4>
              <p className="text-on-surface-variant mb-6">Find a tutor to start your academic glow-up! Your future self will thank you for this momentum.</p>
              <a href="#" className="inline-block kinetic-gradient text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-all active:scale-95">
                Browse Tutors
              </a>
            </div>
          )}
        </section>

        {/* Tutors of the Week */}
        <section className="mb-20">
          <div className="bg-surface-container-low rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="font-headline text-2xl font-bold mb-1">Tutors of the Week</h3>
                <p className="text-on-surface-variant">Handpicked experts to help you excel this week.</p>
              </div>
              <button className="bg-surface-container-high text-outline px-6 py-3 rounded-full font-bold cursor-default">
                Book a Session
              </button>
            </div>

            {tutors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tutors.map((tutor) => {
                  const displayName = tutor.profiles?.full_name ?? tutor.profiles?.email ?? "Unnamed Tutor";
                  return (
                    <div key={tutor.id} className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
                        {displayName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{displayName}</div>
                        <div className="text-xs text-on-surface-variant mb-1">Tutor</div>
                        <span className="bg-tertiary-container/20 text-on-tertiary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          NEW
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-primary text-5xl mb-2 block" style={{ fontSize: "48px" }}>school</span>
                <h4 className="font-headline text-2xl font-bold mb-2">No tutors yet.</h4>
                <p className="text-on-surface-variant mb-6">Tutors will appear here as they join. Check back soon.</p>
                <a href="#" className="inline-block kinetic-gradient text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-all active:scale-95">
                  Browse Classrooms
                </a>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-4 pb-6 bg-white/80 backdrop-blur-xl shadow-[0_-20px_40px_rgba(0,0,0,0.08)] rounded-t-xl">
        <Link href="/home" className="flex flex-col items-center justify-center bg-primary text-white rounded-full p-3 mb-1 transform -translate-y-2 transition-all scale-110">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-[11px] font-bold uppercase tracking-wider mt-1">Home</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-outline p-2 hover:text-primary transition-colors" aria-label="Study">
          <span className="material-symbols-outlined">auto_stories</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-outline p-2 hover:text-primary transition-colors" aria-label="Classroom">
          <span className="material-symbols-outlined">school</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-outline p-2 hover:text-primary transition-colors" aria-label="Profile">
          <span className="material-symbols-outlined">person</span>
        </Link>
      </nav>
    </div>
  );
}
