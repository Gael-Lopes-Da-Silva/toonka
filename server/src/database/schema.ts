import {
	uuid,
	integer,
	real,
	boolean,
	timestamp,
	index,
	uniqueIndex,
	customType,
	pgEnum,
	pgTable,
} from "drizzle-orm/pg-core";
import crypto from "crypto";

function encrypt(data: Buffer, key: Buffer): Buffer {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
	const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
	return Buffer.concat([iv, encrypted]);
}

function decrypt(encryptedData: Buffer, key: Buffer): Buffer {
	const iv = Buffer.from(encryptedData.subarray(0, 16));
	const data = Buffer.from(encryptedData.subarray(16));
	const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
	return Buffer.concat([decipher.update(data), decipher.final()]);
}

const encryptedText = customType<{ data: string }>({
	dataType() {
		return "text";
	},
	fromDriver(value: unknown) {
		const encryptedHex = value as string;
		const encryptedBuffer = Buffer.from(encryptedHex, "hex");
		const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
		const decryptedBuffer = decrypt(encryptedBuffer, key);
		return decryptedBuffer.toString("utf8");
	},
	toDriver(value: string) {
		const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
		const encryptedBuffer = encrypt(Buffer.from(value, "utf8"), key);
		return encryptedBuffer.toString("hex");
	},
});

export const bookType = pgEnum("book_type", [
	"manga",
	"manhua",
	"manhwa",
	"novel",
]);

export const userBookmarkStatus = pgEnum("user_bookmark_status", [
	"reading",
	"plan_to_read",
	"on_hold",
	"dropped",
	"completed",
]);

export const book = pgTable(
	"book",
	{
		id: uuid("id").primaryKey(),
		type: bookType("type").notNull(),
		score: real("score"),
		synopsis: encryptedText("synopsis").notNull(),
		publicationStatus: encryptedText("publication_status").notNull(),
		chaptersAvailable: integer("chapters_available").notNull(),
		hidden: boolean("hidden").notNull().default(false),
		createdAt: timestamp("created_at").defaultNow(),
		deletedAt: timestamp("deleted_at"),
		modifiedAt: timestamp("modified_at"),
	},
	(table) => [
		index("book_type_idx").on(table.type),
		index("book_publication_status_idx").on(table.publicationStatus),
		index("book_deleted_at_idx").on(table.deletedAt),
		index("book_created_at_idx").on(table.createdAt),
		index("book_modified_at_idx").on(table.modifiedAt),
	],
);

export const bookChapter = pgTable(
	"book_chapter",
	{
		id: uuid("id").primaryKey(),
		bookId: uuid("book_id")
			.notNull()
			.references(() => book.id),
		name: encryptedText("name").notNull(),
		link: encryptedText("link").notNull(),
		number: integer("number").notNull().default(0),
		createdAt: timestamp("created_at").defaultNow(),
		deletedAt: timestamp("deleted_at"),
		modifiedAt: timestamp("modified_at"),
	},
	(table) => [
		index("book_chapter_book_id_idx").on(table.bookId),
		index("book_chapter_deleted_at_idx").on(table.deletedAt),
		index("book_chapter_created_at_idx").on(table.createdAt),
		index("book_chapter_modified_at_idx").on(table.modifiedAt),
		index("book_chapter_number_idx").on(table.number),
	],
);

export const bookCover = pgTable(
	"book_cover",
	{
		id: uuid("id").primaryKey(),
		bookId: uuid("book_id")
			.notNull()
			.references(() => book.id),
		link: encryptedText("link").notNull().unique(),
	},
	(table) => [index("book_cover_book_id_idx").on(table.bookId)],
);

export const bookName = pgTable(
	"book_name",
	{
		id: uuid("id").primaryKey(),
		bookId: uuid("book_id")
			.notNull()
			.references(() => book.id),
		name: encryptedText("name").notNull().unique(),
	},
	(table) => [index("book_name_book_id_idx").on(table.bookId)],
);

export const bookProvider = pgTable(
	"book_provider",
	{
		id: uuid("id").primaryKey(),
		bookId: uuid("book_id")
			.notNull()
			.references(() => book.id),
		name: encryptedText("name").notNull(),
		link: encryptedText("link").notNull(),
		linkApi: encryptedText("link_api"),
	},
	(table) => [index("book_provider_book_id_idx").on(table.bookId)],
);

export const bookStatistic = pgTable(
	"book_statistic",
	{
		id: uuid("id").primaryKey(),
		bookId: uuid("book_id")
			.notNull()
			.references(() => book.id),
	},
	(table) => [index("book_statistic_book_id_idx").on(table.bookId)],
);

