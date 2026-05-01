const invoiceData = {
  customerName: "Company Pvt Ltd.",
  customerAddress: "Address line 1, Address line 2, City, State - 123456",
  customerGstin: "Customer GSTIN",
  invoiceGstin: "10AAFCG2475D1Z5",
  billNo: "Bill No. 001",
  billDate: "Bill Date",
  taxRate: 0.09,
  rows: [
    {
      description: "S GUARD",
      manMonth: 0,
      manDay: 74,
      billingRate: 11500
    }
  ]
};

const money = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const fields = {
  customerName: document.querySelector("#customerName"),
  customerAddress: document.querySelector("#customerAddress"),
  customerGstin: document.querySelector("#customerGstin"),
  invoiceGstin: document.querySelector("#invoiceGstin"),
  billNo: document.querySelector("#billNo"),
  billDate: document.querySelector("#billDate")
};

const views = {
  customerName: document.querySelector("#viewCustomerName"),
  customerAddress: document.querySelector("#viewCustomerAddress"),
  customerGstin: document.querySelector("#viewCustomerGstin"),
  invoiceGstin: document.querySelector("#viewInvoiceGstin"),
  billNo: document.querySelector("#viewBillNo"),
  billDate: document.querySelector("#viewBillDate")
};

const itemEditor = document.querySelector("#itemEditor");
const invoiceRows = document.querySelector("#invoiceRows");

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function roundRupees(value) {
  return Math.round(Number(value) || 0);
}

function rowAmount(row) {
  const rate = Number(row.billingRate) || 0;
  const months = Number(row.manMonth) || 0;
  const days = Number(row.manDay) || 0;
  return roundRupees(rate * months + (rate / 30) * days);
}

function formatMoney(value) {
  return money.format(roundRupees(value));
}

function numberToWordsIndian(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function underHundred(n) {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
  }

  function underThousand(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return `${hundred ? `${ones[hundred]} Hundred` : ""} ${rest ? underHundred(rest) : ""}`.trim();
  }

  if (num === 0) return "Zero";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;

  return [
    crore ? `${underThousand(crore)} Crore` : "",
    lakh ? `${underThousand(lakh)} Lakh` : "",
    thousand ? `${underThousand(thousand)} Thousand` : "",
    num ? underThousand(num) : ""
  ].filter(Boolean).join(" ");
}

function updateDataFromFields() {
  Object.keys(fields).forEach((key) => {
    invoiceData[key] = fields[key].value;
  });
}

function renderEditor() {
  Object.keys(fields).forEach((key) => {
    fields[key].value = invoiceData[key];
  });

  itemEditor.innerHTML = "";
  invoiceData.rows.forEach((row, index) => {
    const card = document.createElement("div");
    card.className = "item-card";

    [
      { label: "Description", key: "description", type: "text", className: "wide" },
      { label: "Man month", key: "manMonth", type: "number" },
      { label: "Man day", key: "manDay", type: "number" },
      { label: "Billing rate", key: "billingRate", type: "number" }
    ].forEach((field) => {
      const label = document.createElement("label");
      label.textContent = `${field.label} `;
      if (field.className) label.className = field.className;

      const input = document.createElement("input");
      input.dataset.row = index;
      input.dataset.key = field.key;
      input.type = field.type;
      input.value = row[field.key];
      if (field.type === "number") {
        input.min = "0";
        input.step = "0.01";
      }

      label.appendChild(input);
      card.appendChild(label);
    });

    const removeButton = document.createElement("button");
    removeButton.className = "remove-row";
    removeButton.type = "button";
    removeButton.dataset.remove = index;
    removeButton.textContent = "Remove row";
    card.appendChild(removeButton);
    itemEditor.appendChild(card);
  });
}

function renderInvoice() {
  updateDataFromFields();

  views.customerName.textContent = invoiceData.customerName;
  views.customerAddress.textContent = invoiceData.customerAddress;
  views.customerGstin.textContent = invoiceData.customerGstin;
  views.invoiceGstin.textContent = invoiceData.invoiceGstin;
  views.billNo.textContent = invoiceData.billNo;
  views.billDate.textContent = formatDate(invoiceData.billDate);

  invoiceRows.innerHTML = "";
  const visibleRows = 15;
  invoiceData.rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    [
      index + 1,
      row.description,
      Number(row.manMonth) || 0,
      Number(row.manDay) || 0,
      formatMoney(row.billingRate),
      formatMoney(rowAmount(row))
    ].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });
    invoiceRows.appendChild(tr);
  });

  for (let i = invoiceData.rows.length; i < visibleRows; i += 1) {
    const tr = document.createElement("tr");
    for (let cell = 0; cell < 6; cell += 1) {
      tr.appendChild(document.createElement("td"));
    }
    invoiceRows.appendChild(tr);
  }

  const total = invoiceData.rows.reduce((sum, row) => sum + rowAmount(row), 0);
  const cgst = roundRupees(total * invoiceData.taxRate);
  const sgst = roundRupees(total * invoiceData.taxRate);
  const grandTotal = total + cgst + sgst;

  document.querySelector("#totalAmount").textContent = formatMoney(total);
  document.querySelector("#cgstAmount").textContent = formatMoney(cgst);
  document.querySelector("#sgstAmount").textContent = formatMoney(sgst);
  document.querySelector("#grandTotal").textContent = formatMoney(grandTotal);
  document.querySelector("#amountWords").textContent = `${numberToWordsIndian(grandTotal)} Only.`;
}

Object.values(fields).forEach((input) => {
  input.addEventListener("input", renderInvoice);
});

itemEditor.addEventListener("input", (event) => {
  const input = event.target;
  const rowIndex = Number(input.dataset.row);
  const key = input.dataset.key;
  if (!Number.isNaN(rowIndex) && key) {
    invoiceData.rows[rowIndex][key] = input.type === "number" ? Number(input.value) : input.value;
    renderInvoice();
  }
});

itemEditor.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  invoiceData.rows.splice(Number(button.dataset.remove), 1);
  renderEditor();
  renderInvoice();
});

document.querySelector("#addRowBtn").addEventListener("click", () => {
  invoiceData.rows.push({
    description: "",
    manMonth: 0,
    manDay: 0,
    billingRate: 0
  });
  renderEditor();
  renderInvoice();
});

document.querySelector("#printBtn").addEventListener("click", () => window.print());

renderEditor();
renderInvoice();
