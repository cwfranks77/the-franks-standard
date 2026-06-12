# =======================================================
#  VANTAGE SHIELD - Small Business Accounting Engine
#  (c) 2026 The Franks Standard LLC - All Rights Reserved
#  Louisiana destination-based sales tax + income reserves
# =======================================================

import os
import sys
import json
import csv
import hmac
import base64
import shutil
import hashlib
import datetime
import uuid
from decimal import Decimal, ROUND_HALF_UP

APP_NAME = "Vantage Shield"
APP_VERSION = "1.0.0"
DB_FILE = "vantage_shield_db.json"
LICENSE_FILE = "vantage_license.json"
BACKUP_DIR = "vantage_backups"

# License verification secret (signature check only - keygen stays with the owner)
_LICENSE_SECRET = b"VS-FRANKS-STANDARD-2026-SIGNING-KEY-v1"

CENTS = Decimal("0.01")


def money(value) -> Decimal:
    """Exact money math - no floating point drift like spreadsheets have."""
    return Decimal(str(value)).quantize(CENTS, rounding=ROUND_HALF_UP)


# =======================================================
#  LOUISIANA TAX ENGINE (destination-based, Act 22)
#  Tax is owed where the BUYER takes delivery.
# =======================================================
class LouisianaTaxEngine:
    STATE_RATE = Decimal("0.0500")  # 5% Louisiana state sales tax

    # Local (parish) rates - editable as parishes change rates
    PARISH_RATES = {
        "Jefferson": Decimal("0.0475"),
        "Orleans": Decimal("0.0500"),
        "Lafayette": Decimal("0.0445"),
        "East Baton Rouge": Decimal("0.0550"),
        "Ouachita": Decimal("0.0599"),
        "St. Tammany": Decimal("0.0475"),
        "Caddo": Decimal("0.0460"),
        "Calcasieu": Decimal("0.0575"),
        "Tangipahoa": Decimal("0.0450"),
        "Rapides": Decimal("0.0450"),
        "Terrebonne": Decimal("0.0550"),
        "Bossier": Decimal("0.0500"),
        "Livingston": Decimal("0.0500"),
        "Ascension": Decimal("0.0500"),
        "St. Landry": Decimal("0.0555"),
        "Iberia": Decimal("0.0500"),
        "Vernon": Decimal("0.0450"),
        "Webster": Decimal("0.0500"),
    }
    DEFAULT_LOCAL_RATE = Decimal("0.0500")  # used when parish unknown

    # Louisiana zip ranges -> parish (major population areas)
    ZIP_TO_PARISH = [
        ((70001, 70098), "Jefferson"),      # Metairie/Kenner/Gretna
        ((70112, 70131), "Orleans"),        # New Orleans
        ((70401, 70404), "Tangipahoa"),     # Hammond
        ((70420, 70471), "St. Tammany"),    # Covington/Slidell/Mandeville
        ((70501, 70509), "Lafayette"),      # Lafayette
        ((70560, 70563), "Iberia"),         # New Iberia
        ((70570, 70571), "St. Landry"),     # Opelousas
        ((70601, 70616), "Calcasieu"),      # Lake Charles
        ((70360, 70364), "Terrebonne"),     # Houma
        ((70706, 70706), "Livingston"),     # Denham Springs
        ((70726, 70727), "Livingston"),
        ((70737, 70738), "Ascension"),      # Gonzales
        ((70801, 70836), "East Baton Rouge"),
        ((71001, 71001), "Webster"),
        ((71101, 71129), "Caddo"),          # Shreveport
        ((71111, 71113), "Bossier"),        # Bossier City
        ((71201, 71212), "Ouachita"),       # Monroe
        ((71301, 71309), "Rapides"),        # Alexandria
        ((71446, 71446), "Vernon"),         # Leesville
    ]

    @classmethod
    def parish_from_zip(cls, zip_code: str):
        digits = "".join(c for c in str(zip_code) if c.isdigit())[:5]
        if len(digits) != 5:
            return None
        z = int(digits)
        if not (70000 <= z <= 71499):
            return "OUT_OF_STATE"
        for (lo, hi), parish in cls.ZIP_TO_PARISH:
            if lo <= z <= hi:
                return parish
        return None  # LA zip, parish unknown -> default local rate

    @classmethod
    def rate_for(cls, parish):
        if parish == "OUT_OF_STATE":
            return Decimal("0")
        local = cls.PARISH_RATES.get(parish, cls.DEFAULT_LOCAL_RATE)
        return cls.STATE_RATE + local

    @classmethod
    def tax_for_sale(cls, amount, ship_zip):
        """Returns (parish, combined_rate, tax_due) from the SHIPPING zip."""
        parish = cls.parish_from_zip(ship_zip)
        rate = cls.rate_for(parish)
        tax = money(money(amount) * rate)
        return parish or "Unknown-LA", rate, tax


