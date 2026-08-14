const form = document.getElementById("saleForm");

const table = document.getElementById("salesTable");

const totalSales = document.getElementById("totalSales");
const transactions = document.getElementById("transactions");
const units = document.getElementById("units");
const bestItem = document.getElementById("bestItem");

const serverStatus = document.getElementById("serverStatus");


// ----------------------------------
// Load Sales
// ----------------------------------

async function loadSales() {

    try {

        const response = await fetch("/api/sales");

        if (!response.ok) {
            throw new Error("Unable to load sales.");
        }

        const sales = await response.json();

        displaySales(sales);

        serverStatus.textContent =
            "🟢 Connected to Server";

        serverStatus.className = "online";

    } catch (error) {

        console.error(error);

        serverStatus.textContent =
            "🔴 Server Connection Error";

        serverStatus.className = "offline";
    }
}


// ----------------------------------
// Display Sales
// ----------------------------------

function displaySales(sales) {

    table.innerHTML = "";

    sales.forEach(sale => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(sale.item)}</td>

            <td>${sale.quantity}</td>

            <td>GHS ${Number(sale.price).toFixed(2)}</td>

            <td>GHS ${Number(sale.total).toFixed(2)}</td>

            <td>${sale.date}</td>

            <td>
                <button
                    class="delete-btn"
                    onclick="deleteSale('${sale.id}')">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}


// ----------------------------------
// Add Sale
// ----------------------------------

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const item =
        document.getElementById("item").value;

    const quantity =
        document.getElementById("quantity").value;

    const price =
        document.getElementById("price").value;


    try {

        const response = await fetch("/api/sales", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                item: item,
                quantity: quantity,
                price: price
            })
        });


        const data = await response.json();


        if (!response.ok) {

            alert(data.error || "Could not add sale.");

            return;
        }


        form.reset();

        await loadSales();

        await loadSummary();

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");
    }
});


// ----------------------------------
// Delete Sale
// ----------------------------------

async function deleteSale(id) {

    const confirmed =
        confirm("Are you sure you want to delete this sale?");

    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(`/api/sales/${id}`, {
                method: "DELETE"
            });


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.error || "Could not delete sale.");

            return;
        }


        await loadSales();

        await loadSummary();

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");
    }
}


// ----------------------------------
// Load Summary
// ----------------------------------

async function loadSummary() {

    try {

        const response =
            await fetch("/api/summary");


        if (!response.ok) {
            throw new Error("Unable to load summary.");
        }


        const data =
            await response.json();


        totalSales.textContent =
            `GHS ${Number(data.total_sales).toFixed(2)}`;

        transactions.textContent =
            data.transactions;

        units.textContent =
            data.units;

        bestItem.textContent =
            data.best_item;


    } catch (error) {

        console.error(error);
    }
}


// ----------------------------------
// Security Helper
// ----------------------------------

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// ----------------------------------
// Start Application
// ----------------------------------

loadSales();

loadSummary();