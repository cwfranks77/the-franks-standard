<template>
  <div class="sell-page">
    <div class="container">
      <div class="sell-wrapper">
        <div class="sell-header text-center">
          <h1>Sell on The Franks Standard</h1>
          <p class="text-muted">List your authentic items. COA required — that's what makes us different.</p>
        </div>

        <form class="sell-form" @submit.prevent="submitListing">
          <!-- Item details -->
          <div class="form-section">
            <h2>Item Details</h2>

            <div class="form-group">
              <label class="label">Title</label>
              <input class="input" v-model="form.title" placeholder="e.g. 2023 Topps Chrome Shohei Ohtani PSA 10" required />
            </div>

            <div class="form-group">
              <label class="label">Description</label>
              <textarea class="textarea" v-model="form.description" rows="5" placeholder="Describe condition, history, and any details a buyer should know..." required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">Category</label>
                <select class="select" v-model="form.category" required>
                  <option value="">Select Category</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">Price ($)</label>
                <input class="input" type="number" min="1" step="0.01" v-model="form.price" placeholder="0.00" required />
              </div>
            </div>

            <div class="form-group">
              <label class="label">Condition</label>
              <select class="select" v-model="form.condition" required>
                <option value="">Select Condition</option>
                <option value="new">New / Sealed</option>
                <option value="like-new">Like New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <!-- Photos -->
          <div class="form-section">
            <h2>Photos</h2>
            <p class="text-muted mb-2">Upload clear photos of the item. First photo becomes the listing thumbnail.</p>
            <div class="photo-upload">
              <label class="photo-add">
                <input type="file" accept="image/*" multiple @change="handlePhotos" hidden />
                <span class="photo-add-icon">+</span>
                <span>Add Photos</span>
              </label>
              <div v-for="(photo, idx) in photoPreviews" :key="idx" class="photo-preview">
                <img :src="photo" alt="Preview" />
                <button type="button" class="photo-remove" @click="removePhoto(idx)">&times;</button>
              </div>
            </div>
          </div>

          <!-- COA Section -->
          <div class="form-section coa-section">
            <h2>Certificate of Authenticity</h2>
            <p class="text-muted mb-2">This is what sets The Franks Standard apart. Choose one:</p>

            <div class="coa-options">
              <label class="coa-option" :class="{ active: form.coaType === 'upload' }">
                <input type="radio" v-model="form.coaType" value="upload" name="coaType" />
                <div class="coa-option-content">
                  <h4>Upload a COA</h4>
                  <p>You have a physical or digital Certificate of Authenticity. Upload a photo or scan.</p>
                </div>
              </label>

              <label class="coa-option" :class="{ active: form.coaType === 'guarantee' }">
                <input type="radio" v-model="form.coaType" value="guarantee" name="coaType" />
                <div class="coa-option-content">
                  <h4>Sign The Franks Standard Guarantee</h4>
                  <p>You personally vouch for this item's authenticity. Your name, reputation, and account are on the line.</p>
                </div>
              </label>
            </div>

            <!-- Upload COA -->
            <div v-if="form.coaType === 'upload'" class="mt-3">
              <label class="label">Upload COA Document</label>
              <label class="photo-add" style="width: 100%; justify-content: center;">
                <input type="file" accept="image/*,.pdf" @change="handleCOA" hidden />
                <span class="photo-add-icon">📄</span>
                <span>{{ coaFileName || 'Choose COA file' }}</span>
              </label>
            </div>

            <!-- Sign Guarantee -->
            <div v-if="form.coaType === 'guarantee'" class="guarantee-box mt-3">
              <div class="guarantee-text">
                <p><strong>The Franks Standard Guarantee</strong></p>
                <p>I, <strong>{{ form.sellerName || '[Your Name]' }}</strong>, hereby certify that the item listed above is authentic, genuine, and accurately described. I understand that if this item is proven to be counterfeit or misrepresented, my account will be permanently banned from The Franks Standard and the buyer will receive a full refund.</p>
                <p>I am staking my name and reputation on this listing.</p>
              </div>
              <div class="form-group mt-2">
                <label class="label">Your Full Legal Name</label>
                <input class="input" v-model="form.sellerName" placeholder="Type your full name to sign" required />
              </div>
              <label class="guarantee-check">
                <input type="checkbox" v-model="form.guaranteeSigned" required />
                <span>I have read and agree to The Franks Standard Guarantee above. I understand this is legally binding.</span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
            List Item on The Franks Standard
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const categories = [
  'Sports Cards & Memorabilia',
  'Musical Instruments',
  'Firearms Accessories',
  'Coins & Currency',
  'Art & Antiques',
  'Watches & Jewelry',
  'Sneakers & Streetwear',
  'Vintage Electronics & Games',
]

