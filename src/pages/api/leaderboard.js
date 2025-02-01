// // pages/api/leaderboard.js
// import { supabase } from '/lib/supabase';
//
// export default async function handler(req, res) {
//     const { data: leaderboard, error } = await supabase
//         .from('users')
//         .select('id, name, points')
//         .order('points', { ascending: false })
//         .limit(10); // Limit the results to the top 10 users
//
//     if (error) {
//         return res.status(500).json({ error: error.message });
//     }
//
//     res.status(200).json(leaderboard);
// }