<template>
  <div class="listing-page">
    <div class="container">
      <div class="listing-layout">
        <!-- Images -->
        <div class="listing-images">
          <div class="main-image">
            <img :src="listing.images[selectedImage]" :alt="listing.title" />
          </div>
          <div class="image-thumbs" v-if="listing.images.length > 1">
            <button
              v-for="(img, idx) in listing.images"
              :key="idx"
              class="thumb"
              :class="{ active: idx === selectedImage }"
              @click="selectedImage = idx"
            >
              <img :src="img" alt="" />
            </button>
          </div>
        </div>

        <!-- Details -->
        <div class="listing-details">
          <span class="badge badge-gold">{{ listing.category }}</span>
          <h1>{{ listing.title }}</h1>

          <div class="listing-coa-box">
            <span class="coa-badge">{{ listing.coaType === 'upload' ? 'COA Document Verified' : 'Franks Standard Guarantee' }}</span>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 6px;">
              {{ listing.coaType === 'upload'
                ? 'Seller provided a Certificate of Authenticity document.'
                : `Seller ${listing.sellerName} personally guarantees this item's authenticity.`
              }}
            </p>
          </div>

          <div class="listing-price-row">
            <span class="listing-price">${{ listing.price.toLocaleString() }}</span>
            <span class="listing-condition badge badge-gold">{{ listing.condition }}</span>
          </div>

          <div class="listing-actions">
            <button class="btn btn-primary btn-lg" style="flex: 1;">Buy Now</button>
            <button class="btn btn-outline btn-lg">Message Seller</button>
          </div>

          <div class="listing-description mt-3">
            <h3>Description</h3>
            <p>{{ listing.description }}</p>
          </div>

          <div class="seller-info mt-3">
            <h3>Seller</h3>
            <div class="seller-card">
              <div class="seller-avatar">{{ listing.sellerName.charAt(0) }}</div>
              <div>
                <p class="seller-name">{{ listing.sellerName }}</p>
                <p class="text-muted" style="font-size: 0.8rem;">Member since {{ listing.sellerJoined }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const selectedImage = ref(0)

// TODO: Fetch from Supabase using route.params.id
const listing = reactive({
  id: route.params.id,
  title: 'Sample Authenticated Listing',
  category: 'Sports Cards & Memorabilia',
  price: 499.99,
  condition: 'Excellent',
  description: 'This is a placeholder listing. When Supabase is connected, real listings will appear here with full details, photos, and COA information.',
  images: ['/placeholder.jpg'],
  coaType: 'guarantee',
  sellerName: 'Charles Franks',
  sellerJoined: 'April 2026',
})
</script>

<style scoped>
.listing-page { padding: 40px 0; }
.listing-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }

.main-image {
  aspect-ratio: 1;
  background: var(--stone-900);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--stone-800);
}
.main-image img { width: 100%; height: 100%; object-fit: cover; }
.image-thumbs { display: flex; gap: 8px; margin-top: 10px; }
.thumb {
  width: 70px;
  height: 70px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 2px solid var(--stone-700);
  cursor: pointer;
  background: none;
  padding: 0;
}
.thumb.active { border-color: var(--gold); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.listing-details h1 { font-size: 1.6rem; margin: 12px 0 16px; }
.listing-coa-box {
  padding: 14px;
  background: rgba(46, 204, 113, 0.06);
  border: 1px solid rgba(46, 204, 113, 0.2);
  border-radius: var(--radius);
  margin-bottom: 20px;
}
.listing-price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.listing-price { font-size: 2rem; font-weight: 700; color: var(--gold); font-family: 'Cinzel', serif; }
.listing-actions { display: flex; gap: 12px; }
.listing-description h3, .seller-info h3 {
  font-size: 1rem;
  margin-bottom: 8px;
  color: var(--gold);
}
.listing-description p { color: var(--stone-300); font-size: 0.9rem; line-height: 1.7; }
.seller-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--stone-900);
  border: 1px solid var(--stone-800);
  border-radius: var(--radius);
}
.seller-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--stone-950);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.2rem;
}
.seller-name { font-weight: 600; }

@media (max-width: 768px) {
  .listing-layout { grid-template-columns: 1fr; }
}
</style>
