from flask import Flask, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.route("/api/dashboard-summary")
def get_dashboard_summary():
    summary_data = {
        "balances": {
            "total": 12450.75,
            "income": 7500.00,
            "expense": 4890.30,
            "savings": 2609.70
        },
        "expensesByCategory": {
            "labels": ['Moradia', 'Transporte', 'Alimentação', 'Lazer', 'Saúde', 'Outros'],
            "data": [1850.50, 760.00, 1230.80, 450.00, 300.00, 299.00]
        },
        "incomeVsExpense": {
            "labels": ['Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
            "incomeData": [6500, 6800, 7200, 7100, 7400, 7500],
            "expenseData": [4200, 4500, 4100, 5200, 4750, 4890.30]
        }
    }
    return jsonify(summary_data)

# Permite executar o servidor com 'python app.py'
if __name__ == '__main__':
    app.run(debug=True, port=5000)