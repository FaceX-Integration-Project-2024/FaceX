import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// REQUESTS
async function fetchData<T>(rpcName: string): Promise<T> {
	const { data, error } = await supabase.rpc(rpcName);
	if (error) {
		throw new Error(`Error fetching data for ${rpcName}: ${error.message}`);
	}
	return data;
}

export async function getAllClassBlocksIds() {
	return fetchData<Array<number>>("get_all_class_block_ids");
}

export async function getUserByEmail(email: string | undefined) {
	const { data, error } = await supabase.rpc("get_user_by_email", {
		user_email: email,
	});
	if (error) {
		throw new Error(
			`Error fetching data for get_user_by_email: ${error.message}`,
		);
	}
	return data;
}

export async function getAttendanceForClassBlock(class_block_id: number) {
	const { data, error } = await supabase.rpc("get_attendance_for_class_block", {
		p_block_id: class_block_id,
	});
	if (error) {
		throw new Error(
			`Error fetching data for get_attendance_for_class_block: ${error.message}`,
		);
	}
	return data;
}
