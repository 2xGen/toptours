/**
 * Paginate Supabase .select() — default API limit is 1000 rows per request.
 */
export async function fetchAllSupabaseRows(supabase, table, select, { pageSize = 1000, orderBy } = {}) {
  let all = [];
  let from = 0;

  while (true) {
    let query = supabase.from(table).select(select).range(from, from + pageSize - 1);
    if (orderBy?.column) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }
    const { data, error } = await query;
    if (error) throw error;
    if (!Array.isArray(data) || data.length === 0) break;
    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}
