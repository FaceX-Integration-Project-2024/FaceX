import { createContext, createResource, useContext } from "solid-js";
import { supabase } from "~/supabase-client";

const UserContext = createContext();

export const UserProvider = (props: any) => {
	const [user, { refetch }] = createResource(async () => {
		const { data } = await supabase.auth.getUser();
		const userEmail = data?.user?.email;

		if (userEmail) {
			const { data: roleData } = await supabase
				.from("users")
				.select("role")
				.eq("email", userEmail)
				.single();

			return { user: data?.user, role: roleData?.role };
		}

		return { user: null, role: null };
	});

	return (
		<UserContext.Provider value={{ user: user()?.user, role: user()?.role }}>
			{props.children}
		</UserContext.Provider>
	);
};

export function useUserContext() {
	return useContext(UserContext);
}