# =======================================================
#  LICENSING (for selling copies)
# =======================================================
def _license_signature(payload: str) -> str:
    sig = hmac.new(_LICENSE_SECRET, payload.encode(), hashlib.sha256).hexdigest()
    return sig[:12].upper()


def verify_license_key(name: str, key: str):
    """Key format: VS-<base32(name|expiry)>-<sig>. Returns (ok, expiry_or_reason)."""
    try:
        parts = key.strip().split("-")
        if len(parts) != 3 or parts[0] != "VS":
            return False, "Bad key format"
        payload_b32, sig = parts[1], parts[2]
        pad = "=" * (-len(payload_b32) % 8)
        payload = base64.b32decode(payload_b32 + pad).decode()
        if _license_signature(payload) != sig.upper():
            return False, "Signature mismatch"
        key_name, expiry = payload.split("|")
        if key_name.strip().lower() != name.strip().lower():
            return False, "Name does not match key"
        exp_date = datetime.date.fromisoformat(expiry)
        if exp_date < datetime.date.today():
            return False, f"License expired {expiry}"
        return True, expiry
    except Exception:
        return False, "Unreadable key"


def load_license():
    if os.path.exists(LICENSE_FILE):
        try:
            with open(LICENSE_FILE) as f:
                lic = json.load(f)
            ok, info = verify_license_key(lic.get("name", ""), lic.get("key", ""))
            if ok:
                return {"licensed": True, "name": lic["name"], "expires": info}
        except Exception:
            pass
    return {"licensed": False, "name": "TRIAL", "expires": None}


def activate_license():
    print("\n--- Activate Vantage Shield ---")
    name = input("Licensed name (as on your receipt): ").strip()
    key = input("License key: ").strip()
    ok, info = verify_license_key(name, key)
    if ok:
        with open(LICENSE_FILE, "w") as f:
            json.dump({"name": name, "key": key}, f, indent=2)
        print(f"[OK] Licensed to {name} until {info}.")
    else:
        print(f"[!] Activation failed: {info}")


