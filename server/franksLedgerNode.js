// STRICT RULE: This is a 100% self-contained server module for The Franks Standard LLC.
// This file tracks used antiques, collectibles, and precious gold weights.
// It is completely isolated and cannot touch or interact with the B&C Audio codebase.
// DO NOT MODIFY OR TOUCH ANY OTHER FILES IN THIS REPOSITORY.

import fs from 'fs';

export class FranksStandardAssetNode {
  constructor() {
    this.antiquesLedgerPath = './src/content/franks-antiques-inventory.json';
    this.financialBookkeepingPath = './src/content/franks-corporate-ledger.json';
    this.laStateSecondhandTaxRate = 0.0445; // Strict Louisiana Sales Tax Base (4.45%)
  }

  /**
   * ➕ ACQUISITION ENTRY: Logs used items and antiques right as you purchase them.
   * Automatically calculates your custom retail target price based on used item tiers.
   */
  logPurchasedAsset(assetId, name, itemType, itemAcquisitionCost, itemWeightOunces = 0, description = '') {
    let targetMarkup = 2.0; // Default 2.0x (100%) margin for standard vintage collectibles & used furniture
    const typeLower = itemType.toLowerCase();

    if (typeLower.includes('gold') || typeLower.includes('precious') || typeLower.includes('metal')) {
      targetMarkup = 1.30; // 30% margin lock for high-liquidity precious metal weight classes
    } else if (typeLower.includes('rare') || typeLower.includes('fine antique')) {
      targetMarkup = 2.50; // 2.5x margin for rare, long-hold historical estate finds
    }

    const calculatedRetailTarget = (itemAcquisitionCost * targetMarkup).toFixed(2);

    const assetEntry = {
      assetId: assetId.toUpperCase(),
      name: name,
      type: itemType, 
      weightOunces: itemWeightOunces, 
      acquisitionCost: itemAcquisitionCost.toFixed(2),
      retailPrice: calculatedRetailTarget,
      description: description,
      status: 'IN_STOCK',
      dateAcquired: new Date().toISOString().substring(0, 10)
    };

    let inventory = [];
    if (fs.existsSync(this.antiquesLedgerPath)) {
      inventory = JSON.parse(fs.readFileSync(this.antiquesLedgerPath, 'utf8'));
    }
    inventory.push(assetEntry);
    fs.writeFileSync(this.antiquesLedgerPath, JSON.stringify(inventory, null, 2));

    console.log(`[✓] FRANKS STANDARD: Asset ${assetId} logged. Retail target set to $${calculatedRetailTarget}.`);
    return assetEntry;
  }

  /**
   * 🛒 AUTOMATED SOLD HANDLER: Triggered when an antique or gold item sells.
   * Changes status to SOLD, removes it from stock display, and logs itemized profit vs purchase.
   */
  processAssetSale(assetId) {
    if (!fs.existsSync(this.antiquesLedgerPath)) return null;
    const inventory = JSON.parse(fs.readFileSync(this.antiquesLedgerPath, 'utf8'));
    
    const asset = inventory.find(a => a.assetId === assetId.toUpperCase() && a.status === 'IN_STOCK');
    if (!asset) {
      console.log(`[❌] ERROR: Asset ${assetId} is not in stock or already marked sold.`);
      return null;
    }

    asset.status = 'SOLD';
    fs.writeFileSync(this.antiquesLedgerPath, JSON.stringify(inventory, null, 2));

    const costPrice = parseFloat(asset.acquisitionCost);
    const salePrice = parseFloat(asset.retailPrice);
    const calculatedSalesTax = (salePrice * this.laStateSecondhandTaxRate).toFixed(2);
    const totalBankDeposit = (salePrice + parseFloat(calculatedSalesTax)).toFixed(2);
    const trueNetProfit = (salePrice - costPrice).toFixed(2);

    const transactionRow = {
      timestamp: new Date().toISOString(),
      assetId: assetId.toUpperCase(),
      itemName: asset.name,
      itemType: asset.type,
      purchasePrice: asset.acquisitionCost,
      soldPrice: asset.retailPrice,
      salesTaxAdded: calculatedSalesTax,
      totalBankDeposit: totalBankDeposit,
      netProfitEarned: trueNetProfit,
      bankReconciled: 'PENDING_MATCH'
    };

    let financials = [];
    if (fs.existsSync(this.financialBookkeepingPath)) {
      financials = JSON.parse(fs.readFileSync(this.financialBookkeepingPath, 'utf8'));
    }
    financials.unshift(transactionRow);
    fs.writeFileSync(this.financialBookkeepingPath, JSON.stringify(financials, null, 2));

    console.log(`[✓] FRANKS STANDARD SALE: Posted transaction for ${assetId}. Profit: +$${trueNetProfit}.`);
    return transactionRow;
  }

  /**
   * 🏦 LIVE BANK RECONCILIATION LOOP: Connects to your bank statements.
   * Matches live cleared deposits straight against your recorded transaction ledger rows.
   */
  reconcileIncomingDeposit(clearedAmount, bankReferenceToken) {
    if (!fs.existsSync(this.financialBookkeepingPath)) return;
    const financials = JSON.parse(fs.readFileSync(this.financialBookkeepingPath, 'utf8'));

    const matchingTx = financials.find(f => parseFloat(f.totalBankDeposit) === parseFloat(clearedAmount) && f.bankReconciled === 'PENDING_MATCH');
    
    if (matchingTx) {
      matchingTx.bankReconciled = 'VERIFIED_AND_SETTLED';
      matchingTx.bankToken = bankReferenceToken;
      fs.writeFileSync(this.financialBookkeepingPath, JSON.stringify(financials, null, 2));
      console.log(`[✓] FRANKS BANK FEED SYNC: Transaction matched perfectly for asset ${matchingTx.assetId}. Bookkeeping settled.`);
    } else {
      console.log(`[!] FEED NOTICE: Incoming deposit ($${clearedAmount}) did not match a pending transaction row.`);
    }
  }
}
