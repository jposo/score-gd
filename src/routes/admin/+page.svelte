<script lang="ts">
  import Alert from "$lib/components/Alert.svelte";

  let success: string | undefined = $state();
  let error: string | undefined = $state();
  const alertDuration = 2000;
</script>

<svelte:head>
  <title>Admin - loggd</title>
</svelte:head>

{#if success}
  <Alert message={success} type="success" duration={alertDuration} />
{/if}
{#if error}
  <Alert message={error} type="error" duration={alertDuration} />
{/if}

<ul
  class="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-b-box w-full"
>
  <li><a href="/admin">loggd</a></li>
  <li><a href="/admin/levelguessr">levelguessr</a></li>
</ul>

<div class="container mx-auto p-4">
  <form method="POST" action="/admin?/fetchLevels">
    <fieldset
      class="fieldset bg-base-200 border-base-300 rounded-box w-md border p-4"
    >
      <legend class="fieldset-legend">Fetch Levels</legend>
      <div class="join gap-2">
        <input
          class="input join-item"
          placeholder="Page start"
          name="pageStart"
          type="number"
        />
        <input
          class="input join-item"
          placeholder="Page end"
          name="pageEnd"
          type="number"
        />
        <button class="btn btn-primary join-item" type="submit"
          >Fetch Levels</button
        >
      </div>
    </fieldset>
  </form>
</div>
