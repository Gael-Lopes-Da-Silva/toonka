import {
	integer,
	serial,
	text,
	real,
	boolean,
	timestamp,
	index,
	uniqueIndex,
	pgEnum,
	pgTable,
} from "drizzle-orm/pg-core";

export const bookType = pgEnum("book_type", [
	"manga",
	"manhua",
	"manhwa",
	"novel",
]);
export type BookType = (typeof bookType.enumValues)[number];

export const userBookmarkStatus = pgEnum("user_bookmark_status", [
	"reading",
	"plan_to_read",
	"on_hold",
	"dropped",
	"completed",
]);
export type UserBookmarkStatus = (typeof userBookmarkStatus.enumValues)[number];

export const book = pgTable(
	"book",
	{
		id: serial("id").primaryKey(),
		type: bookType("type").notNull(),
		score: real("score"),
		synopsis: text("synopsis").notNull(),
		publicationStatus: text("publication_status").notNull(),
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
		id: serial("id").primaryKey(),
		bookId: integer("book_id")
			.notNull()
			.references(() => book.id),
		name: text("name").notNull(),
		link: text("link").notNull(),
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
		id: serial("id").primaryKey(),
		bookId: integer("book_id")
			.notNull()
			.references(() => book.id),
		link: text("link").notNull().unique(),
	},
	(table) => [index("book_cover_book_id_idx").on(table.bookId)],
);

export const bookName = pgTable(
	"book_name",
	{
		id: serial("id").primaryKey(),
		bookId: integer("book_id")
			.notNull()
			.references(() => book.id),
		name: text("name").notNull().unique(),
	},
	(table) => [index("book_name_book_id_idx").on(table.bookId)],
);

export const bookProvider = pgTable(
	"book_provider",
	{
		id: serial("id").primaryKey(),
		bookId: integer("book_id")
			.notNull()
			.references(() => book.id),
		name: text("name").notNull(),
		link: text("link").notNull(),
		linkApi: text("link_api"),
	},
	(table) => [index("book_provider_book_id_idx").on(table.bookId)],
);

export const bookStatistic = pgTable(
	"book_statistic",
	{
		id: serial("id").primaryKey(),
		bookId: integer("book_id")
			.notNull()
			.references(() => book.id),
	},
	(table) => [index("book_statistic_book_id_idx").on(table.bookId)],
);

export const bookTag = pgTable(
	"book_tag",
	{
		id: serial("id").primaryKey(),
		bookId: integer("book_id")
			.notNull()
			.references(() => book.id),
		name: text("name").notNull(),
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
		id: serial("id").primaryKey(),
		username: text("username").notNull().unique(),
		email: text("email").notNull().unique(),
		password: text("password").notNull(),
		token: text("token").unique(),
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
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => user.id),
		bookId: integer("book_id")
			.notNull()
			.references(() => book.id),
		chapterId: integer("chapter_id").references(() => bookChapter.id),
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
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => user.id),
		bookId: integer("book_id")
			.notNull()
			.references(() => book.id),
		message: text("message").notNull(),
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
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => user.id),
		tagId: integer("tag_id")
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
		id: serial("id").primaryKey(),
		userId: integer("user_id")
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
		id: serial("id").primaryKey(),
		userId: integer("user_id")
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
