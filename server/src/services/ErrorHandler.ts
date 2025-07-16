let code = 1;

export type Error = {
	code: number;
	message: string;
};

export const Errors = {
	USERNAME_NOT_PROVIDED: { code: code++, message: "Username not provided" },
	EMAIL_NOT_PROVIDED: { code: code++, message: "Email not provided" },
	PASSWORD_NOT_PROVIDED: { code: code++, message: "Password not provided" },
	USERNAME_ALREADY_USED: { code: code++, message: "Username already used" },
	EMAIL_ALREADY_USED: { code: code++, message: "Email already used" },
	USER_NOT_FOUND: { code: code++, message: "User not found" },
	USER_NOT_CONFIRMED: { code: code++, message: "User not confirmed" },
	INVALID_ID: { code: code++, message: "Invalid id" },
	INVALID_PASSWORD: { code: code++, message: "Invalid password" },
	INVALID_EMAIL: { code: code++, message: "Invalid email" },

	INTERNAL_ERROR: { code: code++, message: "Internal error" },
} as const;
