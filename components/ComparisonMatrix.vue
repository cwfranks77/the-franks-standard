<template>
  <div class="matrix-wrap">
    <table class="matrix">
      <thead>
        <tr>
          <th scope="col" class="topic">{{ topicHeader }}</th>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            :class="{ 'tfs-col': col.highlight }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row[rowKey]">
          <th scope="row" class="row-label">{{ row[rowKey] }}</th>
          <td v-for="col in columns" :key="col.key">
            <span :class="{ 'tfs-cell': col.highlight }">{{ row[col.key] }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  rowKey: { type: String, default: 'label' },
  topicHeader: { type: String, default: 'Topic' },
})
</script>

<style scoped>
.matrix-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius-lg);
  border: 1px solid var(--stone-800);
}
.matrix {
  width: 100%;
  min-width: 880px;
  border-collapse: separate;
  border-spacing: 0;
}
.matrix th,
.matrix td {
  padding: 14px 16px;
  font-size: 0.86rem;
  line-height: 1.45;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid #d7dde6;
  color: #374151;
}
.matrix thead th {
  background: #181d25;
  color: #f3f4f6;
  font-family: 'Cinzel', serif;
  font-size: 0.82rem;
}
.topic { width: 16%; min-width: 120px; }
.tfs-col { color: var(--gold); }
.row-label { color: #111827; font-weight: 700; }
.tfs-cell { color: #0d8a43; font-weight: 700; }
@media (max-width: 900px) {
  .matrix { min-width: 720px; }
}
</style>