export const bookTag = pgTable(
	"book_tag",
	{
		id: uuid("id").primaryKey(),
		bookId: uuid("book_id")
			.notNull()
			.references(() => book.id),
		name: encryptedText("name").notNull(),
		createdAt: timestamp("created_at").defaultNow(),
		deletedAt: timestamp("deleted_at"),
		modifiedAt: timestamp("modified_at"),
	},
	(table) => [
		index("book_tag_book_id_idx").on(table.bookId),
		index("book_tag_deleted_at_idx").on(table.deletedAt),
		index("book_tag_created_at_idx").on(table.createdAt),
		index("book_tag_modified_at_idx").on(table.modifiedAt),
	],
);

export const user = pgTable(
	"user",
	{
		id: uuid("id").primaryKey(),
		username: encryptedText("username").notNull().unique(),
		email: encryptedText("email").notNull().unique(),
		password: encryptedText("password").notNull(),
		token: encryptedText("token").unique(),
		verifiedAt: timestamp("verified_at"),
		createdAt: timestamp("created_at").defaultNow(),
		deletedAt: timestamp("deleted_at"),
		modifiedAt: timestamp("modified_at"),
	},
	(table) => [
		index("user_created_at_idx").on(table.createdAt),
		index("user_deleted_at_idx").on(table.deletedAt),
		index("user_modified_at_idx").on(table.modifiedAt),
	],
);

export const userBookmark = pgTable(
	"user_bookmark",
	{
		id: uuid("id").primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		bookId: uuid("book_id")
			.notNull()
			.references(() => book.id),
		chapterId: uuid("chapter_id").references(() => bookChapter.id),
		status: userBookmarkStatus("status").notNull().default("reading"),
		createdAt: timestamp("created_at").defaultNow(),
		deletedAt: timestamp("deleted_at"),
		modifiedAt: timestamp("modified_at"),
		lastReadAt: timestamp("last_read_at"),
	},
	(table) => [
		uniqueIndex("user_bookmark_user_book_unique").on(
			table.userId,
			table.bookId,
		),

		index("user_bookmark_user_id_idx").on(table.userId),
		index("user_bookmark_book_id_idx").on(table.bookId),
		index("user_bookmark_chapter_id_idx").on(table.chapterId),
		index("user_bookmark_status_idx").on(table.status),
		index("user_bookmark_created_at_idx").on(table.createdAt),
		index("user_bookmark_deleted_at_idx").on(table.deletedAt),
		index("user_bookmark_modified_at_idx").on(table.modifiedAt),
		index("user_bookmark_last_read_at_idx").on(table.lastReadAt),
	],
);

export const userComment = pgTable(
	"user_comment",
	{
		id: uuid("id").primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		bookId: uuid("book_id")
			.notNull()
			.references(() => book.id),
		message: encryptedText("message").notNull(),
		like: integer("like").notNull().default(0),
		highlighted: boolean("highlighted").notNull().default(false),
		hidden: boolean("hidden").notNull().default(false),
		createdAt: timestamp("created_at").defaultNow(),
		deletedAt: timestamp("deleted_at"),
		modifiedAt: timestamp("modified_at"),
	},
	(table) => [
		index("user_comment_user_id_idx").on(table.userId),
		index("user_comment_book_id_idx").on(table.bookId),
		index("user_comment_highlighted_idx").on(table.highlighted),
		index("user_comment_hidden_idx").on(table.hidden),
		index("user_comment_deleted_at_idx").on(table.deletedAt),
		index("user_comment_created_at_idx").on(table.createdAt),
		index("user_comment_modified_at_idx").on(table.modifiedAt),
		index("user_comment_user_book_idx").on(table.userId, table.bookId),
	],
);

export const userExcludedTag = pgTable(
	"user_excluded_tag",
	{
		id: uuid("id").primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		tagId: uuid("tag_id")
			.notNull()
			.references(() => bookTag.id),
	},
	(table) => [
		index("user_excluded_tag_user_id_idx").on(table.userId),
		index("user_excluded_tag_tag_id_idx").on(table.tagId),
		index("user_excluded_tag_user_tag_idx").on(table.userId, table.tagId),
	],
);

export const userPermission = pgTable(
	"user_permission",
	{
		id: uuid("id").primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		member: boolean("member").notNull().default(true),
		moderator: boolean("moderator").notNull().default(false),
		administrator: boolean("administrator").notNull().default(false),
		modifiedAt: timestamp("modified_at"),
	},
	(table) => [
		index("user_permission_user_id_idx").on(table.userId),
		index("user_permission_modified_at_idx").on(table.modifiedAt),
	],
);

export const userStatistic = pgTable(
	"user_statistic",
	{
		id: uuid("id").primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		readingStatus: real("reading_status"),
		contentType: real("content_type"),
		genres: real("genres"),
	},
	(table) => [index("user_statistic_user_id_idx").on(table.userId)],
);

export const schema = {
	book,
	bookChapter,
	bookCover,
	bookName,
	bookProvider,
	bookStatistic,
	bookTag,
	user,
	userBookmark,
	userComment,
	userExcludedTag,
	userPermission,
	userStatistic,
};
