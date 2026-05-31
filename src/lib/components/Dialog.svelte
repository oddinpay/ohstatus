<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Bell, Check } from "lucide-svelte";
  import Loader2 from "@lucide/svelte/icons/loader-2";
  import * as Form from "$lib/components/ui/form/index.js";
  import { superForm } from "sveltekit-superforms";
  import { page } from "$app/state";
  import { zod4 } from "sveltekit-superforms/adapters";
  import { subscriberCreate } from "$lib/types/form";
  import { fade, fly } from "svelte/transition"; // <-- Added transition imports

  let showCompletionDialog = $state(false);
  let isSuccess = $state(false); // <-- Added success state

  $effect(() => {
    if (showCompletionDialog) {
      document.documentElement.style.setProperty(
        "overflow-x",
        "visible",
        "important",
      );
      document.documentElement.style.setProperty("scrollbar-gutter", "stable");

      const scrollY = window.scrollY;
      document.body.classList.add("modal-open");
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      document.documentElement.style.removeProperty("scrollbar-gutter");
      document.documentElement.style.setProperty(
        "overflow-x",
        "hidden",
        "important",
      );

      const scrollY = document.body.style.top;
      if (document.body.classList.contains("modal-open")) {
        document.body.classList.remove("modal-open");
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }

      setTimeout(() => {
        isSuccess = false;
      }, 300);
    }
  });

  const form = superForm(page.data.form, {
    id: "create-subscriber",
    resetForm: true,
    validators: zod4(subscriberCreate),
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
    },
    onUpdate: async ({ form: f }) => {
      if (f.valid) {
        isSuccess = true;
      }
    },
  });

  const { form: formData, submitting, enhance } = form;
</script>

<Dialog.Root bind:open={showCompletionDialog}>
  <Dialog.Trigger
    type="button"
    class="{buttonVariants({ variant: 'outline' })} cursor-pointer"
  >
    <Bell />
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-100 overflow-hidden relative min-h-[250px]">
    {#if !isSuccess}
      <div
        out:fade={{ duration: 150 }}
        in:fade={{ duration: 150, delay: 150 }}
        class="absolute inset-0 p-6 flex flex-col"
      >
        <Dialog.Header>
          <Dialog.Title>Subscribe to alerts</Dialog.Title>
          <Dialog.Description>
            Get email notifications whenever Oddinpay creates, updates, or
            resolves an incident.
          </Dialog.Description>
        </Dialog.Header>

        <form method="POST" use:enhance class="mt-4 flex-1">
          <div class="grid gap-4 h-full">
            <div class="grid gap-3 mt-0.5">
              <Form.Field {form} name="email">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label for="email">Email</Form.Label>
                    <Input
                      placeholder="satoshi@example.com"
                      type="email"
                      autocomplete="email"
                      {...props}
                      bind:value={$formData.email}
                    />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>

            <Dialog.Footer class="mt-auto">
              <Form.Button
                formaction="?/create"
                class="w-full flex items-center justify-center bg-black text-white transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-zinc-700 hover:text-white active:scale-[0.98] disabled:pointer-events-auto disabled:cursor-not-allowed cursor-pointer"
                type="submit"
                variant="outline"
                disabled={$submitting}
              >
                {#if $submitting}
                  <Loader2 class="size-4 animate-spin" />
                {:else}
                  Subscribe
                {/if}
              </Form.Button>
            </Dialog.Footer>
          </div>
        </form>
      </div>
    {:else}
      <div
        in:fly={{ y: 20, duration: 300, delay: 150 }}
        out:fade={{ duration: 150 }}
        class="absolute inset-0 p-6 flex flex-col items-center justify-center text-center space-y-4"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"
        >
          <Check class="h-6 w-6" />
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-medium tracking-tight">
            Successfully Subscribed!
          </h3>
          <p class="text-sm text-muted-foreground">
            You're all set to receive alerts.
          </p>
        </div>

        <button
          class={buttonVariants({ variant: "outline", class: "mt-4 w-full" })}
          onclick={() => (showCompletionDialog = false)}
        >
          Close
        </button>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
