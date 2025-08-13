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
        response = supabase.table('transactions').select("*").order('date', desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()
    data['is_paid'] = data.get('is_paid', True)
    try:
        response = supabase.table('transactions').insert(data).execute()
        return jsonify(response.data[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    data = request.get_json()
    try:
        response = supabase.table('transactions').update(data).eq('id', transaction_id).execute()
        return jsonify(response.data[0]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        supabase.table('transactions').delete().eq('id', transaction_id).execute()
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
    if not data or not all(k in data for k in ['category', 'limit', 'month']):
        return jsonify({'error': 'Missing data'}), 400
    try:
        response = supabase.table('budgets').insert(data).execute()
        if response.data and len(response.data) > 0:
            return jsonify(response.data[0]), 201
        else:
            return jsonify({'error': 'Falha ao inserir dados no Supabase', 'details': str(response.error)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/budgets/<int:budget_id>', methods=['PUT'])
def update_budget(budget_id):
    data = request.get_json()
    if not data or 'limit' not in data:
        return jsonify({'error': 'Missing limit data'}), 400
    try:
        update_data = {'limit': float(data['limit'])}
        response = supabase.table('budgets').update(update_data).eq('id', budget_id).execute()
        if response.data:
            return jsonify(response.data[0]), 200
        return jsonify({'error': 'Budget not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets/<int:budget_id>', methods=['DELETE'])
def delete_budget(budget_id):
    try:
        response = supabase.table('budgets').delete().eq('id', budget_id).execute()
        if response.data:
            return jsonify({'message': 'Deleted'}), 200
        return jsonify({'error': 'Budget not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500









# --- Novas Rotas para Metas de Poupança ---

@app.route('/api/goals', methods=['GET'])
def get_goals():
    try:
        response = supabase.table('goals').select("*").order('created_at').execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/goals', methods=['POST'])
def add_goal():
    data = request.get_json()
    if not data or not all(k in data for k in ['name', 'target_amount']):
        return jsonify({'error': 'Missing data'}), 400
    try:
        goal_data = {
            'name': data['name'],
            'target_amount': float(data['target_amount']),
            'saved_amount': float(data.get('saved_amount', 0))
        }
        response = supabase.table('goals').insert(goal_data).execute()
        if response.data:
            return jsonify(response.data[0]), 201
        else:
            return jsonify({'error': 'Failed to create goal'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/goals/<int:goal_id>', methods=['PUT'])
def update_goal(goal_id):
    data = request.get_json()
    try:
        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name']
        if 'target_amount' in data:
            update_data['target_amount'] = float(data['target_amount'])
        if 'saved_amount' in data:
            update_data['saved_amount'] = float(data['saved_amount'])

        response = supabase.table('goals').update(update_data).eq('id', goal_id).execute()
        if response.data:
            return jsonify(response.data[0]), 200
        else:
            return jsonify({'error': 'Meta não encontrada'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    try:
        response = supabase.table('goals').delete().eq('id', goal_id).execute()
        if response.data:
            return jsonify({'message': 'Meta excluída com sucesso'}), 200
        else:
            return jsonify({'error': 'Meta não encontrada'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500










if __name__ == '__main__':
    app.run(debug=True)
