<template>
  <el-dialog
      :model-value="visible"
      @update:model-value="$emit('update:visible', $event)"
      title="Add New Product"
      width="500px"
  >
    <template #footer>
      <el-button @click="handleCancel">Cancel</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">Submit</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";

const props = defineProps<{
  visible: boolean
}>()

watch(() => props.visible, (newVal) => {
  if (newVal) {
  }
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submitting': [message : string, message1: string]
  'success': []
  'error': [message: string]
}>()

const submitting = ref(false)


const handleCancel = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {

  emit('submitting',"1","2")
  emit('update:visible', false)
  emit('success')

}
</script>
