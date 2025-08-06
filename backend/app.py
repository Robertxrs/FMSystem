from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from datetime import datetime
from collections import defaultdict

app = Flask(__name__)
CORS(app)

SUPABASE_URL = "https://ieoyvwgklozreyvdhabr.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllb3l2d2drbG96cmV5dmRoYWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzg0NjQsImV4cCI6MjA2OTgxNDQ2NH0.RmT5Augx2WthlPC6KYhoR3VEt7tvfQPIfUNiilyJdYk"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route("/api/stats", methods=["GET"])
def get_dashboard_stats():
    try:
        resp = supabase.table("transactions").select("*").execute()
        txs = resp.data

        saldo_total = sum(t["amount"] for t in txs)
        now = datetime.now()
        receitas_mes = sum(t["amount"] for t in txs
                          if datetime.strptime(t["date"], '%Y-%m-%d').year == now.year
                          and datetime.strptime(t["date"], '%Y-%m-%d').month == now.month
                          and t["type"] == "income")
        despesas_mes = sum(t["amount"] for t in txs
                           if datetime.strptime(t["date"], '%Y-%m-%d').year == now.year
                           and datetime.strptime(t["date"], '%Y-%m-%d').month == now.month
                           and t["type"] == "expense")

        economia_mes = receitas_mes + despesas_mes

        return jsonify({
            "saldoTotal": saldo_total,
            "receitasMes": receitas_mes,
            "despesasMes": abs(despesas_mes),
            "economiaMes": economia_mes
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    try:
        resp = supabase.table('transactions').select("*").order('date', desc=True).execute()
        return jsonify(resp.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()
    if not data or not all(k in data for k in ('description', 'amount', 'date', 'category', 'type')):
        return jsonify({'error': 'Missing data'}), 400
    try:
        transaction = {
            'description': data['description'],
            'amount': float(data['amount']),
            'date': data['date'],
            'category': data['category'],
            'type': data['type']
        }
        resp = supabase.table('transactions').insert(transaction).execute()
        return jsonify(resp.data[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    data = request.get_json()
    try:
        resp = supabase.table('transactions').update(data).eq('id', transaction_id).execute()
        return jsonify(resp.data[0]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        resp = supabase.table('transactions').delete().eq('id', transaction_id).execute()
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports', methods=['GET'])
def get_report():
    month = request.args.get('month', '')
    try:
        year, mon = map(int, month.split('-'))
        resp = supabase.table('transactions') \
            .select("category", "amount") \
            .eq('type', 'expense') \
            .gte('date', f'{year}-{mon:02d}-01') \
            .lte('date', f'{year}-{mon:02d}-31') \
            .execute()
        by_cat = defaultdict(float)
        for t in resp.data:
            by_cat[t['category']] += abs(t['amount'])
        return jsonify({
            'labels': list(by_cat.keys()),
            'data': list(by_cat.values())
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets', methods=['GET'])
def get_budgets_with_progress():
    month = request.args.get('month', '')
    if not month:
        return jsonify({'error': 'Month parameter is required'}), 400

    try:
        b_resp = supabase.table('budgets').select('*').eq('month', month).execute()
        budgets = b_resp.data

        year, mon = map(int, month.split('-'))
        e_resp = supabase.table('transactions') \
            .select('category', 'amount') \
            .eq('type', 'expense') \
            .gte('date', f'{year}-{mon:02d}-01') \
            .lte('date', f'{year}-{mon:02d}-31') \
            .execute()
        spent = defaultdict(float)
        for e in e_resp.data:
            spent[e['category']] += abs(e['amount'])

        result = [{
            'id': b['id'],
            'category': b['category'],
            'limit': b['limit'],
            'spent': spent.get(b['category'], 0)
        } for b in budgets]

        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets', methods=['POST'])
def add_budget():
    data = request.get_json()
    if not data or not all(k in data for k in ('category', 'limit', 'month')):
        return jsonify({'error': 'Missing data'}), 400
    try:
        resp = supabase.table('budgets').insert(data).execute()
        return jsonify(resp.data[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