# =======================================================
#  CORE ENGINE
# =======================================================
class VantageShieldEngine:
    INCOME_RESERVE_RATE = Decimal("0.25")  # 25% income tax cushion

    def __init__(self, data_file: str = DB_FILE):
        self.data_file = data_file
        self.tenants = ["BC_AUDIO", "FRANKS_STANDARD"]
        self.db = self._load()

    def _blank_tenant(self):
        return {"transactions": [], "inventory": [], "balance": "0.00"}

    def _load(self):
        if os.path.exists(self.data_file):
            with open(self.data_file) as f:
                db = json.load(f)
        else:
            db = {}
        for t in self.tenants:
            db.setdefault(t, self._blank_tenant())
            db[t].setdefault("transactions", [])
            db[t].setdefault("inventory", [])
            db[t].setdefault("balance", "0.00")
        return db

    def save(self):
        with open(self.data_file, "w") as f:
            json.dump(self.db, f, indent=2, default=str)

    def backup(self):
        os.makedirs(BACKUP_DIR, exist_ok=True)
        stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
        dest = os.path.join(BACKUP_DIR, f"vantage-db-{stamp}.json")
        shutil.copy2(self.data_file, dest)
        return dest

    # ---------------- Transactions ----------------
    def add_sale(self, tenant, item, cost, sold, ship_zip, shipping_charged="0", notes=""):
        if tenant not in self.tenants:
            raise ValueError(f"Unknown tenant {tenant}")
        cost, sold = money(cost), money(sold)
        shipping_charged = money(shipping_charged)
        parish, rate, tax = LouisianaTaxEngine.tax_for_sale(sold, ship_zip)
        gross_profit = sold + shipping_charged - cost
        reserve = money(gross_profit * self.INCOME_RESERVE_RATE) if gross_profit > 0 else money(0)
        net_after_reserve = money(gross_profit - reserve)

        entry = {
            "id": str(uuid.uuid4())[:8],
            "type": "SALE",
            "date": datetime.datetime.now().isoformat(timespec="seconds"),
            "item": item,
            "cost_basis": str(cost),
            "sale_price": str(sold),
            "shipping_charged": str(shipping_charged),
            "ship_zip": str(ship_zip),
            "parish": parish,
            "tax_rate": str(rate),
            "tax_collected": str(tax),       # hold for LaTAP - buyer paid this on top
            "gross_profit": str(gross_profit),
            "income_reserve_25pct": str(reserve),
            "net_after_reserve": str(net_after_reserve),
            "notes": notes,
        }
        self.db[tenant]["transactions"].append(entry)
        bal = money(self.db[tenant]["balance"]) + net_after_reserve
        self.db[tenant]["balance"] = str(bal)
        self.save()
        return entry

    def add_expense(self, tenant, item, amount, category="General", notes=""):
        amount = money(amount)
        entry = {
            "id": str(uuid.uuid4())[:8],
            "type": "EXPENSE",
            "date": datetime.datetime.now().isoformat(timespec="seconds"),
            "item": item,
            "category": category,
            "amount": str(amount),
            "notes": notes,
        }
        self.db[tenant]["transactions"].append(entry)
        bal = money(self.db[tenant]["balance"]) - amount
        self.db[tenant]["balance"] = str(bal)
        self.save()
        return entry

    def add_refund(self, tenant, sale_id, notes=""):
        for tx in self.db[tenant]["transactions"]:
            if tx["id"] == sale_id and tx["type"] == "SALE":
                refund_amt = money(tx["sale_price"]) + money(tx.get("shipping_charged", "0"))
                entry = {
                    "id": str(uuid.uuid4())[:8],
                    "type": "REFUND",
                    "date": datetime.datetime.now().isoformat(timespec="seconds"),
                    "item": f"REFUND: {tx['item']}",
                    "refunded_sale_id": sale_id,
                    "amount": str(refund_amt),
                    "tax_returned": tx["tax_collected"],
                    "notes": notes,
                }
                self.db[tenant]["transactions"].append(entry)
                bal = money(self.db[tenant]["balance"]) - money(tx["net_after_reserve"])
                self.db[tenant]["balance"] = str(bal)
                self.save()
                return entry
        raise ValueError(f"Sale id {sale_id} not found")

    # ---------------- Inventory ----------------
    def add_inventory(self, tenant, item, cost, qty=1, notes=""):
        entry = {
            "id": str(uuid.uuid4())[:8],
            "item": item,
            "cost_each": str(money(cost)),
            "qty": int(qty),
            "added": datetime.datetime.now().isoformat(timespec="seconds"),
            "notes": notes,
        }
        self.db[tenant]["inventory"].append(entry)
        self.save()
        return entry

    def sell_from_inventory(self, tenant, inv_id, sold, ship_zip, shipping_charged="0", notes=""):
        for item in self.db[tenant]["inventory"]:
            if item["id"] == inv_id and item["qty"] > 0:
                item["qty"] -= 1
                sale = self.add_sale(tenant, item["item"], item["cost_each"], sold,
                                     ship_zip, shipping_charged, notes)
                self.save()
                return sale
        raise ValueError(f"Inventory id {inv_id} not found or out of stock")

    # ---------------- Reports ----------------
    def report_summary(self, tenant, month=None):
        """month format: '2026-06' or None for all-time."""
        txs = self.db[tenant]["transactions"]
        if month:
            txs = [t for t in txs if t["date"].startswith(month)]
        revenue = sum((money(t["sale_price"]) + money(t.get("shipping_charged", "0"))
                       for t in txs if t["type"] == "SALE"), money(0))
        cogs = sum((money(t["cost_basis"]) for t in txs if t["type"] == "SALE"), money(0))
        expenses = sum((money(t["amount"]) for t in txs if t["type"] == "EXPENSE"), money(0))
        refunds = sum((money(t["amount"]) for t in txs if t["type"] == "REFUND"), money(0))
        tax_held = sum((money(t["tax_collected"]) for t in txs if t["type"] == "SALE"), money(0))
        tax_returned = sum((money(t.get("tax_returned", "0")) for t in txs if t["type"] == "REFUND"), money(0))
        reserve = sum((money(t["income_reserve_25pct"]) for t in txs if t["type"] == "SALE"), money(0))
        profit = money(revenue - cogs - expenses - refunds)
        return {
            "period": month or "ALL TIME",
            "gross_revenue": revenue,
            "cost_of_goods": cogs,
            "expenses": expenses,
            "refunds": refunds,
            "net_profit": profit,
            "sales_tax_to_remit": money(tax_held - tax_returned),
            "income_reserve_set_aside": reserve,
            "keep_after_reserves": money(profit - reserve),
            "sale_count": sum(1 for t in txs if t["type"] == "SALE"),
        }

    def report_tax_by_parish(self, tenant, month=None):
        """LaTAP filing helper - tax owed broken out by destination parish."""
        txs = [t for t in self.db[tenant]["transactions"] if t["type"] == "SALE"]
        if month:
            txs = [t for t in txs if t["date"].startswith(month)]
        by_parish = {}
        for t in txs:
            p = t["parish"]
            row = by_parish.setdefault(p, {"taxable_sales": money(0), "tax": money(0), "count": 0})
            row["taxable_sales"] += money(t["sale_price"])
            row["tax"] += money(t["tax_collected"])
            row["count"] += 1
        return by_parish

    # ---------------- Exports ----------------
    def export_transactions_csv(self, tenant, path=None):
        path = path or f"vantage-{tenant.lower()}-transactions.csv"
        txs = self.db[tenant]["transactions"]
        fields = ["id", "type", "date", "item", "cost_basis", "sale_price", "shipping_charged",
                  "ship_zip", "parish", "tax_rate", "tax_collected", "gross_profit",
                  "income_reserve_25pct", "net_after_reserve", "category", "amount",
                  "refunded_sale_id", "tax_returned", "notes"]
        with open(path, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            w.writeheader()
            for t in txs:
                w.writerow(t)
        return path

    def export_tax_report_csv(self, tenant, month=None, path=None):
        path = path or f"vantage-{tenant.lower()}-tax-report.csv"
        data = self.report_tax_by_parish(tenant, month)
        with open(path, "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["Parish", "Taxable Sales", "Tax To Remit", "Sale Count"])
            for parish, row in sorted(data.items()):
                w.writerow([parish, row["taxable_sales"], row["tax"], row["count"]])
        return path

    # ---------------- Receipts ----------------
    def receipt_text(self, tenant, sale_id, business_name=None):
        names = {"BC_AUDIO": "B&C Performance Audio LLC",
                 "FRANKS_STANDARD": "The Franks Standard LLC"}
        for t in self.db[tenant]["transactions"]:
            if t["id"] == sale_id and t["type"] == "SALE":
                biz = business_name or names.get(tenant, tenant)
                total = money(t["sale_price"]) + money(t["tax_collected"]) + money(t.get("shipping_charged", "0"))
                lines = [
                    "=" * 44,
                    f"  {biz}",
                    "=" * 44,
                    f"  Receipt #: {t['id']}",
                    f"  Date:      {t['date']}",
                    "-" * 44,
                    f"  Item:      {t['item']}",
                    f"  Price:     ${t['sale_price']}",
                    f"  Shipping:  ${t.get('shipping_charged', '0.00')}",
                    f"  Sales tax: ${t['tax_collected']}  ({t['parish']})",
                    "-" * 44,
                    f"  TOTAL:     ${total}",
                    "=" * 44,
                    "  Thank you for your business!",
                ]
                return "\n".join(lines)
        raise ValueError(f"Sale {sale_id} not found")


# =======================================================
#  INTERACTIVE MENU
# =======================================================
def pick_tenant():
    print("\n  1) B&C Performance Audio")
    print("  2) The Franks Standard")
    c = input("  Which business? (1/2): ").strip()
    return "BC_AUDIO" if c == "1" else "FRANKS_STANDARD"


def print_summary(s):
    print(f"\n===== SUMMARY ({s['period']}) =====")
    print(f"  Sales count:            {s['sale_count']}")
    print(f"  Gross revenue:          ${s['gross_revenue']}")
    print(f"  Cost of goods:          ${s['cost_of_goods']}")
    print(f"  Expenses:               ${s['expenses']}")
    print(f"  Refunds:                ${s['refunds']}")
    print(f"  NET PROFIT:             ${s['net_profit']}")
    print(f"  --- Money to set aside ---")
    print(f"  Sales tax to remit:     ${s['sales_tax_to_remit']}   (LaTAP)")
    print(f"  25% income reserve:     ${s['income_reserve_set_aside']}")
    print(f"  YOURS TO KEEP:          ${s['keep_after_reserves']}")


def main_menu():
    lic = load_license()
    engine = VantageShieldEngine()
    tag = f"Licensed to {lic['name']}" if lic["licensed"] else "UNLICENSED TRIAL"
    print(f"\n{'=' * 50}\n  {APP_NAME} v{APP_VERSION}  -  {tag}\n{'=' * 50}")

    while True:
        print("\n  1) Add a sale          5) Monthly summary")
        print("  2) Add an expense      6) Tax report (by parish)")
        print("  3) Add inventory       7) Export CSV files")
        print("  4) All-time summary    8) Print a receipt")
        print("  9) Backup database     A) Activate license")
        print("  0) Exit")
        choice = input("\n  Choose: ").strip().lower()

        try:
            if choice == "1":
                t = pick_tenant()
                item = input("  Item name: ").strip()
                cost = input("  Your cost $: ").strip()
                sold = input("  Sold for $: ").strip()
                zipc = input("  Buyer SHIPPING zip code: ").strip()
                ship = input("  Shipping charged $ (0 if none): ").strip() or "0"
                e = engine.add_sale(t, item, cost, sold, zipc, ship)
                print(f"\n  [OK] Sale logged (id {e['id']})")
                print(f"  Parish: {e['parish']} | Tax collected: ${e['tax_collected']}")
                print(f"  Set aside 25%: ${e['income_reserve_25pct']} | Keep: ${e['net_after_reserve']}")
            elif choice == "2":
                t = pick_tenant()
                item = input("  Expense description: ").strip()
                amt = input("  Amount $: ").strip()
                cat = input("  Category (Supplies/Fees/Shipping/General): ").strip() or "General"
                engine.add_expense(t, item, amt, cat)
                print("  [OK] Expense logged.")
            elif choice == "3":
                t = pick_tenant()
                item = input("  Item name: ").strip()
                cost = input("  Cost each $: ").strip()
                qty = input("  Quantity: ").strip() or "1"
                e = engine.add_inventory(t, item, cost, qty)
                print(f"  [OK] Inventory added (id {e['id']})")
            elif choice == "4":
                t = pick_tenant()
                print_summary(engine.report_summary(t))
            elif choice == "5":
                t = pick_tenant()
                m = input("  Month (like 2026-06): ").strip()
                print_summary(engine.report_summary(t, m))
            elif choice == "6":
                t = pick_tenant()
                m = input("  Month (blank = all time): ").strip() or None
                data = engine.report_tax_by_parish(t, m)
                print("\n  Parish              Taxable      Tax owed")
                for parish, row in sorted(data.items()):
                    print(f"  {parish:<18} ${row['taxable_sales']:>9}   ${row['tax']:>8}")
            elif choice == "7":
                t = pick_tenant()
                p1 = engine.export_transactions_csv(t)
                p2 = engine.export_tax_report_csv(t)
                print(f"  [OK] Saved {p1}\n  [OK] Saved {p2}")
            elif choice == "8":
                t = pick_tenant()
                sid = input("  Sale id: ").strip()
                print("\n" + engine.receipt_text(t, sid))
            elif choice == "9":
                print(f"  [OK] Backup saved: {engine.backup()}")
            elif choice == "a":
                activate_license()
            elif choice == "0":
                print("  Goodbye.")
                break
            else:
                print("  Pick a number from the menu.")
        except Exception as ex:
            print(f"  [!] {ex}")


# =======================================================
#  SELF-TEST (run: python vantage_shield.py --test)
# =======================================================
def run_self_test():
    test_db = "vantage_test_db.json"
    if os.path.exists(test_db):
        os.remove(test_db)
    e = VantageShieldEngine(test_db)
    failures = []

    def check(label, got, want):
        if str(got) != str(want):
            failures.append(f"{label}: got {got}, wanted {want}")
        else:
            print(f"  [OK] {label} = {got}")

    # Sale to Metairie (Jefferson 70005): 9.75% on $899 = $87.65
    s1 = e.add_sale("BC_AUDIO", "Marine Audio Bundle", 450, 899, "70005")
    check("Jefferson parish detect", s1["parish"], "Jefferson")
    check("Jefferson tax on $899", s1["tax_collected"], "87.65")
    check("25% reserve on $449 profit", s1["income_reserve_25pct"], "112.25")

    # Sale to New Orleans (Orleans 70115): 10% on $350 = $35.00
    s2 = e.add_sale("FRANKS_STANDARD", "Antique Payphone Case", 75, 350, "70115")
    check("Orleans parish detect", s2["parish"], "Orleans")
    check("Orleans tax on $350", s2["tax_collected"], "35.00")

    # Out of state (Texas 75001): no LA tax
    s3 = e.add_sale("FRANKS_STANDARD", "Coin Album", 10, 40, "75001")
    check("Out-of-state no tax", s3["tax_collected"], "0.00")

    # Baton Rouge 70806: 10.5% on $100 = $10.50
    s4 = e.add_sale("BC_AUDIO", "RCA Cable Pack", 20, 100, "70806")
    check("Baton Rouge tax on $100", s4["tax_collected"], "10.50")

    # Expense + summary math
    e.add_expense("BC_AUDIO", "Shipping boxes", "25.50", "Supplies")
    s = e.report_summary("BC_AUDIO")
    check("BC revenue", s["gross_revenue"], "999.00")
    check("BC net profit", s["net_profit"], "503.50")
    check("BC tax to remit", s["sales_tax_to_remit"], "98.15")

    # Refund flow
    r = e.add_refund("FRANKS_STANDARD", s3["id"])
    check("Refund amount", r["amount"], "40.00")

    # License keys
    payload = "Test Customer|2027-01-01"
    sig = _license_signature(payload)
    good_key = "VS-" + base64.b32encode(payload.encode()).decode().strip("=") + "-" + sig
    ok, _ = verify_license_key("Test Customer", good_key)
    check("Valid license accepted", ok, "True")
    ok2, _ = verify_license_key("Wrong Name", good_key)
    check("Wrong-name license rejected", ok2, "False")
    bad_key = good_key[:-1] + ("A" if good_key[-1] != "A" else "B")
    ok3, _ = verify_license_key("Test Customer", bad_key)
    check("Tampered key rejected", ok3, "False")

    os.remove(test_db)
    print()
    if failures:
        print("FAILURES:")
        for f in failures:
            print("  [X] " + f)
        sys.exit(1)
    print(f"ALL {13} CHECKS PASSED - math verified accurate.")


if __name__ == "__main__":
    if "--test" in sys.argv:
        run_self_test()
    else:
        main_menu()
