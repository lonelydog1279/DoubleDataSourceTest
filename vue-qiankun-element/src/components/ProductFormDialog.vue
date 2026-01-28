<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="Add New Product"
    width="500px"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="Product Name" prop="productName">
        <el-input v-model="form.productName" placeholder="Enter product name" />
      </el-form-item>
      <el-form-item label="Category" prop="category">
        <el-select v-model="form.category" placeholder="Select category" style="width: 100%">
          <el-option label="文具" value="文具" />
          <el-option label="工具" value="工具" />
          <el-option label="电子产品" value="电子产品" />
          <el-option label="日用品" value="日用品" />
        </el-select>
      </el-form-item>
      <el-form-item label="Price" prop="price">
        <el-input-number v-model="form.price" :precision="2" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="Stock" prop="stock">
        <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">Cancel</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">Submit</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { Product } from '@/types/defines'
import { addProduct } from '@/api/api'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submitting': []
  'success': [product: Product]
  'error': [message: string]
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive<Product>({
  productName: '',
  category: '',
  price: 0,
  stock: 1
})

const rules: FormRules = {
  productName: [{ required: true, message: 'Please enter product name', trigger: 'blur' }],
  category: [{ required: true, message: 'Please select category', trigger: 'change' }],
  price: [{ required: true, message: 'Please enter price', trigger: 'blur' }],
  stock: [{ required: true, message: 'Please enter stock', trigger: 'blur' }]
}

// Reset form when dialog opens
watch(() => props.visible, (newVal) => {
  if (newVal) {
    form.productName = ''
    form.category = ''
    form.price = 0
    form.stock = 1
    formRef.value?.clearValidate()
  }
})

const handleCancel = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      emit('submitting')
      try {
        const newProduct = await addProduct(form)
        ElMessage.success('Product added successfully')
        emit('update:visible', false)
        emit('success', newProduct)
      } catch (error) {
        console.error('Failed to add product:', error)
        ElMessage.error('Failed to add product')
        emit('error', 'Failed to add product')
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>
