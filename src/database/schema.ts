import { pgTable, integer, text, real, boolean, timestamp } from "drizzle-orm/pg-core";

export const book = pgTable("book", {
    id: integer("id").primaryKey(),
    type: text("type", { enum: ["manga", "manhua", "manhwa"] }).notNull(),
    score: real("score"),
    synopsis: text("synopsis").notNull(),
    publicationStatus: text("publication_status").notNull(),
    chaptersAvailable: integer("chapters_available").notNull(),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

export const bookchapter = pgTable("bookchapter", {
    id: integer("id").primaryKey(),
    idBook: integer("id_book").notNull().references(() => book.id),
    name: text("name").notNull(),
    link: text("link").notNull(),
    number: integer("number").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

export const bookcover = pgTable("bookcover", {
    id: integer("id").primaryKey(),
    idBook: integer("id_book").notNull().references(() => book.id),
    link: text("link").notNull().unique(),
});

export const bookname = pgTable("bookname", {
    id: integer("id").primaryKey(),
    idBook: integer("id_book").notNull().references(() => book.id),
    name: text("name").notNull().unique(),
});

export const bookprovider = pgTable("bookprovider", {
    id: integer("id").primaryKey(),
    idBook: integer("id_book").notNull().references(() => book.id),
    name: text("name").notNull(),
    link: text("link").notNull(),
    linkApi: text("link_api"),
});

export const bookstatistic = pgTable("bookstatistic", {
    id: integer("id").primaryKey(),
    idBook: integer("id_book").notNull().references(() => book.id),
});

export const booktag = pgTable("booktag", {
    id: integer("id").primaryKey(),
    idBook: integer("id_book").notNull().references(() => book.id),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

export const user = pgTable("user", {
    id: integer("id").primaryKey(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
    modifiedAt: timestamp("modified_at"),
});

export const userbookmark = pgTable("userbookmark", {
    id: integer("id").primaryKey(),
    idUser: integer("id_user").notNull().references(() => user.id),
    idBook: integer("id_book").notNull().references(() => book.id),
    idChapter: integer("id_chapter").references(() => bookchapter.id),
    status: text("status", {
        enum: ["reading", "plan_to_read", "on_hold", "dropped", "completed"],
    }).notNull().default("reading"),
    createdAt: timestamp("created_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
    modifiedAt: timestamp("modified_at"),
    lastReadAt: timestamp("last_read_at"),
});

export const usercomment = pgTable("usercomment", {
    id: integer("id").primaryKey(),
    idUser: integer("id_user").notNull().references(() => user.id),
    idBook: integer("id_book").notNull().references(() => book.id),
    message: text("message").notNull(),
    like: integer("like").notNull().default(0),
    highlighted: boolean("highlighted").notNull().default(false),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
    modifiedAt: timestamp("modified_at"),
});

export const userexcludedtag = pgTable("userexcludedtag", {
    id: integer("id").primaryKey(),
    idUser: integer("id_user").notNull().references(() => user.id),
    idTag: integer("id_tag").notNull().references(() => booktag.id),
});

export const userpermission = pgTable("userpermission", {
    id: integer("id").primaryKey(),
    idUser: integer("id_user").notNull().references(() => user.id),
    member: boolean("member").notNull().default(true),
    moderator: boolean("moderator").notNull().default(false),
    administrator: boolean("administrator").notNull().default(false),
});

export const userstatistic = pgTable("userstatistic", {
    id: integer("id").primaryKey(),
    idUser: integer("id_user").notNull().references(() => user.id),
    readingStatus: real("reading_status"),
    contentType: real("content_type"),
    genres: real("genres"),
});

export const schema = {
    book,
    bookchapter,
    bookcover,
    bookname,
    bookprovider,
    bookstatistic,
    booktag,
    user,
    userbookmark,
    usercomment,
    userexcludedtag,
    userpermission,
    userstatistic,
};

