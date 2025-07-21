import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorSender } from "./middlewares/global";
import { type Error } from "./services/ErrorHandler";

import BookRoute from "./routes/book";
import BookChapterRoute from "./routes/bookChapter";
import BookCoverRoute from "./routes/bookCover";
import BookNameRoute from "./routes/bookName";
import BookProviderRoute from "./routes/bookProvider";
import BookStatisticRoute from "./routes/bookStatistic";
import BookTagRoute from "./routes/bookTag";
import UserRoute from "./routes/user";
import UserBookmarkRoute from "./routes/userBookmark";
import UserCommentRoute from "./routes/userComment";
import UserExcludedTagRoute from "./routes/userExcludedTag";
import UserPermissionRoute from "./routes/userPermission";
import UserStatisticRoute from "./routes/userStatistic";

declare global {
	namespace Express {
		interface Request {
			user: any;
			sendError(status: number, error: Error): void;
		}
	}
}

if (!process.env.API_PORT) {
	throw new Error("API_PORT environment variable is not set.");
}

const PORT = process.env.API_PORT;

const app = express();
app.use(cors());
app.use(helmet());
app.use(errorSender());
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
