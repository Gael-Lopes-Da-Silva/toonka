import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const book = sqliteTable("book", {
    id: integer().primaryKey(),
    type: text({ enum: ["manga", "manhua", "manhwa"] }).notNull(),
    score: real(),
    synopsis: text().notNull(),
    publicationStatus: text().notNull(),
    chaptersAvailable: integer().notNull(),
    hidden: integer({ mode: "boolean" }).notNull().default(false),
    createdAt: text().default("CURRENT_TIMESTAMP"),
    deletedAt: text(),
});

export const bookchapter = sqliteTable("bookchapter", {
    id: integer().primaryKey(),
    idBook: integer().notNull().references(() => book.id),
    name: text().notNull(),
    link: text().notNull(),
    number: integer().notNull().default(0),
    createdAt: text().default("CURRENT_TIMESTAMP"),
    deletedAt: text(),
});

export const bookcover = sqliteTable("bookcover", {
    id: integer().primaryKey(),
    idBook: integer().notNull().references(() => book.id),
    link: text().notNull().unique(),
});

export const bookname = sqliteTable("bookname", {
    id: integer().primaryKey(),
    idBook: integer().notNull().references(() => book.id),
    name: text().notNull().unique(),
});

export const bookprovider = sqliteTable("bookprovider", {
    id: integer().primaryKey(),
    idBook: integer().notNull().references(() => book.id),
    name: text().notNull(),
    link: text().notNull(),
    linkApi: text(),
});

export const bookstatistic = sqliteTable("bookstatistic", {
    id: integer().primaryKey(),
    idBook: integer().notNull().references(() => book.id),
});

export const booktag = sqliteTable("booktag", {
    id: integer().primaryKey(),
    idBook: integer().notNull().references(() => book.id),
    name: text().notNull(),
    createdAt: text().default("CURRENT_TIMESTAMP"),
    deletedAt: text(),
});

export const user = sqliteTable("user", {
    id: integer().primaryKey(),
    username: text().notNull().unique(),
    email: text().notNull().unique(),
    password: text().notNull(),
    createdAt: text().default("CURRENT_TIMESTAMP"),
    deletedAt: text(),
    modifiedAt: text(),
});

export const userbookmark = sqliteTable("userbookmark", {
    id: integer().primaryKey(),
    idUser: integer().notNull().references(() => user.id),
    idBook: integer().notNull().references(() => book.id),
    idChapter: integer().references(() => bookchapter.id),
    status: text({ enum: ["reading", "plan_to_read", "on_hold", "dropped", "completed"] }).notNull().default("reading"),
    createdAt: text().default("CURRENT_TIMESTAMP"),
    deletedAt: text(),
    modifiedAt: text(),
    lastReadAt: text(),
});

export const usercomment = sqliteTable("usercomment", {
    id: integer().primaryKey(),
    idUser: integer().notNull().references(() => user.id),
    idBook: integer().notNull().references(() => book.id),
    message: text().notNull(),
    like: integer().notNull().default(0),
    highlighted: integer({ mode: "boolean" }).notNull().default(false),
    hidden: integer({ mode: "boolean" }).notNull().default(false),
    createdAt: text().default("CURRENT_TIMESTAMP"),
    deletedAt: text(),
    modifiedAt: text(),
});

export const userexcludedtag = sqliteTable("userexcludedtag", {
    id: integer().primaryKey(),
    idUser: integer().notNull().references(() => user.id),
    idTag: integer().notNull().references(() => booktag.id),
});

export const userpermission = sqliteTable("userpermission", {
    id: integer().primaryKey(),
    idUser: integer().notNull().references(() => user.id),
    member: integer({ mode: "boolean" }).notNull().default(true),
    moderator: integer({ mode: "boolean" }).notNull().default(false),
    administrator: integer({ mode: "boolean" }).notNull().default(false),
});

export const userstatistic = sqliteTable("userstatistic", {
    id: integer().primaryKey(),
    idUser: integer().notNull().references(() => user.id),
    readingStatus: real(),
    contentType: real(),
    genres: real(),
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
