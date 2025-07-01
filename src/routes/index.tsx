import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
// import { db } from "../../drizzle/db";
// import { user } from "../../drizzle/schema";

export const head: DocumentHead = {
    title: "Toonka | Reading simplified",
    meta: [
        {
            name: "description",
            content: "A cross-site book traker and bookmark holder",
        },
    ],
};

export default component$(() => {
    return (
        <>
        </>
    );
});
