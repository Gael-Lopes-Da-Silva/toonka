function hashCode(string: string) {
	let hash = 0;
	for (let i = 0; i < string.length; i++) {
		hash = (hash << 5) - hash + string.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
}

function createErrors<T extends Record<string, string>>(errors: T) {
	const result = {} as ErrorMap<T>;
	for (const key in errors) {
		result[key as keyof T] = {
			name: key,
			code: hashCode(key),
			message: errors[key],
		};
	}
	return result;
}

type ErrorMap<T extends Record<string, string>> = {
	[K in keyof T]: {
		name: K;
		code: number;
		message: T[K];
	};
};

export type Error = {
	name: string;
	code: number;
	message: string;
};

export const Errors = createErrors({
	REQUIRED_FIELD: "There are required field that are empty",

	USERNAME_ALREADY_EXISTS: "This username is already taken",
	EMAIL_ALREADY_EXISTS: "This email is already registered",

	USER_NOT_CONFIRMED: "User account is not confirmed",

	RESSOURCE_NOT_FOUND: "This ressource was not found",
	RESSOURCE_DELETED: "This ressource has been deleted",
	RESSOURCE_ALREADY_DELETED: "This ressource has already been deleted",

	INVALID_ID: "This id format is invalid",
	INVALID_CREDENTIALS: "This credentials are invalid",

	UNAUTHORIZED: "You need to be logged to perform this action",
	FORBIDDEN: "You are not authorized to perform this action",
	INTERNAL_ERROR: "An unexpected internal error occurred",
} as const);
