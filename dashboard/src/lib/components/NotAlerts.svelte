<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import { UserRoundPlus } from "lucide-svelte";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
</script>

<Empty.Root>
  <Empty.Header>
    <Empty.Media variant="icon">
      <UserRoundPlus />
    </Empty.Media>
    <Empty.Title class=" text-gray-200">Subscribers Not Found</Empty.Title>
    <Empty.Description class="text-gray-400">
      The subscribers you are looking for don't exist or have been removed.
    </Empty.Description>
  </Empty.Header>
  <Button variant="link" class="text-gray-400" size="sm">
    <a
      href="https://github.com/oddinpay/ohstatus"
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn More <ArrowUpRightIcon class="inline" />
    </a>
  </Button>
</Empty.Root>
