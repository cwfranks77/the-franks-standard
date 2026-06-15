import { buildSellerRowsFromPaste } from '~/utils/sellerLinkParse.js'

export function parseSellerUsernameList (text) {
  return buildSellerRowsFromPaste(text)
}
