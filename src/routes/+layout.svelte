<script lang="ts">
    import "../app.css";

    let { children } = $props();
</script>

<svelte:head>
    <title>Toonka | Reading simplified</title>
    <meta name="description" content="Bookmark keeper and publication tracker." />
</svelte:head>

{@render children()}
