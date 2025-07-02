import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export const head: DocumentHead = {
    title: "Toonka | Reading simplified",
    meta: [
        {
            name: "description",
            content: "A bookmark keeper and a publication tracker.",
        },
    ],
};

export default component$(() => {
    return (
        <>
        </>
    );
});
