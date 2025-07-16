import "dotenv/config";

import cors from "cors";
import express from "express";
import { exit } from "process";

import BookRoute from "./routes/book.ts";
import BookChapterRoute from "./routes/bookChapter.ts";
import BookCoverRoute from "./routes/bookCover.ts";
import BookNameRoute from "./routes/bookName.ts";
import BookProviderRoute from "./routes/bookProvider.ts";
import BookStatisticRoute from "./routes/bookStatistic.ts";
import BookTagRoute from "./routes/bookTag.ts";
import UserRoute from "./routes/user.ts";
import UserBookmarkRoute from "./routes/userBookmark.ts";
import UserCommentRoute from "./routes/userComment.ts";
import UserExcludedTagRoute from "./routes/userExcludedTag.ts";
import UserPermissionRoute from "./routes/userPermission.ts";
import UserStatisticRoute from "./routes/userStatistic.ts";

if (!process.env.API_PORT || !process.env.API_SECRET) {
	console.error("Missing entry in .env");
	exit(1);
}

const PORT = process.env.API_PORT;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use("/book", BookRoute);
app.use("/book/chapter", BookChapterRoute);
app.use("/book/cover", BookCoverRoute);
app.use("/book/name", BookNameRoute);
app.use("/book/provider", BookProviderRoute);
app.use("/book/statistic", BookStatisticRoute);
app.use("/book/tag", BookTagRoute);
app.use("/user", UserRoute);
app.use("/user/bookmark", UserBookmarkRoute);
app.use("/user/comment", UserCommentRoute);
app.use("/user/excluded_tag", UserExcludedTagRoute);
app.use("/user/permission", UserPermissionRoute);
app.use("/user/statistic", UserStatisticRoute);

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
