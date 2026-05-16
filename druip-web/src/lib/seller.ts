export async function isApprovedSeller(supabase: any, userId: string): Promise<boolean> {
  const [{ data: application }, { count }] = await Promise.all([
    supabase
      .from('seller_applications')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .maybeSingle(),
    supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', userId)
      .eq('status', 'published'),
  ])
  return !!application || (count ?? 0) > 0
}
