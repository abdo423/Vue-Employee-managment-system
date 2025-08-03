
<template>
  <div class="card flex justify-center align-items-center h-screen text-blue-400">
    <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit" class="flex flex-col gap-4 w-full sm:w-64">
      <div class="flex flex-col gap-1">
        <Password name="password" placeholder="Password" :feedback="false" fluid />
        <template v-if="$form.password?.invalid">
          <Message v-for="(error, index) of $form.password.errors" :key="index" severity="error" size="small" variant="simple">{{ error.message }}</Message>
        </template>
      </div>
      <Button type="submit" severity="secondary" label="Submit" />
    </Form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from "primevue/usetoast";
import { z } from 'zod';
import Password from 'primevue/password'
import Message from 'primevue/message'
import Button from 'primevue/button'
import {Form} from '@primevue/forms'
// import Password from 'primevue/password';
// import Message from 'primevue/message';
// import Button from 'primevue/button';
const toast = useToast();
const initialValues = ref({
  password: ''
});
const resolver = ref(zodResolver(
  z.object({
    password: z
      .string()
      .min(3, { message: 'Minimum 3 characters.' })
      .max(8, { message: 'Maximum 8 characters.' })
      .refine((value) => /[a-z]/.test(value), {
        message: 'Must have a lowercase letter.'
      })
      .refine((value) => /[A-Z]/.test(value), {
        message: 'Must have an uppercase letter.'
      })
      .refine((value) => /d/.test(value), {
        message: 'Must have a number.'
      })
  })
));

const onFormSubmit = ({ valid }) => {
  if (valid) {
    toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
  }
};
</script>
