import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const book = table("book", {
    id: t.integer().primaryKey(),
    type: t.text({ enum: ["manga", "manhua", "manhwa"] }).notNull(),
    score: t.real(),
    synopsis: t.text().notNull(),
    publicationStatus: t.text().notNull(),
    chaptersAvailable: t.integer().notNull(),
    hidden: t.integer({ mode: "boolean" }).notNull().default(false),
    createdAt: t.text().default("CURRENT_TIMESTAMP"),
    deletedAt: t.text(),
});

export const bookchapter = table("bookchapter", {
    id: t.integer().primaryKey(),
    idBook: t.integer().notNull().references(() => book.id),
    name: t.text().notNull(),
    link: t.text().notNull(),
    number: t.integer().notNull().default(0),
    createdAt: t.text().default("CURRENT_TIMESTAMP"),
    deletedAt: t.text(),
});

export const bookcover = table("bookcover", {
    id: t.integer().primaryKey(),
    idBook: t.integer().notNull().references(() => book.id),
    link: t.text().notNull().unique(),
});

export const bookname = table("bookname", {
    id: t.integer().primaryKey(),
    idBook: t.integer().notNull().references(() => book.id),
    name: t.text().notNull().unique(),
});

export const bookprovider = table("bookprovider", {
    id: t.integer().primaryKey(),
    idBook: t.integer().notNull().references(() => book.id),
    name: t.text().notNull(),
    link: t.text().notNull(),
    linkApi: t.text(),
});

export const bookstatistic = table("bookstatistic", {
    id: t.integer().primaryKey(),
    idBook: t.integer().notNull().references(() => book.id),
});

export const booktag = table("booktag", {
    id: t.integer().primaryKey(),
    idBook: t.integer().notNull().references(() => book.id),
    name: t.text().notNull(),
    createdAt: t.text().default("CURRENT_TIMESTAMP"),
    deletedAt: t.text(),
});

export const user = table("user", {
    id: t.integer().primaryKey(),
    username: t.text().notNull().unique(),
    email: t.text().notNull().unique(),
    password: t.text().notNull(),
    createdAt: t.text().default("CURRENT_TIMESTAMP"),
    deletedAt: t.text(),
    modifiedAt: t.text(),
});

export const userbookmark = table("userbookmark", {
    id: t.integer().primaryKey(),
    idUser: t.integer().notNull().references(() => user.id),
    idBook: t.integer().notNull().references(() => book.id),
    idChapter: t.integer().references(() => bookchapter.id),
    status: t.text({ enum: ["reading", "plan_to_read", "on_hold", "dropped", "completed"] }).notNull().default("reading"),
    createdAt: t.text().default("CURRENT_TIMESTAMP"),
    deletedAt: t.text(),
    modifiedAt: t.text(),
    lastReadAt: t.text(),
});

export const usercomment = table("usercomment", {
    id: t.integer().primaryKey(),
    idUser: t.integer().notNull().references(() => user.id),
    idBook: t.integer().notNull().references(() => book.id),
    message: t.text().notNull(),
    like: t.integer().notNull().default(0),
    highlighted: t.integer({ mode: "boolean" }).notNull().default(false),
    hidden: t.integer({ mode: "boolean" }).notNull().default(false),
    createdAt: t.text().default("CURRENT_TIMESTAMP"),
    deletedAt: t.text(),
    modifiedAt: t.text(),
});

export const userexcludedtag = table("userexcludedtag", {
    id: t.integer().primaryKey(),
    idUser: t.integer().notNull().references(() => user.id),
    idTag: t.integer().notNull().references(() => booktag.id),
});

export const userpermission = table("userpermission", {
    id: t.integer().primaryKey(),
    idUser: t.integer().notNull().references(() => user.id),
    member: t.integer({ mode: "boolean" }).notNull().default(true),
    moderator: t.integer({ mode: "boolean" }).notNull().default(false),
    administrator: t.integer({ mode: "boolean" }).notNull().default(false),
});

export const userstatistic = table("userstatistic", {
    id: t.integer().primaryKey(),
    idUser: t.integer().notNull().references(() => user.id),
    readingStatus: t.real(),
    contentType: t.real(),
    genres: t.real(),
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
