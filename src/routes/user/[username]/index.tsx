import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from "@builder.io/qwik-city";

export const useGetUser = routeLoader$(async (requestEvent) => {
    const username = requestEvent.params["username"];
    // TODO: get user and return it
});

export default component$(() => {
    const user = useGetUser();
    return (
        <>
        </>
    );
});
