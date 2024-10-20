import {
	type ComponentProps,
	type FlowComponent,
	JSXElement,
	createContext,
	createResource,
	useContext,
} from "solid-js";
import { getUserByEmail, supabase } from "~/supabase-client";

interface UserContextData {
	user: {
		(): User | undefined;
		state: "unresolved" | "pending" | "ready" | "refreshing" | "errored";
		loading: boolean;
		error: any;
		latest: User | undefined;
	};

	refetch: () => void;
}

interface User {
	email: string;
	role: "student" | "admin" | "instructor";
	matricule: string;
}

const UserContext = createContext<UserContextData>();

export function UserContextProvider(props: ComponentProps<FlowComponent>) {
	const [user, { refetch }] = createResource<User | undefined>(async () => {
		const { data } = await supabase.auth.getUser();
		const userEmail = data?.user?.email;
		const userData = getUserByEmail(userEmail);
		console.log(userData);
		return userData as Promise<User>;
	});

	return (
		<UserContext.Provider value={{ user, refetch }}>
			{props.children}
		</UserContext.Provider>
	);
}

export function useUserContext() {
	const context = useContext(UserContext);

	if (context === undefined) {
		throw new Error(
			"`useUserContext` must be used within the inside `UserContext.Provider`",
		);
	}

	return context;
}
