<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Form from "$lib/components/ui/form/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { CalendarCheck } from "lucide-svelte";
  import { useCharacterLimit } from "$lib/hooks/use-character-limit.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import { page } from "$app/state";
  import { superForm } from "sveltekit-superforms";
  import { zod4 } from "sveltekit-superforms/adapters";
  import { toast } from "svelte-sonner";
  import { incidentCreate2 } from "$lib/types/form";
  import Loader2 from "@lucide/svelte/icons/loader-2";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import MoreHorizontal from "@lucide/svelte/icons/more-horizontal";
  import {
    ConfirmDeleteDialog,
    confirmDelete,
  } from "$lib/components/ui/confirm-delete-dialog";

  import { useQuery } from "convex-svelte";
  import { api } from "../../convex/_generated/api";

  const incidents = [
    { class: "text-gray-500", label: "Investigating", value: "Investigating" },
    { class: "text-red-500", label: "Identified", value: "Identified" },
    { class: "text-yellow-500", label: "In Progress", value: "Inprogress" },
    { class: "text-emerald-600", label: "Resolved", value: "Resolved" },
  ] as const;

  let {
    id,
    name,
    service,
    parentId,
    status: statusProp,
  }: {
    id: string;
    name: string;
    service: string;
    parentId: string;
    status: string;
  } = $props();

  const visibleIncidents = $derived(() => {
    if (isParentLocked) {
      return incidents.filter((i) => i.value === statusProp);
    }

    if (statusProp === "Investigating") {
      return incidents.filter((i) => i.value === "Identified");
    } else if (statusProp === "Inprogress") {
      return incidents.filter((i) => i.value === "Resolved");
    } else if (statusProp === "Identified") {
      return incidents.filter((i) => i.value === "Inprogress");
    } else if (statusProp === "Resolved") {
      return incidents.filter((i) => i.value === "Resolved");
    }
    return incidents;
  });

  let open = $state(false);
  let bioLimit = useCharacterLimit(180, "");
  const incidentCount = useQuery(api.incidents.get, {});

  const isParentLocked = $derived.by(() => {
    if (!incidentCount.data) return false;

    const relatedIncidents = incidentCount.data.filter(
      (s) => s.parentId === parentId,
    );

    const hasInProgress = relatedIncidents.some(
      (s) => s.status === "Inprogress",
    );
    const hasCompleted = relatedIncidents.some((s) => s.status === "Resolved");

    const groupIsActiveOrDone = hasInProgress || hasCompleted;

    if (statusProp === "Identified" && groupIsActiveOrDone) {
      return true;
    }

    if (statusProp === "Inprogress" && hasCompleted) {
      return true;
    }

    return statusProp === "Resolved";
  });

  $effect(() => {
    if (open) {
      if (isParentLocked) {
        $formData.status = statusProp;
      } else {
        if (statusProp === "Investigating") {
          $formData.status = "Identified";
        } else if (statusProp === "Identified") {
          $formData.status = "Inprogress";
        } else if (statusProp === "Inprogress") {
          $formData.status = "Resolved";
        } else {
          $formData.status = statusProp;
        }
      }
    }
  });

  $effect(() => {
    if (isParentLocked) {
      if (statusProp === "Investigating") {
        $formData.status = "Identified";
      } else if (statusProp === "Resolved") {
        $formData.status = "Resolved";
      } else if (statusProp === "Inprogress") {
        $formData.status = "Inprogress";
      }
      return;
    }

    if (statusProp === "Identified") {
      $formData.status = "Inprogress";
    } else if (statusProp === "Inprogress") {
      $formData.status = "Resolved";
    } else if (statusProp) {
      $formData.status = statusProp;
    }
  });

  const selected = $derived(
    incidents.find((i) => i.value === $formData.status),
  );

  $effect(() => {
    const serviceName = service.trim().toUpperCase();
    name = serviceName ? `Incident ${serviceName}` : "Incident API";

    $formData.title = name;
    $formData.service = service;
  });

  $effect(() => {
    if (!open || $submitting) return;

    if ($formData.status === "Inprogress") {
      bioLimit.value =
        "An incident is currently in progress. We will provide updates as necessary.";
    } else if ($formData.status === "Resolved") {
      bioLimit.value = "The incident has been resolved.";
    } else if ($formData.status === "Identified") {
      bioLimit.value = `We have identified an incident related to ${service}. We will provide updates as necessary.`;
    }
  });

  const uid = $props.id();
  const form = superForm(page.data.form, {
    id: `update-incident-${uid}`,
    resetForm: true,
    validators: zod4(incidentCreate2),
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
    },
    onUpdate: async ({ form: f }) => {
      if (f.valid) {
        service = "";
        name = "";
        bioLimit.value = "";
        open = false;
        toast.success("Incident updated successfully!");
      } else {
        open = false;
        const serverMessage = f.errors._errors?.[0];
        const finalMessage =
          serverMessage || "Something went wrong. Please try again.";
        toast.error(finalMessage);
      }
    },
  });

  const { form: formData, submitting, enhance } = form;

  $effect(() => {
    $formData.note = bioLimit.value;
  });
</script>

