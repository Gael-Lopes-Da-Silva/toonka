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
	REQUIRED_USERNAME: "Username is required",
	REQUIRED_EMAIL: "Email is required",
	REQUIRED_PASSWORD: "Password is required",

	USERNAME_ALREADY_EXISTS: "This username is already taken",
	EMAIL_ALREADY_EXISTS: "This email is already registered",

	USER_NOT_FOUND: "User not found",
	USER_NOT_CONFIRMED: "User account is not confirmed",

	INVALID_ID: "This id format is invalid",
	INVALID_PASSWORD: "This password is invalid",
	INVALID_EMAIL: "This email is invalid",

	UNAUTHORIZED: "You are not authorized to perform this action",
	INTERNAL_ERROR: "An unexpected internal error occurred",
} as const);
