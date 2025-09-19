<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="hero min-h-">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">{page.status}</h1>
      <p class="py-6">
        {page.error?.message}
      </p>
      <!-- <button class="btn btn-primary">Get Started</button> -->
    </div>
  </div>
</div>