{#snippet status(item: (typeof incidents)[number])}
  <span class="flex items-center gap-2">
    <svg
      width="8"
      height="8"
      fill="currentColor"
      viewBox="0 0 8 8"
      xmlns="http://www.w3.org/2000/svg"
      class={item.class}
      aria-hidden="true"
    >
      <circle cx="4" cy="4" r="4" />
    </svg>
    <span class="truncate">{item.label}</span>
  </span>
{/snippet}

<Dialog.Root bind:open>
  <Dialog.Content class="bg-zinc-900">
    <div class="flex flex-col items-center gap-2">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-full border border-border"
        aria-hidden="true"
      >
        <CalendarCheck class="h-10 w-10 text-white" />
      </div>

      <Dialog.Header>
        <Dialog.Title class=" text-gray-300 sm:text-center"
          >Update Incident</Dialog.Title
        >
        <Dialog.Description class="text-gray-400 sm:text-center">
          Update your incident settings.
        </Dialog.Description>
      </Dialog.Header>
    </div>

    <form method="POST" class="space-y-5" use:enhance>
      <div class="space-y-4">
        <div class="space-y-2">
          <Form.Field {form} name="parentId">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label class="font-bold text-gray-300" for="parentId"
                  >ID</Form.Label
                >
                <Input
                  class=" border-zinc-700 text-zinc-300"
                  placeholder="sc_23kq140p62ena8trgd66m8342n"
                  type="text"
                  readonly
                  {...props}
                  bind:value={parentId}
                />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
        </div>

        <div class="space-y-2">
          <Form.Field {form} name="service">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label class="font-bold text-gray-300" for="service"
                  >Service</Form.Label
                >
                <Input
                  class=" border-zinc-700 text-zinc-300"
                  placeholder="API"
                  type="text"
                  readonly
                  {...props}
                  bind:value={service}
                />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
        </div>

        <div class="space-y-2">
          <Form.Field {form} name="status">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label class="font-bold text-gray-300" for="status"
                  >Status</Form.Label
                >

                <input
                  type="hidden"
                  name="status"
                  bind:value={$formData.status}
                />
                <Select.Root type="single" bind:value={$formData.status}>
                  <Select.Trigger
                    {...props}
                    class="w-full cursor-pointer border-zinc-700 text-white [&_svg:not([class*='text-'])]:text-zinc-200 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
                  >
                    {#if selected}
                      {@render status(selected)}
                    {:else}
                      Select a status
                    {/if}
                  </Select.Trigger>
                  <Select.Content
                    class="bg-zinc-800  text-white [&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:inset-e-2 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:items-center [&_*[data-select-item]>span]:gap-2 [&_*[data-select-item]>span>svg]:shrink-0"
                  >
                    {#each visibleIncidents() as item (item.value)}
                      <Select.Item
                        class="cursor-pointer data-highlighted:bg-zinc-700 data-highlighted:text-white [&_svg:not([class*='text-'])]:text-gray-500"
                        value={item.value}
                      >
                        {@render status(item)}
                      </Select.Item>
                    {/each}
                  </Select.Content>
                </Select.Root>
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
        </div>

        <div class="space-y-2">
          <Form.Field {form} name="note">
            <Form.Control>
              {#snippet children({ props })}
                <div class="*:not-first:mt-2">
                  <Label class="font-bold text-gray-300" for="note">Note</Label>
                  <Textarea
                    {...props}
                    id="note"
                    class=" border-zinc-700 text-white"
                    bind:value={bioLimit.value}
                    maxlength={bioLimit.maxLength}
                    placeholder="Write a few sentences about incident..."
                    aria-describedby="{id}-left-textarea"
                    readonly
                    required
                  />
                  <p
                    class="mt-2 text-right text-xs text-muted-foreground"
                    role="status"
                    aria-live="polite"
                  >
                    <span class="tabular-nums"
                      >{bioLimit.maxLength - bioLimit.characterCount}</span
                    >
                    characters left
                  </p>
                </div>
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
        </div>
        <Form.Button
          formaction="?/update"
          class="mt-2 w-full cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
          type="submit"
          variant="outline"
          disabled={$submitting || isParentLocked}
          >{#if $submitting}
            <Loader2 class="size-4 animate-spin" />
          {:else}
            Update
          {/if}
        </Form.Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={buttonVariants({ variant: "outline", size: "icon-sm" }) +
      " cursor-pointer text-white hover:text-gray-300 bg-zinc-800 border-zinc-600 hover:bg-zinc-900"}
  >
    <MoreHorizontal />
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-40 " align="end">
    <DropdownMenu.Group>
      <DropdownMenu.Label>Actions</DropdownMenu.Label>
      <DropdownMenu.Item
        class="cursor-pointer text-black data-highlighted:bg-zinc-200 data-highlighted:text-black"
        onSelect={() => (open = true)}
      >
        Edit
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="cursor-pointer text-red-600 data-highlighted:bg-red-100 data-highlighted:text-red-600"
        onSelect={() => {
          confirmDelete({
            title: "Delete monitor",
            description:
              "Are you sure you want to delete this monitor? This action cannot be undone.",
            input: {
              confirmationText: "yes",
            },
            onConfirm: async () => {
              const formData = new FormData();

              formData.append("_id", id);

              formData.append("confirmation", "yes");

              const response = await fetch("?/delete", {
                method: "POST",
                body: formData,
              });

              if (response.ok) {
                toast.success(`${name} deleted successfully!`);
              } else {
                toast.error("Failed to delete.");
              }
            },
          });
        }}
      >
        Delete
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<ConfirmDeleteDialog />
