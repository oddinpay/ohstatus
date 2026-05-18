<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import {
    FieldGroup,
    Field,
    FieldLabel,
    FieldDescription,
    FieldSeparator,
  } from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { cn } from "$lib/utils.js";
  const { signIn, signOut } = useAuth();
  import { useAuth } from "@mmailaender/convex-auth-svelte/sveltekit";

  import type { HTMLAttributes } from "svelte/elements";
  let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> =
    $props();
  const id = $props.id();
</script>

<div class={cn("flex flex-col gap-6", className)} {...restProps}>
  <Card.Root>
    <Card.Header class="text-center">
      <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card">
        Continue with
      </FieldSeparator>
    </Card.Header>
    <Card.Content>
      <form>
        <FieldGroup>
          <Field>
            <Button
              class="cursor-pointer"
              onclick={() => signIn("google")}
              variant="outline"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Login with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </Card.Content>
  </Card.Root>
  <FieldDescription class="px-6 text-center">
    By clicking continue, you agree to our <a
      href="https://oddinpay.com/privacy">Privacy Policy</a
    >.
  </FieldDescription>
</div>