const form = reactive({
  title: '',
  description: '',
  category: '',
  price: null,
  condition: '',
  coaType: '',
  sellerName: '',
  guaranteeSigned: false,
})

const photoPreviews = ref([])
const photoFiles = ref([])
const coaFile = ref(null)
const coaFileName = ref('')

function handlePhotos(e) {
  const files = Array.from(e.target.files)
  files.forEach((file) => {
    photoFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = (ev) => photoPreviews.value.push(ev.target.result)
    reader.readAsDataURL(file)
  })
}

function removePhoto(idx) {
  photoPreviews.value.splice(idx, 1)
  photoFiles.value.splice(idx, 1)
}

function handleCOA(e) {
  coaFile.value = e.target.files[0]
  coaFileName.value = coaFile.value?.name || ''
}

async function submitListing() {
  if (!form.coaType) {
    alert('You must provide a Certificate of Authenticity or sign The Franks Standard Guarantee.')
    return
  }
  if (form.coaType === 'guarantee' && !form.guaranteeSigned) {
    alert('You must sign The Franks Standard Guarantee to list this item.')
    return
  }
  // TODO: Upload to Supabase + create listing
  alert('Listing submitted! (Connect Supabase to go live)')
}
</script>

<style scoped>
.sell-page { padding: 40px 0; }
.sell-wrapper { max-width: 720px; margin: 0 auto; }
.sell-header { margin-bottom: 30px; }
.sell-header h1 { font-size: 2rem; }

.form-section {
  margin-bottom: 32px;
  padding: 28px;
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  background: var(--stone-900);
}
.form-section h2 {
  font-size: 1.2rem;
  margin-bottom: 16px;
  color: var(--gold);
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 500px) { .form-row { grid-template-columns: 1fr; } }

.photo-upload {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.photo-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 120px;
  height: 120px;
  border: 2px dashed var(--stone-600);
  border-radius: var(--radius);
  cursor: pointer;
  color: var(--stone-400);
  font-size: 0.85rem;
  transition: border-color 0.2s;
}
.photo-add:hover { border-color: var(--gold); color: var(--gold); }
.photo-add-icon { font-size: 2rem; }
.photo-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: var(--radius);
  overflow: hidden;
}
.photo-preview img { width: 100%; height: 100%; object-fit: cover; }
.photo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coa-section { border-color: var(--gold); border-width: 2px; }

.coa-options { display: flex; flex-direction: column; gap: 12px; }
.coa-option {
  display: flex;
  gap: 14px;
  padding: 18px;
  border: 2px solid var(--stone-700);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.coa-option.active {
  border-color: var(--gold);
  background: rgba(201, 168, 76, 0.05);
}
.coa-option input { margin-top: 3px; accent-color: var(--gold); }
.coa-option h4 { font-family: 'Inter', sans-serif; font-size: 1rem; margin-bottom: 4px; }
.coa-option p { font-size: 0.85rem; color: var(--stone-400); }

.guarantee-box {
  padding: 20px;
  background: rgba(201, 168, 76, 0.06);
  border: 1px solid rgba(201, 168, 76, 0.2);
  border-radius: var(--radius);
}
.guarantee-text {
  font-size: 0.9rem;
  color: var(--stone-300);
  line-height: 1.7;
}
.guarantee-text p { margin-bottom: 10px; }
.guarantee-check {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.85rem;
  color: var(--stone-300);
  cursor: pointer;
}
.guarantee-check input { margin-top: 3px; accent-color: var(--gold); }
</style>
