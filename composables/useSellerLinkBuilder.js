import { buildSellerRowsFromPaste, SELLER_LINK_BUILD_STAMP } from '~/utils/sellerLinkParse.js'

export function useSellerLinkBuilder () {
  const rawList = ref('')
  const rows = ref([])
  const status = ref('')
  const statusKind = ref('')
  const lastClickAt = ref(0)

  function buildFromText (text) {
    lastClickAt.value = Date.now()
    status.value = ''
    statusKind.value = ''
    try {
      rows.value = buildSellerRowsFromPaste(text)
      if (rows.value.length) {
        statusKind.value = 'ok'
        status.value = `Built ${rows.value.length} seller link${rows.value.length === 1 ? '' : 's'} — use the gold Google buttons below.`
      } else {
        statusKind.value = 'warn'
        status.value =
          'No seller found in that paste. Use a store link (ebay.com/str/name), profile (ebay.com/usr/name), or the username alone — e.g. microbaycoins.'
      }
    } catch (err) {
      console.error('[seller-links]', err)
      rows.value = []
      statusKind.value = 'err'
      status.value = `Something went wrong (${err?.message || 'unknown'}). Try refreshing the page (Ctrl+F5).`
    }
  }

  return {
    BUILD_STAMP: SELLER_LINK_BUILD_STAMP,
    rawList,
    rows,
    status,
    statusKind,
    lastClickAt,
    buildFromText,
  }
}
