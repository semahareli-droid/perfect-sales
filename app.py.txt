from flask import Flask, render_template, request, jsonify
from datetime import datetime
import uuid

app = Flask(__name__)

# Store sales temporarily in memory
sales = []


class Sale:
    """
    Represents an individual sale.
    """

    def __init__(
        self,
        product_name,
        quantity,
        price,
        sale_id=None
    ):
        if not product_name or not product_name.strip():
            raise ValueError("Product name cannot be empty.")

        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero.")

        if price <= 0:
            raise ValueError("Price must be greater than zero.")

        self.id = sale_id or str(uuid.uuid4())
        self.product_name = product_name.strip()
        self.quantity = int(quantity)
        self.price = float(price)
        self.total = round(self.quantity * self.price, 2)
        self.date = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

    def to_dict(self):
        return {
            "id": self.id,
            "item": self.product_name,
            "quantity": self.quantity,
            "price": self.price,
            "total": self.total,
            "date": self.date
        }


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/sales", methods=["GET"])
def get_sales():
    return jsonify([
        sale.to_dict()
        for sale in sales
    ])


@app.route("/api/sales", methods=["POST"])
def add_sale():

    data = request.get_json()

    try:
        item = data.get("item", "").strip()
        quantity = int(data.get("quantity", 0))
        price = float(data.get("price", 0))

        sale = Sale(
            item,
            quantity,
            price
        )

        sales.append(sale)

        return jsonify({
            "success": True,
            "sale": sale.to_dict()
        }), 201

    except (ValueError, TypeError) as error:

        return jsonify({
            "success": False,
            "error": str(error)
        }), 400


@app.route("/api/sales/<sale_id>", methods=["DELETE"])
def delete_sale(sale_id):

    global sales

    original_length = len(sales)

    sales = [
        sale for sale in sales
        if sale.id != sale_id
    ]

    if len(sales) == original_length:
        return jsonify({
            "success": False,
            "error": "Sale not found."
        }), 404

    return jsonify({
        "success": True,
        "message": "Sale deleted."
    })


@app.route("/api/summary", methods=["GET"])
def get_summary():

    total_sales = sum(
        sale.total for sale in sales
    )

    total_units = sum(
        sale.quantity for sale in sales
    )

    item_totals = {}

    for sale in sales:

        item = sale.product_name

        if item not in item_totals:
            item_totals[item] = 0

        item_totals[item] += sale.quantity

    best_item = "None"

    if item_totals:
        best_item = max(
            item_totals,
            key=item_totals.get
        )

    return jsonify({
        "total_sales": round(total_sales, 2),
        "transactions": len(sales),
        "units": total_units,
        "best_item": best_item
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )