<!-- src/routes/+page.svelte -->
<script>
  import { useAuth } from "@mmailaender/convex-auth-svelte/sveltekit";

  const isAuthenticated = $derived(useAuth().isAuthenticated);
  const isLoading = $derived(useAuth().isLoading);
  const { signIn, signOut } = useAuth();
</script>

{#if isLoading}
  <p>Loading authentication state...</p>
{:else if isAuthenticated}
  <h1>Welcome, authenticated user!</h1>
  <button onclick={() => signOut()}>Sign Out</button>
{:else}
  <h1>Please sign in</h1>
  <button onclick={() => signIn("google")}> Sign in with Google </button>
{/if}
