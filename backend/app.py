from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from supabase import create_client, Client


app = Flask(__name__)
CORS(app)

SUPABASE_URL = "https://ieoyvwgklozreyvdhabr.supabase.co"
SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllb3l2d2drbG96cmV5dmRoYWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzg0NjQsImV4cCI6MjA2OTgxNDQ2NH0."
    "RmT5Augx2WthlPC6KYhoR3VEt7tvfQPIfUNiilyJdYk"
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


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
    print("Dados recebidos:", data)

    if not data or not all(k in data for k in ['description', 'amount', 'date', 'category', 'type']):
        return jsonify({'error': 'Missing data'}), 400

    try:
        transaction = {
            'description': data['description'],
            'amount': float(data['amount']),
            'date': data['date'],
            'category': data['category'],
            'type': data['type']
        }
        response = supabase.table('transactions').insert(transaction).execute()

        if response.data and len(response.data) > 0:
            return jsonify(response.data[0]), 201
        else:
            return jsonify({'error': 'Failed to insert data into Supabase'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400
    try:
        update_data = {
            'description': data.get('description'),
            'amount': float(data.get('amount')),
            'date': data.get('date'),
            'category': data.get('category'),
            'type': data.get('type')
        }
        response = supabase.table('transactions').update(update_data).eq('id', transaction_id).execute()
        if response.data:
            return jsonify(response.data[0]), 200
        else:
            return jsonify({'error': 'Transaction not found or failed to update'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Rota para excluir uma transação (DELETE) ---
@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        response = supabase.table('transactions').delete().eq('id', transaction_id).execute()
        if response.data:
            return jsonify({'message': 'Transaction deleted successfully'}), 200
        else:
            return jsonify({'error': 'Transaction not found or failed to delete'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Nova Rota para Relatórios ---
@app.route('/api/reports', methods=['GET'])
def get_report():
    month_filter = request.args.get('month')
    if not month_filter:
        return jsonify({'error': 'Month parameter is required'}), 400

    try:
        year, month = map(int, month_filter.split('-'))

        response = supabase.table('transactions').select("category", "amount") \
            .eq('type', 'expense') \
            .gte('date', f'{year}-{month:02d}-01') \
            .lte('date', f'{year}-{month:02d}-31') \
            .execute()
        expenses_by_category = defaultdict(float)
        for transaction in response.data:
            expenses_by_category[transaction['category']] += abs(transaction['amount'])
        report_data = {
            'labels': list(expenses_by_category.keys()),
            'data': list(expenses_by_category.values())
        }
        return jsonify(report_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# --- Rodar o servidor ---
if __name__ == '__main__':
    app.run(debug=True)
