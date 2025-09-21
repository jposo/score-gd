<svelte:head>
  <title>Admin - loggd</title>
</svelte:head>

<div class="container mx-auto p-4">
  <div>hello you are admin</div>
  <button
    class="btn btn-primary"
    onclick={async () => {
      fetch("/api/levels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pageCount: 0 }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data));
    }}>Obtain Levels</button
  >
</div>
