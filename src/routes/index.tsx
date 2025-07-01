import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

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
