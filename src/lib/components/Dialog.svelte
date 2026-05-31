<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Bell } from "lucide-svelte";
  import Loader2 from "@lucide/svelte/icons/loader-2";
  import * as Form from "$lib/components/ui/form/index.js";
  import { superForm } from "sveltekit-superforms";
  import { page } from "$app/state";
  import { zod4 } from "sveltekit-superforms/adapters";
  import { subscriberCreate } from "$lib/types/form";
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";
  const { trigger, destroy } = createWebHaptics();
  onDestroy(destroy);

  let showCompletionDialog = $state(false);
  let sucess = $state(false);

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
        sucess = true;
        showCompletionDialog = true;
      } else {
        sucess = false;
        showCompletionDialog = true;
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

  {#if sucess}
    <Dialog.Content class="sm:max-w-100">
      <Dialog.Header>
        <Dialog.Title>Subscribed!</Dialog.Title>
        <Dialog.Description class="mt-2 text-gray-500">
          You will receive email notifications whenever Oddinpay creates,
          updates, or resolves an incident.
        </Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-3">
        <svg
          class="w-20 h-20 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            fill="#21ba45"
            fill-rule="evenodd"
            d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-5.97-3.03a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47l2.235-2.235L14.97 8.97a.75.75 0 0 1 1.06 0"
            clip-rule="evenodd"
          />
        </svg>

        <Dialog.Footer>
          <Form.Button
            class="w-full flex items-center justify-center bg-black text-white transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-zinc-700 hover:text-white active:scale-[0.98] disabled:pointer-events-auto disabled:cursor-not-allowed cursor-pointer"
            variant="outline"
            onclick={() => (showCompletionDialog = false)}
          >
            Close
          </Form.Button>
        </Dialog.Footer>
      </div>
    </Dialog.Content>
  {:else}
    <Dialog.Content class="sm:max-w-100">
      <Dialog.Header>
        <Dialog.Title>Subscribe to alerts</Dialog.Title>
        <Dialog.Description class="mt-2 text-gray-500">
          Get email notifications whenever Oddinpay creates, updates, or
          resolves an incident.
        </Dialog.Description>
      </Dialog.Header>
      <form method="POST" use:enhance>
        <div class="grid gap-3">
          <div class="grid gap-2 mt-0.5">
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

          <Dialog.Footer>
            <Form.Button
              formaction="?/create"
              class="w-full flex items-center justify-center bg-black text-white transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-zinc-700 hover:text-white active:scale-[0.98] disabled:pointer-events-auto disabled:cursor-not-allowed cursor-pointer"
              type="submit"
              variant="outline"
              onclick={() => trigger([{ duration: 15 }], { intensity: 1 })}
              disabled={$submitting}
              >{#if $submitting}
                <Loader2 class="size-4 animate-spin" />
              {:else}
                Subscribe
              {/if}
            </Form.Button>
          </Dialog.Footer>
        </div>
      </form>
    </Dialog.Content>
  {/if}
</Dialog.Root>
