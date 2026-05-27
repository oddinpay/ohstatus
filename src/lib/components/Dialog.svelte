<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Bell } from "lucide-svelte";

  let showCompletionDialog = $state(false);

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
</script>

<Dialog.Root bind:open={showCompletionDialog}>
  <form>
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
          Get email notifications whenever Oddinpay creates, updates, or
          resolves an incident.
        </Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4">
        <div class="grid gap-3 mt-1">
          <Label for="email">Email</Label>
          <Input
            required
            id="email"
            name="email"
            type="email"
            placeholder="satoshi@example.com"
          />
        </div>
      </div>
      <Dialog.Footer>
        <Dialog.Close
          type="button"
          class="{buttonVariants({ variant: 'outline' })} cursor-pointer"
        >
          Close
        </Dialog.Close>
        <Button type="submit">Subscribe</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </form>
</Dialog.Root>
