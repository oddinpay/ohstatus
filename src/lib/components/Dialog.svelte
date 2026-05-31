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

  let showCompletionDialog = $state(false);
  let email = $state("");

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
        email = "";
        showCompletionDialog = false;
      } else {
        showCompletionDialog = false;
        const serverMessage = f.errors._errors?.[0];
        const finalMessage =
          serverMessage || "Something went wrong. Please try again.";
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
  <Dialog.Content class="sm:max-w-100">
    <Dialog.Header>
      <Dialog.Title>Subscribe to alerts</Dialog.Title>
      <Dialog.Description>
        Get email notifications whenever Oddinpay creates, updates, or resolves
        an incident.
      </Dialog.Description>
    </Dialog.Header>
    <form method="POST" use:enhance>
      <div class="grid gap-4">
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
                  bind:value={email}
                />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
        </div>

        <Dialog.Footer>
          <Dialog.Close
            type="button"
            class="{buttonVariants({ variant: 'outline' })} cursor-pointer"
          >
            Close
          </Dialog.Close>

          <Form.Button
            formaction="?/create"
            class="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
            type="submit"
            variant="outline"
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
</Dialog.Root>
