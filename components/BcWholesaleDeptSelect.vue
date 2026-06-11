<script setup>
const departments = [
  { label: 'Computers & Workstations', category: 'Computers & Computer Accessories' },
  { label: 'Home Theater & Audio', category: 'Home Audio & Theater' },
  { label: 'Marine & Powersports', category: 'Marine Electronics' },
  { label: 'Automotive Electronics', category: 'Automotive Electronics' },
  { label: 'Amplifiers & Subwoofers', category: 'Amplifiers' },
]

const selected = ref('')

function onPick () {
  const dept = departments.find((d) => d.category === selected.value)
  if (!dept) return
  navigateTo(`/bc-audio/catalog?category=${encodeURIComponent(dept.category)}`)
  selected.value = ''
}
</script>

<template>
  <label class="bc-dept">
    <span class="bc-dept__sr">Wholesale catalog department</span>
    <select
      v-model="selected"
      class="bc-dept__select"
      @change="onPick"
    >
      <option value="" disabled selected>Wholesale departments</option>
      <option
        v-for="dept in departments"
        :key="dept.category"
        :value="dept.category"
      >
        {{ dept.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.bc-dept { display: block; }
.bc-dept__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
.bc-dept__select {
  max-width: 11rem;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #121216;
  color: #f5f5f7;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}
.bc-dept__select:focus {
  outline: none;
  border-color: rgba(211, 47, 47, 0.55);
}
@media (max-width: 480px) {
  .bc-dept__select { max-width: 9rem; font-size: 0.68rem; }
}
</style>
